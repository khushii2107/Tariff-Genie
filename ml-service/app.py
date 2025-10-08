import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MultiLabelBinarizer, LabelEncoder
from sklearn.neighbors import NearestNeighbors
import lightgbm as lgb
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# =========================
# 1. Initialize Flask App
# =========================
app = Flask(__name__)
CORS(app) # Enable Cross-Origin requests

# =========================
# 2. Global Variables for Models & Preprocessors
# =========================
plans_proc = None
plan_le = None
pref_model = None
hist_model = None
plan_feature_cols = []

# =========================
# 3. Data Loading and Preprocessing Logic (from your script)
# =========================
def load_and_preprocess_data():
    global plans_proc, plan_le, pref_model, hist_model, plan_feature_cols

    # --- Load Data ---
    HISTORY_CSV = "customer_history_final.csv"
    PREFERENCES_CSV = "customer_preferences_final.csv"
    PLANS_CSV = "plan_dataset (1).csv"
    
    # Check if files exist
    for f in [HISTORY_CSV, PREFERENCES_CSV, PLANS_CSV]:
        if not os.path.exists(f):
            raise FileNotFoundError(f"Missing required CSV file: {f}. Please add it to the 'ml-service' directory.")

    history_df = pd.read_csv(HISTORY_CSV)
    preferences_df = pd.read_csv(PREFERENCES_CSV)
    plans_df = pd.read_csv(PLANS_CSV)
    print("Loaded shapes -> history:", history_df.shape, "preferences:", preferences_df.shape, "plans:", plans_df.shape)

    # --- Preprocess Plans ---
    def _cap_unlimited(x, cap=1000.0):
        if isinstance(x, str) and x.strip().lower() == "unlimited": return float(cap)
        try: return float(x)
        except Exception: return np.nan

    plans_df["Calls_per_day_num"] = plans_df.get("Calls_per_day", 0).apply(lambda v: _cap_unlimited(v))
    plans_df["SMS_per_day_num"] = plans_df.get("SMS_per_day", 0).apply(lambda v: _cap_unlimited(v))

    def _split_ott(x):
        if not isinstance(x, str): return []
        s = x.strip()
        if s == "" or s.lower() in {"no ott", "none", "no"}: return []
        return [t.strip() for t in s.split(",") if t.strip()]

    plans_df["OTT_raw"] = plans_df.get("OTT_included", "").fillna("").astype(str)
    plans_df["ott_list"] = plans_df["OTT_raw"].apply(_split_ott)

    mlb_ott = MultiLabelBinarizer()
    ott_hot = pd.DataFrame(mlb_ott.fit_transform(plans_df["ott_list"]),
                           columns=[f"OTT_{c}" for c in mlb_ott.classes_],
                           index=plans_df.index).astype(int)

    speed_vals = sorted(plans_df["Speed"].dropna().unique().tolist())
    speed_hot = pd.DataFrame({f"Speed_{s}": (plans_df["Speed"] == s).astype(int) for s in speed_vals},
                             index=plans_df.index)

    plans_proc = pd.concat([plans_df, ott_hot, speed_hot], axis=1)

    plan_feature_cols_base = ["Price", "Data_per_day_GB", "Calls_per_day_num", "SMS_per_day_num", "Validity_days"]
    ott_cols = list(ott_hot.columns)
    speed_cols = list(speed_hot.columns)
    plan_feature_cols = plan_feature_cols_base + ott_cols + speed_cols

    for c in plan_feature_cols_base:
        if c not in plans_proc.columns: plans_proc[c] = 0.0
        plans_proc[c] = plans_proc[c].astype(float).fillna(0.0)
    
    plans_proc[ott_cols] = plans_proc[ott_cols].astype(int)
    plans_proc[speed_cols] = plans_proc[speed_cols].astype(int)

    plan_le = LabelEncoder()
    plans_proc["Plan_Label"] = plan_le.fit_transform(plans_proc["Plan_ID"].astype(str).values)

    # --- Preprocess Preferences for Training ---
    def _pref_row_to_features_aligned(row, plan_feature_cols_local):
        price_target, _ = (lambda b: (149.0, (0.0, 199.0)) if b == "low" else (299.0, (200.0, 499.0)) if b == "medium" else (599.0, (500.0, 10_000.0)) if b == "high" else (300.0, (0.0, 10_000.0)))(str(row.get("Budget_Range", "")).strip().lower())
        
        numeric_map = {
            "Price": float(price_target),
            "Data_per_day_GB": float(_cap_unlimited(row.get("Preferred_Data_GB", 0.0))),
            "Calls_per_day_num": float(_cap_unlimited(row.get("Preferred_Calls", 0.0))),
            "SMS_per_day_num": float(_cap_unlimited(row.get("Preferred_SMS", 0.0))),
            "Validity_days": float(row.get("Preferred_Validity", 28.0)),
        }
        pref_ott = str(row.get("Preferred_OTT", "") or "").strip().lower()
        pref_speed = str(row.get("Preferred_Speed", "") or "").strip().lower()
        
        vec = []
        for col in plan_feature_cols_local:
            if col in numeric_map: vec.append(numeric_map[col])
            elif col.startswith("OTT_"): vec.append(1.0 if pref_ott == col.split("OTT_", 1)[1].lower() else 0.0)
            elif col.startswith("Speed_"): vec.append(1.0 if pref_speed == col.split("Speed_", 1)[1].lower() else 0.0)
            else: vec.append(0.0)
        return np.asarray(vec, dtype=float)

    X_pref = np.vstack([
        _pref_row_to_features_aligned(preferences_df.iloc[i].to_dict(), plan_feature_cols)
        for i in range(len(preferences_df))
    ]).astype(float)
    
    _nn_plans = NearestNeighbors(metric="euclidean").fit(plans_proc[plan_feature_cols].to_numpy(dtype=float))
    _, indices = _nn_plans.kneighbors(X_pref, n_neighbors=1)
    y_pref = plans_proc.iloc[indices.flatten()]["Plan_Label"].values

    # --- Train Models ---
    print("Training LightGBM (Preferences Mode)...")
    pref_model = lgb.LGBMClassifier(objective="multiclass", num_class=len(plan_le.classes_), random_state=42)
    pref_model.fit(pd.DataFrame(X_pref, columns=plan_feature_cols), y_pref)
    
    print("\nModel training complete and ready to serve recommendations.")


