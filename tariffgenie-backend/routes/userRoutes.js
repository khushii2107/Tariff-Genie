const express = require('express');
const router = express.Router();
const { db } = require('../firebaseConfig');
const { mockPlans } = require('../mockData'); // Correctly import mock plans

// POST /api/users/login
router.post('/login', async (req, res) => {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) {
        return res.status(400).json({ message: 'A valid 10-digit phone number is required.' });
    }
    try {
        const userRef = db.collection('users').doc(phone);
        const doc = await userRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Account not found. Please register to continue.' });
        }
        res.status(200).json({ message: 'Login successful!', user: doc.data() });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/users/register
router.post('/register', async (req, res) => {
    const { phone, dob, location } = req.body;

    // Basic Validation
    if (!phone || !dob || !location || phone.length !== 10) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('phone', '==', phone).get();

        if (!snapshot.empty) {
            return res.status(400).json({ message: 'This phone number is already registered.' });
        }

        // FIX: Assign a random starter plan, just like in the original frontend logic
        const randomPlan = mockPlans.find(p => p.operator === 'TariffGenie') || mockPlans[0];
        if (!randomPlan) {
             return res.status(500).json({ message: 'Could not assign a starter plan. No plans available.' });
        }

        const newUser = {
            phone,
            dob,
            location,
            subscriptionTier: 'None',
            walletBalance: 100,
            recommendationCredits: 10,
            transactionHistory: [],
            purchasedPlan: { ...randomPlan, purchaseDate: new Date().toISOString() },
            purchaseHistory: [{ ...randomPlan, purchaseDate: new Date().toISOString() }]
        };

        await usersRef.doc(phone).set(newUser);
        
        res.status(201).json({ message: "Registration successful! You've received a starter plan, 100 bonus credits, and 10 free recommendations." });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/users/update
// (This would be used for updating user details, subscriptions, etc.)
router.post('/update', async (req, res) => {
    const { phone, updatedData } = req.body;
     if (!phone || !updatedData) {
        return res.status(400).json({ message: 'User phone and updated data are required.' });
    }
    try {
        const userRef = db.collection('users').doc(phone);
        await userRef.update(updatedData);
        const updatedDoc = await userRef.get();
        res.status(200).json({ message: 'User updated successfully', user: updatedDoc.data() });
    } catch(error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;

