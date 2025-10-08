const express = require('express');
const { db } = require('../firebaseConfig');
const router = express.Router();
const { admin } = require('../firebaseConfig');

// POST /api/dataxchange/list - List data for sale
router.post('/list', async (req, res) => {
    try {
        const { sellerId, sellerName, dataAmount, sellerPrice } = req.body;
        const commission = 10; // 10 credits commission for TariffGenie

        const newListing = {
            sellerId,
            seller: sellerName, // This is the display name e.g., "User...f3d2"
            data: dataAmount,
            price: sellerPrice + commission, // Final price for buyer
            sellerGets: sellerPrice, // Amount the seller receives
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        };

        const docRef = await db.collection('dataListings').add(newListing);
        res.status(201).send({ message: 'Data listed successfully!', id: docRef.id });
    } catch (error) {
        console.error("Error listing data:", error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// POST /api/dataxchange/buy - Buy a data listing
router.post('/buy', async (req, res) => {
    const { listingId, buyerId } = req.body;

    const listingRef = db.collection('dataListings').doc(listingId);
    const buyerRef = db.collection('users').doc(buyerId);

    try {
        await db.runTransaction(async (transaction) => {
            const listingDoc = await transaction.get(listingRef);
            if (!listingDoc.exists || listingDoc.data().status !== 'active') {
                throw new Error('Listing is not available.');
            }

            const buyerDoc = await transaction.get(buyerRef);
            if (!buyerDoc.exists) {
                throw new Error('Buyer not found.');
            }

            const listing = listingDoc.data();
            const buyer = buyerDoc.data();

            if (buyer.walletBalance < listing.price) {
                throw new Error('Insufficient credits.');
            }
            
            if (listing.sellerId === buyerId) {
                throw new Error('You cannot buy your own listing.');
            }

            const sellerRef = db.collection('users').doc(listing.sellerId);
            const sellerDoc = await transaction.get(sellerRef);
             if (!sellerDoc.exists) {
                throw new Error('Seller not found.');
            }

            // 1. Deduct price from buyer's wallet
            transaction.update(buyerRef, { walletBalance: buyer.walletBalance - listing.price });
            
            // 2. Add earnings to seller's wallet
            transaction.update(sellerRef, { walletBalance: sellerDoc.data().walletBalance + listing.sellerGets });

            // 3. Mark the listing as 'sold'
            transaction.update(listingRef, { status: 'sold', buyerId: buyerId });
        });

        res.status(200).send({ message: 'Purchase successful!' });
    } catch (error) {
        console.error("Transaction failed: ", error);
        res.status(500).send({ message: error.message || 'Transaction failed.' });
    }
});


module.exports = router;

