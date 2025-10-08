// Import the Firebase Admin SDK
const admin = require('firebase-admin');
// Import environment variables
require('dotenv').config();

// Check if the Firebase config is available in environment variables
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT environment variable is not set. Please check your .env file.');
}

// Parse the service account key from the environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get a reference to the Firestore database
const db = admin.firestore();

// Export the admin SDK and the database reference
module.exports = { admin, db };

