const express = require('express');
const { db } = require('../firebaseConfig');
const router = express.Router();

// This is a placeholder for your actual mock plans data.
// In a real application, you would populate this from a database.
const { mockPlans } = require('../mockData'); 

// GET /api/plans - Get all tariff plans
router.get('/', async (req, res) => {
    try {
        // For this demo, we'll return the hardcoded mock plans derived from your CSV.
        // For a production app, you would fetch from the 'plans' collection in Firestore.
        /*
            const plansSnapshot = await db.collection('plans').get();
            const allPlans = plansSnapshot.docs.map(doc => doc.data());
            res.status(200).json(allPlans);
        */
        res.status(200).json(mockPlans);
    } catch (error) {
        console.error("Error fetching plans:", error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

module.exports = router;