# =========================
# 4. API Recommendation Endpoint
# =========================
@app.route('/recommend', methods=['POST'])
def recommend():
    if not pref_model:
        return jsonify({"error": "Model is not trained yet."}), 503

    # Get user preferences from the request
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    # Convert frontend preferences to the format the model expects
    pref_row = {
        "Budget_Range": data.get("userPersona"),
        "Preferred_Data_GB": data.get("dataNeed"),
        "Preferred_Calls": data.get("calls"),
        "Preferred_SMS": data.get("sms"),
        "Preferred_Validity": data.get("validity")[0] if data.get("validity") else 28,
        "Preferred_OTT": data.get("ottServices")[0] if data.get("ottServices") else "No OTT",
        "Preferred_Speed": data.get("speed")
    }

    # Align features for prediction
    def _align_features_for_prediction(row, plan_feature_cols_local):
        price_target, _ = (lambda b: (149.0, (0.0, 199.0)) if b == "low" else (299.0, (200.0, 499.0)) if b == "medium" else (599.0, (500.0, 10_000.0)) if b == "high" else (300.0, (0.0, 10_000.0)))(str(row.get("Budget_Range", "")).strip().lower())
        
        numeric_map = {
            "Price": float(price_target),
            "Data_per_day_GB": float(_cap_unlimited(row.get("Preferred_Data_GB", 0.0))),
            "Calls_per_day_num": float(_cap_unlimited(row.get("Preferred_Calls", 0.0))),
            "SMS_per_day_num": float(_cap_unlimited(row.get("Preferred_SMS", 0.0))),
            "Validity_days": float(row.get("Preferred_Validity", 28.0)),
        }
        pref_ott = str(row.get("Preferred_OTT", "") or "").strip().lower()
        pref_speed = str(row.get("Preferred_Speed", "") or "").strip().lower()
        
        vec = []
        for col in plan_feature_cols_local:
            if col in numeric_map: vec.append(numeric_map[col])
            elif col.startswith("OTT_"): vec.append(1.0 if pref_ott in col.split("OTT_", 1)[1].lower() else 0.0)
            elif col.startswith("Speed_"): vec.append(1.0 if pref_speed == col.split("Speed_", 1)[1].lower() else 0.0)
            else: vec.append(0.0)
        return np.asarray(vec, dtype=float)

    vec = _align_features_for_prediction(pref_row, plan_feature_cols).reshape(1, -1)
    proba = pref_model.predict_proba(pd.DataFrame(vec, columns=plan_feature_cols))
    
    top_k = 3
    top_indices = np.argsort(proba[0])[-top_k:][::-1]
    top_plans_ids = plan_le.inverse_transform(top_indices)

    return jsonify({"recommended_plan_ids": top_plans_ids.tolist()})

# =========================
# 5. Run the Application
# =========================
if __name__ == '__main__':
    try:
        load_and_preprocess_data()
        port = int(os.environ.get('PORT', 5001))
        app.run(host='0.0.0.0', port=port, debug=True)
    except FileNotFoundError as e:
        print(f"FATAL ERROR: {e}")
        print("Please make sure all three CSV files (customer_history_final.csv, customer_preferences_final.csv, plan_dataset (1).csv) are in the 'ml-service' directory before running.")

