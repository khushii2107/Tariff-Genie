import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// Helper function to parse OTT strings from the new dataset
const parseOtt = (ottString) => {
    if (!ottString || ottString.toLowerCase() === 'none') return [];
    const normalized = ottString.toLowerCase();
    const services = [];
    if (normalized.includes('disney') || normalized.includes('hotstar')) {
        services.push('Disney+ Hotstar');
    }
    if (normalized.includes('netflix')) {
        services.push('Netflix');
    }
    if (normalized.includes('amazon') || normalized.includes('prime')) {
        services.push('Amazon Prime');
    }
    return [...new Set(services)];
};

const planCategories = [
    { name: 'Binge Watcher', tag: 'Binge Watcher', description: 'Lots of data & OTT apps for endless streaming.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14.553 1.106a.75.75 0 00-1.106 0l-3.25 3.25a.75.75 0 001.106 1.106L16 8.707l-2.293 2.293a.75.75 0 001.106 1.106l2.5-2.5a.75.75 0 000-1.106l-2.5-2.5zM4.25 10.5a.75.75 0 000 1.5h4a.75.75 0 000-1.5h-4z" /></svg> },
    { name: 'Gaming Pro', tag: 'Gaming Pro', description: 'High-speed, high-data plans for smooth gameplay.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.5 7.062A3.5 3.5 0 0110 5.5a3.502 3.502 0 013.438 2.938a.5.5 0 00.937-.344A4.5 4.5 0 005.5 8.5a.5.5 0 00.938.344A3.502 3.502 0 016.5 7.062zM10 12.5a.5.5 0 00-.5.5v1a.5.5 0 001 0v-1a.5.5 0 00-.5-.5zM7.5 11a.5.5 0 000-1h-1a.5.5 0 000 1h1zM13.5 10a.5.5 0 00-1 0v1a.5.5 0 001 0v-1z" clipRule="evenodd" /></svg> },
    { name: 'Budget Saver', tag: 'Budget Saver', description: 'Great value plans that are light on your wallet.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.158-.103.346-.195.556-.27.228-.082.473-.149.733-.205.26-.057.534-.099.816-.128.282-.029.568-.044.857-.044.288 0 .573.015.857.044.282.03.556.071.816.128.26.056.505.123.733.205.21.075.398.167.556.27l.42-.42a.75.75 0 00-1.06-1.06l-.419.419a2.352 2.352 0 00-1.802-.82c-.443-.03-.893-.044-1.35-.044s-.907.014-1.35.044a2.352 2.352 0 00-1.802.82l-.42-.419a.75.75 0 00-1.06 1.06l.42.42z" /><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.518a2.352 2.352 0 011.802.82l.42-.419a.75.75 0 111.06 1.06l-.42.42a4.118 4.118 0 010 5.298l.42.42a.75.75 0 11-1.06 1.06l-.42-.42a2.352 2.352 0 01-1.802.82v.518A.75.75 0 0110 18a.75.75 0 01-.75-.75v-.518a2.352 2.352 0 01-1.802-.82l-.42.419a.75.75 0 01-1.06-1.06l.42-.42a4.118 4.118 0 010-5.298l-.42-.42a.75.75 0 011.06-1.06l.42.42A2.352 2.352 0 019.25 3.268V2.75A.75.75 0 0110 2zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" /></svg> },
    { name: 'Yearly Plan', tag: 'Yearly Plan', description: 'Set it and forget it with long-term validity.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg> },
];

const mockMarketData = { 'Jio': 5200, 'Airtel': 4800, 'BSNL': 2500, 'TariffGenie': 7800, };
const operatorColors = { 'Jio': '#26667F', 'Airtel': '#67C090', 'BSNL': '#124170', 'TariffGenie': '#F9A826',};

const OPERATORS = ['Jio', 'Airtel', 'BSNL', 'TariffGenie'];
const VALIDITY_OPTIONS = [28, 56, 84, 180, 365];
const SPEED_OPTIONS = ['5G', '4G', 'no preference'];
const OTT_SERVICES = ['Netflix', 'Amazon Prime', 'Disney+ Hotstar'];
const CALLS_OPTIONS = ['Any', '100', '200', '300', 'Unlimited'];
const SMS_OPTIONS = ['Any', '50', '100', '200', 'Unlimited'];
const indianCities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur"];

const Logo = ({ className }) => (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#67C090' }} />
                <stop offset="100%" style={{ stopColor: '#26667F' }} />
            </linearGradient>
        </defs>
        <path d="M50 95C25.1 95 5 74.9 5 50S25.1 5 50 5s45 20.1 45 45-20.1 45-45 45z" fill="url(#logoGradient)"/>
        <path d="M62.2 43.6c-2-2.5-4.4-4.6-7-6.2-2.6-1.6-5.5-2.7-8.5-3.3-3-.6-6-1-9-1.3-1.5-.1-3-.2-4.5-.2-2.4 0-4.8.3-7.1.8" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeMiterlimit="10"/>
        <path d="M22.9 56.4c2 2.5 4.4 4.6 7 6.2 2.6 1.6 5.5 2.7 8.5 3.3 3 .6 6 1 9 1.3 1.5.1 3 .2 4.5.2 2.4 0 4.8-.3 7.1-.8" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeMiterlimit="10"/>
        <path d="M49.9 22.9c-2.5 2-4.6 4.4-6.2 7-1.6 2.6-2.7 5.5-3.3 8.5-.6 3-1 6-1.3 9-.1 1.5-.2 3-.2 4.5 0 2.4.3 4.8.8 7.1" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeMiterlimit="10"/>
        <path d="M77.1 43.6c-2-2.5-4.4-4.6-7-6.2-2.6-1.6-5.5-2.7-8.5-3.3-3-.6-6-1-9-1.3-1.5-.1-3-.2-4.5-.2-2.4 0-4.8.3-7.1.8" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeMiterlimit="10" transform="rotate(180 50 50)"/>
        <circle cx="50" cy="50" r="10" fill="#F9A826" />
    </svg>
);

const PlansGrid = ({ plans, plansToCompare, handleCompareChange, showCompare, onBuyNow }) => {
    if (plans.length === 0) return <div className="bg-white/50 text-center p-6 rounded-xl shadow-md col-span-full"><p className="text-xl text-[#124170]">No plans match your criteria.</p></div>;
    return plans.map((plan, index) => (
        <div key={`${plan.id}-page-${index}`} className={`relative plan-card rounded-xl shadow-lg p-4 flex flex-col justify-between transform transition duration-300 ease-in-out hover:scale-[1.03] hover:shadow-2xl group bg-white/60 backdrop-blur-sm`} style={{ animationDelay: `${index * 0.05}s`, opacity: 0, animationName: 'slide-up', animationFillMode: 'forwards' }}>
            {plan.purchaseCount > 15000 && (<div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg rounded-tl-xl shadow-md">🔥 Hot Seller</div>)}
            <div className="flex items-start justify-between mb-2 mt-4">
                <h3 className="text-xl font-bold" style={{color: operatorColors[plan.operator]}}>{plan.operator}</h3>
                {showCompare && (
                    <label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" checked={plansToCompare.some(p => p.id === plan.id)} onChange={() => handleCompareChange(plan)} /><span>Compare</span></label>
                )}
            </div>
            <div className="text-center"><p className="text-4xl font-extrabold text-[#67C090]">₹{plan.price}</p><p className="text-sm font-medium mt-1">{plan.dataPerDay} GB/day for {plan.validity} days</p></div>
             <div className="mt-4 text-center flex-grow flex flex-col justify-end">
                <p className="text-xs text-gray-500 mb-2">Purchased by <span className="font-bold">{plan.purchaseCount.toLocaleString('en-IN')}</span> users</p>
                <button onClick={() => onBuyNow(plan)} className="w-full bg-[#F9A826] text-white font-bold py-2 rounded-lg hover:bg-amber-500 transition-colors">Buy Now</button>
            </div>
        </div>
    ));
};

const VisualComparisonModal = ({ isOpen, onClose, comparisonSet, getBestPlan }) => {
    if (!isOpen) return null;

    const features = [
        { key: 'price', label: 'Price', unit: '₹' },
        { key: 'validity', label: 'Validity', unit: ' Days' },
        { key: 'dataPerDay', label: 'Daily Data', unit: ' GB' },
        { key: 'calls', label: 'Calls' },
        { key: 'sms', label: 'SMS / Day' },
        { key: 'ottBundles', label: 'OTT Bundles' },
    ];

    const bestPlan = getBestPlan(comparisonSet);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#DDF4E7] rounded-2xl p-6 shadow-2xl w-full max-w-6xl relative animate-modal-enter" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-3xl font-bold text-[#124170] text-center mb-6">Full Plan Comparison</h3>
                <div className={`grid gap-4`} style={{gridTemplateColumns: `repeat(${comparisonSet.length}, minmax(0, 1fr))`}}>
                    {comparisonSet.map(plan => {
                         const isBest = bestPlan && plan.id === bestPlan.id && plan.operator === bestPlan.operator;
                         return (
                            <div key={plan.id} className={`relative bg-white rounded-xl p-4 shadow-lg border-t-8 transition-all duration-300 ${isBest ? 'ring-4 ring-amber-400 shadow-amber-300/50 scale-105' : ''}`} style={{borderColor: operatorColors[plan.operator]}}>
                                {isBest && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">🏆 Best Value</div>}
                                <h4 className="text-2xl font-bold text-center mt-3" style={{color: operatorColors[plan.operator]}}>{plan.operator}</h4>
                                <div className="space-y-3 mt-4">
                                    {features.map(feature => (
                                        <div key={feature.key} className="text-center border-b pb-2 last:border-b-0">
                                            <p className="text-sm text-gray-500">{feature.label}</p>
                                            <p className="font-bold text-md text-[#124170] break-words">
                                                {feature.key === 'ottBundles'
                                                    ? (plan.ottBundles.length > 0 ? plan.ottBundles.join(', ') : 'None')
                                                    : `${plan[feature.key]}${feature.unit || ''}`
                                                }
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         )
                    })}
                </div>
            </div>
        </div>
    );
};

const MyPlanDetails = ({ currentUser, calculateMyPlanUsage }) => {
    if (!currentUser?.purchasedPlan) {
        return <div className="text-center p-8 bg-[#DDF4E7] rounded-xl"><p className="text-lg text-[#124170]">You don't have an active plan.</p></div>;
    }

    const { purchasedPlan: plan } = currentUser;
    const { daysRemaining, validityPercentage, dataUsed, totalData, expiryDate } = calculateMyPlanUsage();

    return (
        <div className="bg-[#DDF4E7] p-6 rounded-xl shadow-inner">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="text-3xl font-bold" style={{color: operatorColors[plan.operator]}}>{plan.operator} - ₹{plan.price}</h4>
                    <div className="mt-4 space-y-3 text-md text-[#124170]">
                        <p className="flex items-center gap-2"><strong>Daily Data:</strong> {plan.dataPerDay} GB</p>
                        <p className="flex items-center gap-2"><strong>Expires On:</strong> {expiryDate.toLocaleDateString()}</p>
                        {plan.ottBundles.length > 0 && <p className="flex items-center gap-2"><strong>OTT Bundles:</strong> {plan.ottBundles.join(', ')}</p>}
                    </div>
                </div>
                <div className="flex flex-col justify-center gap-6">
                    <div>
                        <div className="flex justify-between items-baseline mb-1"><h5 className="font-semibold text-[#124170]">Validity</h5><span className="text-sm font-bold text-[#26667F]">{daysRemaining} days remaining</span></div>
                        <div className="w-full bg-white rounded-full h-4 shadow-inner"><div className="bg-gradient-to-r from-[#67C090] to-[#26667F] h-4 rounded-full" style={{ width: `${validityPercentage}%` }}></div></div>
                    </div>
                    <div>
                        <div className="flex justify-between items-baseline mb-1"><h5 className="font-semibold text-[#124170]">Data Usage (Est.)</h5><span className="text-sm font-bold text-[#26667F]">{dataUsed.toFixed(1)} / {totalData} GB used</span></div>
                        <div className="w-full bg-white rounded-full h-4 shadow-inner"><div className="bg-gradient-to-r from-[#67C090] to-[#26667F] h-4 rounded-full" style={{ width: `${(dataUsed / totalData) * 100}%` }}></div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const DataXchangeTab = ({ currentUser, calculateMyPlanUsage, dataToSell, setDataToSell, priceToSell, setPriceToSell, handleSellData, marketplaceListings, handleBuyData }) => {
    const { remainingData } = calculateMyPlanUsage();
    const mockLeaderboard = [
        { name: 'User...a1b9', earnings: 2550 }, { name: 'User...f3d2', earnings: 1800 },
        { name: 'User...c4e8', earnings: 1540 }, { name: 'User...99ab', earnings: 950 },
        { name: 'User...deff', earnings: 620 },
    ];
    
    return (
        <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg space-y-6">
            <div className="grid md:grid-cols-2 gap-6 items-center bg-[#DDF4E7] p-5 rounded-xl shadow-inner">
                <div>
                    <h4 className="text-xl font-bold text-center text-[#124170] mb-2">My Wallet</h4>
                    <p className="text-5xl font-extrabold text-center text-[#26667F]">{currentUser.walletBalance?.toLocaleString('en-IN')}</p>
                    <p className="text-center text-sm text-gray-600">Credit Points</p>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-center text-[#124170] mb-2">Sell Your Spare Data</h4>
                    <p className="text-center text-xs text-[#26667F] font-medium mb-3">You have {remainingData.toFixed(1)} GB remaining.</p>
                    <form onSubmit={handleSellData} className="space-y-2">
                        <input id="dataToSell" type="number" step="0.1" min="0" value={dataToSell} onChange={(e) => setDataToSell(e.target.value)} placeholder="Data to Sell (GB)" className="w-full px-3 py-2 text-sm rounded-lg border-2 border-[#67C090] focus:outline-none focus:border-[#26667F]"/>
                        <input id="priceToSell" type="number" step="1" min="0" value={priceToSell} onChange={(e) => setPriceToSell(e.target.value)} placeholder="Set Your Price (Credits)" className="w-full px-3 py-2 text-sm rounded-lg border-2 border-[#67C090] focus:outline-none focus:border-[#26667F]"/>
                        <button type="submit" className="w-full px-6 py-2 text-md font-bold rounded-lg bg-[#26667F] text-white shadow-md shine-button">List & Earn Credits</button>
                    </form>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xl font-bold text-center text-[#124170] mb-3">Marketplace</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 rounded-lg bg-gray-50 p-3">
                        {marketplaceListings.length > 0 ? marketplaceListings.map(listing => (
                            <div key={listing.id} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-md text-[#26667F]">{listing.data} GB</p>
                                    <p className="text-xs text-gray-500">From: {listing.seller}</p>
                                </div>
                                <button onClick={() => handleBuyData(listing)} className="px-4 py-2 text-xs font-bold rounded-full bg-[#F9A826] text-white hover:bg-amber-500 transition-colors">Buy for {listing.price} credits</button>
                            </div>
                        )) : <p className="text-center text-gray-500 pt-10">No data listings available.</p>}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-center text-[#124170] mb-3">Leaderboard</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 bg-gray-50 p-3 rounded-lg">
                        {mockLeaderboard.map((user, index) => (
                            <div key={user.name} className="bg-white p-3 rounded-lg flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-400 w-5 text-center">{index + 1}</span>
                                    <p className="font-semibold">{user.name}</p>
                                </div>
                                <p className="font-bold text-amber-500">{user.earnings.toLocaleString('en-IN')} earned</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StyleModal = ({ isOpen, onClose, content, onFindBest, isFindingBest, onBuyNow }) => {
    if (!isOpen) return null;

    const { category, plans, bestPicks } = content;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#DDF4E7] rounded-2xl p-6 shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative animate-modal-enter" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="text-center mb-4">
                    <h3 className="text-3xl font-bold text-[#124170]">{bestPicks ? `Top 3 for ${category.name}`: category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                </div>
                <div className="flex-grow overflow-y-auto plans-grid-container bg-white/50 rounded-lg p-4">
                    <PlansGrid plans={bestPicks || plans} plansToCompare={[]} handleCompareChange={() => {}} showCompare={false} onBuyNow={onBuyNow} />
                </div>
                {!bestPicks && (
                    <div className="text-center mt-4">
                        <button onClick={onFindBest} className="bg-[#26667F] hover:bg-[#124170] text-white font-bold py-3 px-8 rounded-full transition shine-button disabled:opacity-50" disabled={isFindingBest}>
                            {isFindingBest ? 'Analyzing...' : 'Find My Best Tariff Plan'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const PlanCardInChat = ({ plan, onBuyNow }) => (
    <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 my-2" style={{ borderColor: operatorColors[plan.operator] }}>
        <h4 className="font-bold text-md" style={{ color: operatorColors[plan.operator] }}>{plan.operator} - ₹{plan.price}</h4>
        <p className="text-sm text-gray-700">{plan.dataPerDay} GB/day for {plan.validity} days</p>
        {plan.ottBundles.length > 0 && <p className="text-xs text-gray-500 mt-1">Includes: {plan.ottBundles.join(', ')}</p>}
        <button onClick={() => onBuyNow(plan)} className="w-full text-sm mt-2 bg-[#F9A826] text-white font-bold py-1 rounded-md hover:bg-amber-500 transition-colors">Buy This Plan</button>
    </div>
);

const TransactionHistoryList = ({ currentUser }) => {
    const allHistory = [
        ...(currentUser.purchaseHistory || []).map(p => ({...p, type: 'purchase', date: p.purchaseDate})),
        ...(currentUser.transactionHistory || []).map(t => ({...t, type: t.type === 'sell' ? 'data_sell' : 'data_buy'}))
    ].sort((a,b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="p-4 sm:p-0">
            <h3 className="text-xl font-bold text-center text-[#124170] mb-3">Full Transaction History</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 rounded-lg bg-gray-50 p-3">
                {allHistory.length > 0 ? allHistory.map((item, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${item.type === 'purchase' ? 'bg-blue-500' : (item.type === 'data_sell' ? 'bg-green-500' : 'bg-red-500')}`}>
                                {item.type === 'purchase' ? '🛒' : (item.type === 'data_sell' ? '↑' : '↓')}
                            </span>
                            <div>
                                <p className="font-semibold capitalize">
                                    {item.type === 'purchase' ? `Plan: ${item.operator} ₹${item.price}` : `${item.type.replace('_', ' ')}: ${item.data} GB`}
                                </p>
                                <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        {item.type !== 'purchase' && <p className={`font-bold ${item.type === 'data_sell' ? 'text-green-600' : 'text-red-600'}`}>{item.type === 'data_sell' ? '+' : '-'}{item.price} credits</p>}
                    </div>
                )) : <p className="text-center text-gray-500 pt-10">No history yet.</p>}
            </div>
        </div>
    );
};


const PurchaseModal = ({ plan, onClose, onConfirm }) => {
    if (!plan) return null;

    const paymentOptions = [
        { name: 'Google Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg' },
        { name: 'PhonePe', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg' },
        { name: 'Paytm', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Paytm_Logo.svg' },
        { name: 'Credit/Debit Card', logo: 'https://img.icons8.com/color/48/000000/bank-card-front-side.png' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#DDF4E7] rounded-2xl p-6 shadow-2xl w-full max-w-md relative animate-modal-enter" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-[#124170]">Confirm Purchase</h3>
                    <div className="my-4 bg-white/70 p-4 rounded-lg">
                        <p className="text-lg font-bold" style={{color: operatorColors[plan.operator]}}>{plan.operator} Plan</p>
                        <p className="text-4xl font-extrabold text-[#26667F]">₹{plan.price}</p>
                        <p className="text-sm text-gray-600">{plan.dataPerDay} GB/day for {plan.validity} days</p>
                    </div>
                     <h4 className="text-lg font-semibold text-[#124170] mb-3">Select Payment Method</h4>
                    <div className="space-y-3">
                        {paymentOptions.map(opt => (
                            <button key={opt.name} onClick={() => onConfirm(plan)} className="w-full flex items-center justify-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <img src={opt.logo} alt={opt.name} className="h-6 mr-4"/>
                                <span className="font-semibold">{opt.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const Chatbot = ({ isOpen, onToggle, messages, onSendMessage, input, onInputChange, chatBodyRef, onBuyNow }) => {
    return (
        <div className={`fixed top-24 right-4 w-80 h-[28rem] bg-white rounded-2xl shadow-2xl flex flex-col z-40 transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`} aria-hidden={!isOpen}>
            <div className="bg-gradient-to-r from-[#26667F] to-[#67C090] p-4 rounded-t-2xl text-white flex justify-between items-center">
                <h3 className="font-bold">TariffGenie Assistant</h3>
                <button onClick={onToggle} className="text-white font-bold text-xl">&times;</button>
            </div>
            <div ref={chatBodyRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.type === 'text' && (
                            <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-[#26667F] text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                {msg.text}
                            </div>
                        )}
                        {msg.type === 'plan_recommendation' && (
                            <div className="w-full space-y-2">
                                {msg.plans.map(plan => <PlanCardInChat key={plan.id} plan={plan} onBuyNow={onBuyNow} />)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <form onSubmit={onSendMessage} className="p-4 border-t">
                <div className="flex">
                    <input
                        type="text"
                        value={input}
                        onChange={onInputChange}
                        placeholder="Type a message..."
                        className="w-full px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-[#26667F]"
                    />
                    <button type="submit" className="bg-[#26667F] text-white px-4 rounded-r-lg font-bold">&uarr;</button>
                </div>
            </form>
        </div>
    );
};

const AboutTariffGeniePage = () => {
    const whyPoints = [
        { icon: '💰', title: 'Save Money', text: 'Our AI finds plans that perfectly match your usage, so you never overpay.' },
        { icon: '🕒', title: 'Save Time', text: 'No more endless searching. Get your top 3 matches in seconds.' },
        { icon: '🎯', title: 'Personalized for You', text: 'Recommendations are based on your unique habits, not generic offers.' },
        { icon: '🤝', title: 'Unbiased & Transparent', text: 'We compare all major operators to find the true best deal for you.' },
    ];

    const features = [
        { icon: '🧠', title: 'AI-Powered Recommendations', text: 'Using a LightGBM model, we analyze your needs to provide hyper-personalized suggestions with 97% accuracy.' },
        { icon: '🔄', title: 'Comprehensive Comparison', text: 'Instantly compare your current plan against the best alternatives from all major operators.' },
        { icon: '💸', title: 'DataXchange Marketplace', text: 'An innovative feature allowing you to sell your unused data for credits, or buy extra data when you need it.' },
        { icon: '📡', title: 'Real-Time Network Analysis', text: 'We use your location to show the signal strength of nearby cell towers, ensuring you pick an operator with great coverage.' },
        { icon: '📊', title: 'Personalized Dashboard', text: 'Track your current plan, view transaction history, and manage your subscription and credits all in one place.' },
        { icon: '🤖', title: 'Smart Assistant Chatbot', text: 'Get instant help navigating the app or finding the perfect plan through a conversational interface.' },
    ];

    return (
        <section id="about-page" className="min-h-screen pt-28 pb-12 flex flex-col items-center">
            <div className="container mx-auto">
                <div className="card animated-fade-in-up p-4 sm:p-8">
                    <h2 className="text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#26667F] to-[#67C090] mb-4">
                        Welcome to TariffGenie
                    </h2>
                    <p className="text-center text-lg text-gray-600 mb-12">Your personal guide to the perfect mobile tariff plan.</p>

                    <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-md mb-12 animated-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-3xl font-bold text-center text-[#124170] mb-8">Why Choose TariffGenie?</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {whyPoints.map((point, index) => (
                                <div key={point.title} className="text-center p-4">
                                    <div className="text-4xl mb-3">{point.icon}</div>
                                    <h4 className="font-bold text-xl mb-2 text-[#26667F]">{point.title}</h4>
                                    <p className="text-gray-600">{point.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                     <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-md animated-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <h3 className="text-3xl font-bold text-center text-[#124170] mb-8">Our Features</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {features.map((feature) => (
                               <div key={feature.title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                   <div className="text-3xl">{feature.icon}</div>
                                   <div>
                                       <h4 className="font-bold text-lg mb-1 text-[#26667F]">{feature.title}</h4>
                                       <p className="text-sm text-gray-600">{feature.text}</p>
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};


const AccountPage = ({ currentUser, calculateMyPlanUsage, handleLogout, onSubscribeClick }) => {
    
    const dataEarnings = (currentUser.transactionHistory || [])
        .filter(t => t.type === 'sell')
        .reduce((sum, t) => sum + t.price, 0);

    return (
        <section id="account-page" className="min-h-screen pt-28 pb-12 flex flex-col items-center">
            <div className="container mx-auto">
                <div className="card animated-fade-in-up p-4 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 border-b pb-4">
                        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#26667F] to-[#67C090]">My Dashboard</h2>
                        <button onClick={handleLogout} className="mt-4 sm:mt-0 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-colors text-sm">Logout</button>
                    </div>
                    
                    <div className="space-y-8">
                         {/* Subscription & Credits */}
                         <div className="grid md:grid-cols-2 gap-6 p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-md items-center">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-[#124170] mb-2">Recommendation Credits</h3>
                                <p className="text-5xl font-extrabold text-[#26667F]">{currentUser.subscriptionTier !== 'None' ? '∞' : currentUser.recommendationCredits}</p>
                                <p className="text-sm text-gray-600">credits remaining</p>
                            </div>
                            <div className="text-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                                <h3 className="text-xl font-bold text-[#124170] mb-3">Unlock Unlimited Recommendations</h3>
                                <button onClick={onSubscribeClick} className="w-full max-w-xs mx-auto px-8 py-3 text-lg font-bold rounded-lg bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-lg shine-button">
                                    Subscribe Now
                                </button>
                            </div>
                        </div>

                        {/* User Details & Wallet */}
                        <div className="grid md:grid-cols-5 gap-6 p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-md">
                             <div className="md:col-span-3">
                                <h3 className="text-xl font-bold text-[#124170] mb-3">User Details</h3>
                                <div className="space-y-2 text-md">
                                    <p><strong>Phone:</strong> {currentUser.phone}</p>
                                    <p><strong>Date of Birth:</strong> {new Date(currentUser.dob).toLocaleDateString()}</p>
                                    {currentUser.location && (
                                        <div className="mt-4 p-3 bg-gradient-to-r from-sky-100 to-teal-100 rounded-lg flex items-center gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#26667F]" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500">Location</p>
                                                <p className="font-bold text-lg text-[#124170]">{currentUser.location}</p>
                                            </div>
                                        </div>
                                    )}
                                     <div className="mt-4">
                                        {currentUser.subscriptionTier && currentUser.subscriptionTier !== 'None' ? (
                                            <div className="inline-block p-2 px-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full shadow-lg">
                                                <span className="font-bold">{currentUser.subscriptionTier.toUpperCase()} PLAN</span>
                                            </div>
                                        ) : (
                                            <div className="inline-block p-2 px-4 bg-gray-200 text-gray-700 rounded-full">
                                                <span className="font-semibold">No Active Subscription</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                             </div>
                             <div className="md:col-span-2 text-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                                <h3 className="text-xl font-bold text-[#124170] mb-2">Wallet Balance</h3>
                                <p className="text-5xl font-extrabold text-[#26667F]">{currentUser.walletBalance?.toLocaleString('en-IN')}</p>
                                <p className="text-sm text-gray-600">Credit Points</p>
                                <p className="text-sm text-green-600 font-semibold mt-1">Total Earned from Data Sales: {dataEarnings} credits</p>
                             </div>
                        </div>
                        
                        {/* Current Plan */}
                        <div>
                             <h3 className="text-xl font-bold text-[#124170] mb-3 text-center">Current Plan</h3>
                             <MyPlanDetails currentUser={currentUser} calculateMyPlanUsage={calculateMyPlanUsage} />
                        </div>
                        
                        {/* Transaction History */}
                         <div>
                             <TransactionHistoryList currentUser={currentUser} />
                         </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

const NearbyTowersMap = ({ towerSignalData, locationStatus, onManualLocationSubmit, onManualLocationChange, manualLocation, onSuggestionClick, citySuggestions }) => {
    const sortedTowers = towerSignalData ? Object.entries(towerSignalData).sort(([,a],[,b]) => b - a) : [];

    return (
        <div className="mb-8 p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-[#124170] mb-4 text-center">Nearby Network Strength</h3>
            {locationStatus === 'granted' && towerSignalData ? (
                <div className="relative w-full h-48 bg-[#DDF4E7]/50 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center p-4">
                     <div className="w-full max-w-md space-y-2">
                        {sortedTowers.map(([operator, strength], index) => {
                            const strengthPercentage = (strength / 20) * 100;
                            return (
                                <div key={operator} className="animated-fade-in-up" style={{ animationDelay: `${0.1 * index}s` }}>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-sm w-24" style={{color: operatorColors[operator]}}>{operator}</span>
                                        <div className="w-full bg-gray-200 rounded-full h-4">
                                            <div className="h-4 rounded-full transition-all duration-500" style={{width: `${strengthPercentage}%`, backgroundColor: operatorColors[operator]}}></div>
                                        </div>
                                        <span className="font-bold text-sm w-12 text-right">{strength}/20</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : locationStatus === 'pending' ? (
                 <div className="text-center p-8 h-48 flex justify-center items-center">
                    <p>Detecting your location...</p>
                 </div>
            ) : (
                <div className="h-48 flex flex-col justify-center items-center">
                     <p className="text-center text-sm text-gray-600 mb-3 px-4">Location denied. Enter city for network analysis.</p>
                     <form onSubmit={onManualLocationSubmit} className="relative max-w-sm mx-auto w-full">
                        <input type="text" placeholder="Enter your city..." value={manualLocation} onChange={onManualLocationChange} className="w-full px-4 py-2 border border-[#67C090] rounded-full focus:outline-none focus:border-[#26667F]" />
                        <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#26667F] text-white px-3 py-1 rounded-full text-sm">Update</button>
                        {citySuggestions.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                                {citySuggestions.map(city => <li key={city} onClick={() => onSuggestionClick(city)} className="px-4 py-2 cursor-pointer hover:bg-gray-100">{city}</li>)}
                            </ul>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
};

const SubscriptionModal = ({ isOpen, onClose, onSelectPlan }) => {
    if (!isOpen) return null;

    const plans = [
        { name: 'Basic', price: 99, features: ['25 Monthly Recommendations', 'Basic Plan Filtering', 'Email Support'] },
        { name: 'Pro', price: 299, features: ['Unlimited Recommendations', 'Advanced Filtering', 'Priority Support', 'DataXchange Access'], popular: true },
        { name: 'Enterprise', price: 999, features: ['Unlimited Recommendations', 'Team Access (5 Users)', 'Dedicated Account Manager', 'API Access'], popular: false },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#DDF4E7] rounded-2xl p-6 shadow-2xl w-full max-w-4xl relative animate-modal-enter" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-[#124170]">Upgrade Your Experience</h2>
                    <p className="text-gray-600 mt-2">Choose a plan to unlock unlimited AI-powered recommendations and more.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <div key={plan.name} className={`relative p-6 bg-white rounded-xl shadow-lg border-2 ${plan.popular ? 'border-[#F9A826]' : 'border-transparent'}`}>
                            {plan.popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[#F9A826] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">Most Popular</div>}
                            <h3 className="text-2xl font-bold text-center text-[#26667F]">{plan.name}</h3>
                            <p className="text-center text-4xl font-extrabold my-4">₹{plan.price}<span className="text-base font-medium text-gray-500">/mo</span></p>
                            <ul className="space-y-3 text-sm mb-6">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => onSelectPlan(plan.name)} className={`w-full py-2 font-bold rounded-lg transition-colors ${plan.popular ? 'bg-[#F9A826] text-white hover:bg-amber-500' : 'bg-[#26667F] text-white hover:bg-[#124170]'}`}>
                                Choose {plan.name}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const App = () => {
    const [page, setPage] = useState('splash');
    const [authMode, setAuthMode] = useState('login');
    const [currentUser, setCurrentUser] = useState(null);
    const [loginPhone, setLoginPhone] = useState('');
    const [registerPhone, setRegisterPhone] = useState('');
    const [registerDob, setRegisterDob] = useState('');
    const [registerLocation, setRegisterLocation] = useState('');
    const [registerCitySuggestions, setRegisterCitySuggestions] = useState([]);
    const [budget, setBudget] = useState(800);
    const [userPersona, setUserPersona] = useState('medium');
    const [dataNeed, setDataNeed] = useState(2);
    const [filters, setFilters] = useState({
        operators: [], validity: [], ottServices: [], speed: 'no preference', calls: 'Any', sms: 'Any'
    });
    const [isOttSelected, setIsOttSelected] = useState(false);
    const [allPlans, setAllPlans] = useState([]);
    const [recommendedPlans, setRecommendedPlans] = useState([]);
    const [activeTab, setActiveTab] = useState('plans');
    const [plansToCompare, setPlansToCompare] = useState([]);
    const [message, setMessage] = useState('');
    const [recommendationTitle, setRecommendationTitle] = useState('All Available Plans');
    const [isMessageVisible, setIsMessageVisible] = useState(false);
    const [locationStatus, setLocationStatus] = useState('pending');
    const [towerSignalData, setTowerSignalData] = useState(null);
    const [isFindingBest, setIsFindingBest] = useState(false);
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
    const [comparisonSet, setComparisonSet] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [manualLocation, setManualLocation] = useState('');
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [marketplaceListings, setMarketplaceListings] = useState([]);
    const [dataToSell, setDataToSell] = useState('');
    const [priceToSell, setPriceToSell] = useState('');
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
    const [styleModalContent, setStyleModalContent] = useState({ category: null, plans: [], bestPicks: null });
    const [chatState, setChatState] = useState({ stage: 'initial', preferences: {} });
    const [planToBuy, setPlanToBuy] = useState(null);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

    const chartRef = useRef(null);
    const chatBodyRef = useRef(null);
    
    // Fetch all plans from backend on initial load
    useEffect(() => {
        fetch('http://localhost:5000/api/plans')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setAllPlans(data);
                setRecommendedPlans(data);
            })
            .catch(error => {
                console.error("Failed to fetch plans from backend:", error);
                showMessage("Could not connect to the server. Please ensure the backend is running.");
            });
    }, []);

    const resetChat = () => {
        setChatState({ stage: 'initial', preferences: {} });
        setChatMessages([
            { sender: 'bot', type: 'text', text: "Hello! I am your plan assistant. How can I help you find the perfect plan today?" }
        ]);
    };

    useEffect(() => {
        resetChat();
    }, []);
    
    useEffect(() => {
        if (page === 'splash') {
            const timer = setTimeout(() => setPage('home'), 2000);
            return () => clearTimeout(timer);
        }
    }, [page]);
    
    useEffect(() => {
        if (userPersona === 'low') { setBudget(400); } 
        else if (userPersona === 'medium') { setBudget(800); } 
        else { setBudget(3000); }
    }, [userPersona]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationStatus('granted');
                    setTowerSignalData(fetchMockTowerData(position.coords.latitude, position.coords.longitude));
                },
                () => {
                    setLocationStatus('denied');
                }
            );
        } else {
            setLocationStatus('unsupported');
        }
    }, []);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const handleSearch = (query) => {
        setSearchQuery(query);
        const lowerCaseQuery = query.toLowerCase().trim();
        if (lowerCaseQuery) {
            let searchResults = allPlans.filter(plan => {
                const priceMatch = plan.price.toString().includes(lowerCaseQuery);
                const dataMatch = `${plan.dataPerDay}gb`.includes(lowerCaseQuery.replace(/\s/g, '')) || `${plan.dataPerDay} gb`.includes(lowerCaseQuery);
                const operatorMatch = plan.operator.toLowerCase().includes(lowerCaseQuery);
                const ottMatch = plan.ottBundles.join(' ').toLowerCase().includes(lowerCaseQuery);
                return priceMatch || dataMatch || operatorMatch || ottMatch;
            });
            setRecommendedPlans(searchResults);
            setRecommendationTitle(`Search Results for "${query}"`);
        } else {
            setRecommendedPlans(allPlans);
            setRecommendationTitle('All Available Plans');
        }
    };

    const showMessage = (msg) => { setMessage(msg); setIsMessageVisible(true); setTimeout(() => setIsMessageVisible(false), 3000); };

    const handleRegisterLocationChange = (e) => {
        const value = e.target.value;
        setRegisterLocation(value);
        if (value) {
            setRegisterCitySuggestions(indianCities.filter(city => city.toLowerCase().startsWith(value.toLowerCase())));
        } else {
            setRegisterCitySuggestions([]);
        }
    };

    const handleRegisterSuggestionClick = (city) => {
        setRegisterLocation(city);
        setRegisterCitySuggestions([]);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!registerPhone || !registerDob || registerPhone.length !== 10 || !/^\d{10}$/.test(registerPhone)) {
            showMessage("Please enter a valid 10-digit phone number and date of birth.");
            return;
        }

        if (!registerLocation || !indianCities.some(c => c.toLowerCase() === registerLocation.toLowerCase())) {
            showMessage("Please select a valid city from the suggestions.");
            return;
        }

        const today = new Date();
        const birthDate = new Date(registerDob);
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(today.getFullYear() - 18);

        if (birthDate > today) {
            showMessage("Date of birth cannot be in the future.");
            return;
        }

        if (birthDate > eighteenYearsAgo) {
            showMessage("You must be at least 18 years old to register.");
            return;
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: registerPhone, dob: registerDob, location: registerLocation }),
            });
            const data = await response.json();
            showMessage(data.message);
            if(response.ok) {
                setAuthMode('login');
                setLoginPhone(registerPhone);
                setRegisterPhone('');
                setRegisterDob('');
                setRegisterLocation('');
            }
        } catch (error) {
             showMessage("Registration failed. Please try again later.");
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!loginPhone || loginPhone.length !== 10 || !/^\d{10}$/.test(loginPhone)) { 
            showMessage("Please enter a valid 10-digit phone number."); 
            return; 
        }
        try {
             const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: loginPhone }),
            });
            const data = await response.json();
            showMessage(data.message);
            if(response.ok) {
                setCurrentUser(data.user);
                setPage('preferences'); 
            } else {
                 setAuthMode('register'); 
                 setRegisterPhone(loginPhone); 
            }
        } catch(error){
            showMessage("Login failed. Please check your connection.");
        }
    };
    
    const handleLogout = () => { setCurrentUser(null); setPage('auth'); showMessage("You have been logged out."); };
    
    const fetchMockTowerData = (lat, lon) => {
        const baseStrength = { 'Jio': 12, 'Airtel': 9, 'BSNL': 5, 'TariffGenie': 14 };
        const randomFactor = (operator) => Math.floor(Math.random() * (operator === 'BSNL' ? 4 : 6));
        const locationBias = lat ? (lat % 1) * 2 - 1 : Math.random() * 2 - 1;
        
        return {
            'Jio': Math.min(20, Math.max(0, baseStrength['Jio'] + randomFactor('Jio') + Math.round(locationBias * 2))),
            'Airtel': Math.min(20, Math.max(0, baseStrength['Airtel'] + randomFactor('Airtel') - Math.round(locationBias))),
            'BSNL': Math.min(20, Math.max(0, baseStrength['BSNL'] + randomFactor('BSNL') + Math.round(locationBias * -1))),
            'TariffGenie': Math.min(20, Math.max(0, baseStrength['TariffGenie'] + randomFactor('TariffGenie') + Math.round(locationBias * 3)))
        };
    };
    
    const handleManualLocationSubmit = (e) => {
        e.preventDefault();
        if (manualLocation && indianCities.some(c => c.toLowerCase() === manualLocation.toLowerCase())) {
            handleSuggestionClick(manualLocation);
        } else {
            showMessage("Please select a valid city from the suggestions.");
        }
    };

    const handleManualLocationChange = (e) => {
        const value = e.target.value;
        setManualLocation(value);
        if (value) {
            setCitySuggestions(indianCities.filter(city => city.toLowerCase().startsWith(value.toLowerCase())));
        } else {
            setCitySuggestions([]);
        }
    };

    const handleSuggestionClick = (city) => {
        setManualLocation(city);
        setCitySuggestions([]);
        const charSum = city.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const pseudoLat = (charSum % 100) / 100;
        setTowerSignalData(fetchMockTowerData(pseudoLat, null));
        showMessage(`Signal strength updated for ${city}.`);
    };

    const handleStyleCategoryClick = (category) => {
        const filteredPlans = allPlans.filter(plan => plan.tags.includes(category.tag));
        setStyleModalContent({ category, plans: filteredPlans, bestPicks: null });
        setIsStyleModalOpen(true);
    };

    const handleShowPopularPlansModal = () => {
        const popularPlans = [...allPlans].sort((a,b) => b.purchaseCount - a.purchaseCount).slice(0,25);
        const category = { name: 'Most Popular Plans', description: 'Our curated list of the top 25 high-value plans!' };
        setStyleModalContent({ category, plans: popularPlans, bestPicks: null });
        setIsStyleModalOpen(true);
    };

    const handleCloseStyleModal = () => {
        setIsStyleModalOpen(false);
    };
    
    const findBestPlansInModal = () => {
        if (currentUser.subscriptionTier === 'None' && currentUser.recommendationCredits <= 0) {
            showMessage("You have no recommendation credits left. Please subscribe.");
            setIsSubscriptionModalOpen(true);
            return;
        }

        setIsFindingBest(true);
        setTimeout(() => {
            const best = getBestPlan(styleModalContent.plans, 3);
            setStyleModalContent(prev => ({ ...prev, bestPicks: best }));
            setIsFindingBest(false);
            if (currentUser.subscriptionTier === 'None') {
                const updatedUser = {...currentUser, recommendationCredits: currentUser.recommendationCredits - 1};
                setCurrentUser(updatedUser);
                updateUserInStorage(updatedUser);
                showMessage("Used 1 recommendation credit.");
            }
        }, 1500);
    };
    
    const findBestTariffPlans = () => {
        if (currentUser.subscriptionTier === 'None' && currentUser.recommendationCredits <= 0) {
            showMessage("You have no recommendation credits left. Please subscribe.");
            setIsSubscriptionModalOpen(true);
            return;
        }

        setIsFindingBest(true);
        setRecommendationTitle('🤖 Analyzing your plans...');
        setTimeout(() => {
            const best = getBestPlan(recommendedPlans, 3);
            setRecommendedPlans(best);
            setRecommendationTitle('Top 3 AI-Powered Picks For You');
            setIsFindingBest(false);

            if (currentUser.subscriptionTier === 'None') {
                const updatedUser = {...currentUser, recommendationCredits: currentUser.recommendationCredits - 1};
                setCurrentUser(updatedUser);
                updateUserInStorage(updatedUser);
                showMessage("Used 1 recommendation credit. Here are your top 3 AI-recommended plans!");
            } else {
                showMessage("Here are your top 3 AI-recommended plans!");
            }
        }, 1500);
    };


    const handleFilterChange = (e) => {
        const { name, value, checked, type } = e.target;
        if (type === 'checkbox') {
            if (name === 'operators' || name === 'validity' || name === 'ottServices') {
                setFilters(prev => ({ ...prev, [name]: checked ? [...prev[name], value] : prev[name].filter(item => item !== value) }));
            } else {
                setFilters(prev => ({ ...prev, [name]: checked }));
            }
        } else {
             setFilters(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleCompareChange = (plan) => {
        setPlansToCompare(prev => {
            if (prev.some(p => p.id === plan.id)) {
                return [];
            } else {
                return [plan];
            }
        });
    };

    const showFilteredPlans = () => {
        setSearchQuery('');
    
        const areFiltersSet =
            filters.operators.length > 0 ||
            filters.validity.length > 0 ||
            isOttSelected ||
            filters.speed !== 'no preference' ||
            filters.calls !== 'Any' ||
            filters.sms !== 'Any' ||
            userPersona !== 'medium' ||
            dataNeed !== 2;
    
        let plansToShow;
    
        if (!areFiltersSet) {
            plansToShow = [...allPlans];
            setRecommendationTitle('All Available Plans');
        } else {
            plansToShow = allPlans.filter(plan => {
                const meetsBudget = plan.price <= budget;
                const meetsData = plan.dataPerDay >= dataNeed;
    
                const meetsOperator = filters.operators.length === 0 ? true : filters.operators.includes(plan.operator);
                const meetsValidity = filters.validity.length === 0 ? true : filters.validity.map(v => Number(v)).includes(plan.validity);
    
                const meetsOTT = (() => {
                    if (!isOttSelected) return true;
                    if (filters.ottServices.length === 0) return true; // Show all plans if OTT is checked but no specific service is
                    return filters.ottServices.some(service => plan.ottBundles.includes(service));
                })();
    
                const meetsSpeed = filters.speed === 'no preference' ? true : plan.speed === filters.speed;
    
                const callRank = { '100': 1, '200': 2, '300': 3, 'Unlimited': 4 };
                const planCallValue = String(plan.calls).replace(/ Minutes/g, '');
                const meetsCalls = filters.calls === 'Any' ? true : callRank[planCallValue] >= callRank[filters.calls];
    
                const planSmsValue = (plan.sms === 'Unlimited') ? Infinity : Number(plan.sms);
                const filterSmsValue = (filters.sms === 'Unlimited') ? Infinity : Number(filters.sms);
                const meetsSms = filters.sms === 'Any' ? true : planSmsValue >= filterSmsValue;
    
                return meetsBudget && meetsData && meetsOperator && meetsValidity && meetsOTT && meetsSpeed && meetsCalls && meetsSms;
            });
            setRecommendationTitle('Your Personalized Plans');
        }
    
        const shuffledPlans = [...plansToShow].sort(() => Math.random() - 0.5);
    
        setRecommendedPlans(shuffledPlans);
        setPage('results');
    };

    const resetFiltersAndPlans = () => {
        setRecommendedPlans(allPlans);
        setRecommendationTitle('All Available Plans');
        setSearchQuery('');
        setPlansToCompare([]);
        showMessage("Filters have been reset.");
    };

    const findComparablePlan = (operator, referencePlan) => {
        const operatorPlans = allPlans.filter(p => p.operator === operator);
        if (operatorPlans.length === 0) return null;
        operatorPlans.sort((a, b) => {
            const scoreA = Math.abs(a.price - referencePlan.price) + Math.abs(a.dataPerDay - referencePlan.dataPerDay) * 50;
            const scoreB = Math.abs(b.price - referencePlan.price) + Math.abs(b.dataPerDay - referencePlan.dataPerDay) * 50;
            return scoreA - scoreB;
        });
        return operatorPlans[0];
    };

    const openComparisonModal = () => {
        if (plansToCompare.length === 0) { showMessage("Please select a plan to compare."); return; }
        const selectedPlan = plansToCompare[0];
        const otherOperators = OPERATORS.filter(op => op !== selectedPlan.operator);
        let finalComparison = [selectedPlan];
        otherOperators.forEach(op => { const comparablePlan = findComparablePlan(op, selectedPlan); if(comparablePlan) finalComparison.push(comparablePlan); });
        if (selectedPlan.operator !== 'TariffGenie' && !finalComparison.some(p => p.operator === 'TariffGenie')) {
            const tgPlan = findComparablePlan('TariffGenie', selectedPlan); if(tgPlan) finalComparison.push(tgPlan);
        }
        finalComparison.sort((a, b) => {
            if (a.id === selectedPlan.id) return -1; if (b.id === selectedPlan.id) return 1;
            if (a.operator === 'TariffGenie') return -1; if (b.operator === 'TariffGenie') return 1;
            return 0;
        });
        setComparisonSet(finalComparison); setIsComparisonModalOpen(true);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        const userInput = chatInput.trim();
        if (!userInput) return;
    
        const newMessages = [...chatMessages, { sender: 'user', type: 'text', text: userInput }];
        setChatMessages(newMessages); // Show user message immediately
    
        if (userInput.toLowerCase() === 'restart') {
            resetChat();
            setChatInput('');
            return;
        }
    
        const lowerUserInput = userInput.toLowerCase();
        
        const generalQueries = {
            'account details': "You can see your account details by clicking on the user icon in the top-right corner of the page. This will take you to your Dashboard.",
            'my plan': "Your current plan details are on the 'My Dashboard' page. Click the user icon in the top-right to navigate there.",
            'sell data': "You can sell your spare data in the 'DataXchange' tab. Go to the 'Find Plans' page and select the 'DataXchange' tab to get started!",
            'market trends': "To see market trends, go to the 'Find Plans' page and click on the 'Trends' tab. You'll find a pie chart showing the market share of different operators.",
            'compare plans': "To compare plans, go to the 'Find Plans' page. Select a plan you're interested in by checking the 'Compare' box on its card, then click the 'Compare' button at the top of the page.",
            'logout': "You can log out from the 'My Dashboard' page. Click the user icon in the top-right corner, and you'll find the 'Logout' button there.",
            'change preferences': "You can change your detailed preferences on the 'Preferences' page. Click on 'Preferences' in the navigation bar at the top of the page.",
            'cheap': "You can find budget-friendly plans by selecting the 'Budget Saver' style on the Preferences page, or by setting a low budget range in the 'Detailed Preferences' section.",
            'popular': "Absolutely! Just click the 'View Most Popular Plans' button on the Preferences page to see a curated list of our top sellers.",
            'gaming': "For the best gaming experience, select the 'Gaming Pro' style on the Preferences page. This will show you plans with high speed and lots of data.",
            'yearly': "Yes, you can find long-term plans. On the Preferences page, either click the 'Yearly Plan' style or select '365 Days' under the Validity filter in the 'Detailed Preferences' section."
        };

        let queryMatched = false;
        for (const [key, value] of Object.entries(generalQueries)) {
            if (lowerUserInput.includes(key)) {
                const infoResponse = { sender: 'bot', type: 'text', text: value };
                setTimeout(() => {
                    setChatMessages(prev => [...prev, infoResponse]);
                }, 500);
                queryMatched = true;
                break;
            }
        }
    
        if (queryMatched) {
            setChatInput('');
            return;
        }
    
        let currentPrefs = { ...chatState.preferences };
        let nextStage = chatState.stage;
        let botResponse = "";
    
        setTimeout(() => { // Simulate bot thinking
            switch(chatState.stage) {
                case 'initial':
                    const budgetVal = parseInt(userInput.match(/\d+/));
                    const hasDataKeyword = /data|gb/i.test(userInput);
                    const hasOttKeyword = /ott|netflix|prime|hotstar|disney/i.test(userInput);
    
                    if (budgetVal) {
                        currentPrefs.budget = budgetVal;
                        nextStage = 'asking_data';
                        botResponse = `Great, a budget of ₹${budgetVal}. How much daily data do you need in GB? (e.g., 2)`;
                    } else if (hasDataKeyword) {
                        nextStage = 'asking_budget';
                        botResponse = "Sounds like data is important. What's your monthly budget for the plan?";
                    } else if (hasOttKeyword) {
                        currentPrefs.ott = true;
                        nextStage = 'asking_budget';
                        botResponse = "Got it, you're looking for plans with OTT benefits. What is your monthly budget?";
                    } else {
                        nextStage = 'asking_budget';
                        botResponse = "I can help with that! To start, what is your monthly budget? (e.g., 500)";
                    }
                    break;
                case 'asking_budget':
                    const budgetValue = parseInt(userInput.match(/\d+/));
                    if (budgetValue) {
                        currentPrefs.budget = budgetValue;
                        nextStage = 'asking_data';
                        botResponse = `Great, a budget of ₹${budgetValue}. How much daily data do you need in GB? (e.g., 2)`;
                    } else {
                        botResponse = "Please provide a valid budget in numbers.";
                    }
                    break;
                case 'asking_data':
                    const dataVal = parseFloat(userInput.match(/(\d*\.?\d*)/)[0]);
                     if (dataVal) {
                        currentPrefs.data = dataVal;
                        nextStage = 'asking_ott';
                        botResponse = `Got it. Do you need any OTT services like Netflix or Prime? (yes/no)`;
                    } else {
                        botResponse = "Please provide a valid data amount in GB.";
                    }
                    break;
                case 'asking_ott':
                     const wantsOtt = userInput.toLowerCase().includes('yes');
                     currentPrefs.ott = wantsOtt;
                     nextStage = 'recommending';
                     botResponse = "Perfect! I'm finding the best plans for you now...";
                     break;
                default:
                    botResponse = "I can help you find a plan or answer questions about the app. For example, you can ask 'Where can I see my account details?' or tell me your budget to start a plan search. Type 'restart' to begin a new search.";
                    break;
            }
    
            if (nextStage === 'recommending') {
                setChatMessages(prev => [...prev, { sender: 'bot', type: 'text', text: botResponse }]);
                setTimeout(() => {
                    const filtered = allPlans.filter(p => {
                        const meetsBudget = p.price <= currentPrefs.budget;
                        const meetsData = p.dataPerDay >= currentPrefs.data;
                        const meetsOtt = !currentPrefs.ott || p.ottBundles.length > 0;
                        return meetsBudget && meetsData && meetsOtt;
                    });
                    const bestPlans = getBestPlan(filtered, 3);
                    if (bestPlans && bestPlans.length > 0) {
                        setChatMessages(prev => [
                            ...prev, 
                            { sender: 'bot', type: 'plan_recommendation', plans: bestPlans },
                            { sender: 'bot', type: 'text', text: "Here are my top recommendations! Type 'restart' to begin a new search." }
                        ]);
                    } else {
                         setChatMessages(prev => [
                            ...prev, 
                            { sender: 'bot', type: 'text', text: "I couldn't find a perfect match with those criteria. Try being a bit more flexible! Type 'restart' to try again." }
                        ]);
                    }
                    setChatState({ stage: 'done', preferences: {} });
                }, 1500);
            } else {
                 setChatMessages(prev => [...prev, { sender: 'bot', type: 'text', text: botResponse }]);
                 setChatState({ stage: nextStage, preferences: currentPrefs });
            }
        }, 500);
    
        setChatInput('');
    };
    
    const updateUserInStorage = (updatedUser) => {
        const users = JSON.parse(localStorage.getItem('tariffGenieUsers')) || [];
        const userIndex = users.findIndex(u => u.phone === updatedUser.phone);
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem('tariffGenieUsers', JSON.stringify(users));
        }
    };

    const handleSellData = (e) => {
        e.preventDefault();
        const dataAmount = parseFloat(dataToSell);
        const sellerPrice = parseFloat(priceToSell);

        if (isNaN(dataAmount) || isNaN(sellerPrice) || dataAmount <= 0 || sellerPrice <= 0) {
            showMessage("Please enter valid data amount and price.");
            return;
        }

        const { remainingData } = calculateMyPlanUsage();
        if (dataAmount > remainingData) {
            showMessage(`You cannot sell more than your remaining data (${remainingData.toFixed(1)} GB).`);
            return;
        }

        const newListing = {
            id: Date.now(),
            seller: `User...${currentUser.phone.slice(-4)}`,
            sellerId: currentUser.phone,
            data: dataAmount,
            price: sellerPrice + 10, // Listing price with 10 credit commission
            sellerGets: sellerPrice,
        };
        setMarketplaceListings(prev => [newListing, ...prev]);

        setDataToSell('');
        setPriceToSell('');
        showMessage(`Successfully listed ${dataAmount}GB for sale at ${sellerPrice + 10} credits. You will earn ${sellerPrice} credits upon sale.`);
    };

    const handleBuyData = (listing) => {
        if (currentUser.phone === listing.sellerId) {
            showMessage("You cannot buy your own listing.");
            return;
        }

        if (currentUser.walletBalance < listing.price) {
            showMessage("Insufficient credits in your wallet.");
            return;
        }

        const users = JSON.parse(localStorage.getItem('tariffGenieUsers')) || [];
        
        // --- Update Buyer ---
        const buyerIndex = users.findIndex(u => u.phone === currentUser.phone);
        if (buyerIndex === -1) {
             showMessage("Error: Could not find your user account.");
             return;
        }
        
        const updatedBuyer = {
            ...users[buyerIndex],
            walletBalance: users[buyerIndex].walletBalance - listing.price,
            transactionHistory: [
                { id: `buy-${Date.now()}`, type: 'buy', data: listing.data, price: listing.price, date: new Date().toISOString() },
                ...(users[buyerIndex].transactionHistory || [])
            ]
        };
        users[buyerIndex] = updatedBuyer;
        setCurrentUser(updatedBuyer);

        // --- Update Seller ---
        const sellerIndex = users.findIndex(u => u.phone === listing.sellerId);
        if (sellerIndex !== -1) {
             const updatedSeller = {
                ...users[sellerIndex],
                walletBalance: users[sellerIndex].walletBalance + listing.sellerGets,
                transactionHistory: [
                    { id: `sell-${Date.now()}`, type: 'sell', data: listing.data, price: listing.sellerGets, date: new Date().toISOString() },
                     ...(users[sellerIndex].transactionHistory || [])
                ]
            };
            users[sellerIndex] = updatedSeller;
        }

        localStorage.setItem('tariffGenieUsers', JSON.stringify(users));
        setMarketplaceListings(prev => prev.filter(item => item.id !== listing.id));
        showMessage(`Successfully purchased ${listing.data} GB for ${listing.price} credits.`);
    };

    const handleInitiatePurchase = (plan) => {
        setPlanToBuy(plan);
    };

    const handleConfirmPurchase = (plan) => {
        const updatedUser = {
            ...currentUser,
            purchasedPlan: { ...plan, purchaseDate: new Date().toISOString() },
            purchaseHistory: [{ ...plan, purchaseDate: new Date().toISOString() }, ...(currentUser.purchaseHistory || [])]
        };
        setCurrentUser(updatedUser);
        updateUserInStorage(updatedUser);

        setPlanToBuy(null);
        showMessage(`Successfully purchased the ${plan.operator} ₹${plan.price} plan!`);
        setPage('account');
        setIsStyleModalOpen(false); 
        setIsChatbotOpen(false);
    };

    const handleSelectSubscription = (planName) => {
        let creditsToAdd = 0;
        if (planName === 'Basic') creditsToAdd = 25;
        if (planName === 'Pro') creditsToAdd = Infinity;
        if (planName === 'Enterprise') creditsToAdd = Infinity;

        showMessage(`You have subscribed to the ${planName} plan. This is a demo.`);
        setIsSubscriptionModalOpen(false);
        const updatedUser = {...currentUser, recommendationCredits: creditsToAdd, subscriptionTier: planName };
        setCurrentUser(updatedUser);
        updateUserInStorage(updatedUser);
    };


    const getBestPlan = (plans, count = 1) => {
        if (!plans || plans.length === 0) return null;
    
        const getNetworkScore = (op) => !towerSignalData ? 0 : (towerSignalData[op] / 20) * 15;
        
        const scoredPlans = plans.map(p => ({
            ...p,
            score: (p.dataPerDay * 5) - (p.price / 100) + (p.popularityScore / 10) + getNetworkScore(p.operator)
        }));
    
        scoredPlans.sort((a, b) => b.score - a.score);
        return count === 1 ? scoredPlans[0] : scoredPlans.slice(0, count);
    };


    useEffect(() => {
        if (page === 'results' && activeTab === 'trends') {
            const ctx = document.getElementById('marketShareChart');
            if (ctx) {
                if (chartRef.current) { chartRef.current.destroy(); }
                const operatorNames = Object.keys(mockMarketData);
                const totalPurchases = Object.values(mockMarketData);
                chartRef.current = new Chart(ctx.getContext('2d'), { type: 'pie', data: { labels: operatorNames, datasets: [{ data: totalPurchases, backgroundColor: operatorNames.map(op => operatorColors[op] || '#00ADB5'), hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#124170', font: { size: 14 } } }, tooltip: { callbacks: { label: (c) => `${c.label}: ${((c.parsed / c.dataset.data.reduce((s, d) => s + d, 0)) * 100).toFixed(1)}%` } } } } });
            }
        }
        return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
    }, [page, activeTab]);

    const calculateMyPlanUsage = () => {
        if (!currentUser?.purchasedPlan) return { daysRemaining: 0, validityPercentage: 0, dataUsed: 0, totalData: 0, remainingData: 0, expiryDate: new Date() };
        
        const { purchasedPlan: plan } = currentUser;
        const purchaseDate = new Date(plan.purchaseDate);
        const expiryDate = new Date(purchaseDate); expiryDate.setDate(purchaseDate.getDate() + plan.validity);
        const today = new Date();
        const daysRemaining = Math.max(0, Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)));
        const daysPassed = plan.validity - daysRemaining;
        const validityPercentage = (daysPassed / plan.validity) * 100;
        const totalData = plan.dataPerDay * plan.validity;
        const dataUsed = daysPassed * plan.dataPerDay;
        const remainingData = totalData - dataUsed;

        return { daysRemaining, validityPercentage, dataUsed, totalData, expiryDate, remainingData };
    };

    const subscriptionGlow = currentUser?.subscriptionTier && currentUser.subscriptionTier !== 'None' ? 'ring-2 ring-offset-2 ring-amber-400 shadow-amber-400/50' : '';


    return (
        <div className="bg-gradient-to-br from-[#dde4e7] to-[#d2f4e0] text-[#124170] min-h-screen">
            <style>{`
                :root { --bg-color: #DDF4E7; --card-bg: #FFFFFF; --accent-bg: #67C090; --primary-color: #26667F; --secondary-color: #124170; }
                body { font-family: 'Inter', sans-serif; }
                .shine-button { position: relative; overflow: hidden; transition: all 0.3s ease; }
                .shine-button:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.2); transform: translateY(-2px); }
                .shine-button::after { content: ''; position: absolute; top: -50%; left: -60%; width: 20%; height: 200%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%); transform: rotate(20deg); }
                .shine-button:hover::after { animation: shine 0.75s ease; }
                @keyframes shine { 0% {left: -100%} 20% {left: 120%} 100% {left: 120%} }
                input[type="range"] { -webkit-appearance: none; appearance: none; width: 100%; height: 12px; background: var(--accent-bg); border-radius: 6px; outline: none; cursor: pointer; }
                input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; background-color: var(--primary-color); border: 4px solid var(--card-bg); border-radius: 50%; cursor: pointer; transition: transform 0.2s; }
                input[type="range"]:hover::-webkit-slider-thumb { transform: scale(1.1); }
                input[type="checkbox"], input[type="radio"] { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border: 2px solid var(--primary-color); border-radius: 0.375rem; cursor: pointer; position: relative; transition: all 0.2s ease-in-out; }
                input[type="checkbox"]:checked, input[type="radio"]:checked { background-color: var(--primary-color); border-color: var(--primary-color); }
                input[type="radio"] { border-radius: 50%; }
                input[type="checkbox"]:checked::after { content: '✓'; position: absolute; top: 50%; left: 50%; color: white; font-size: 14px; font-weight: bold; transform: translate(-50%, -50%); }
                @keyframes modal-enter { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-modal-enter { animation: modal-enter 0.3s ease-out forwards; }
                .plans-grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; padding: 1rem; overflow: auto; border-radius: 1rem; }
                .message-box { position: fixed; top: 1rem; right: 1rem; z-index: 1000; padding: 0.75rem 1.5rem; background-color: var(--primary-color); color: white; border-radius: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: all 0.3s ease-in-out; transform: translateX(120%); }
                .message-box.visible { transform: translateX(0); }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animated-fade-in-up { opacity: 0; animation: fade-in-up 0.6s ease-out forwards; animation-fill-mode: forwards; }
                @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes logo-pop-in { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
                .logo-animate { animation: logo-pop-in 1.2s ease-out forwards; }
                .tab-button { border-radius: 0.75rem; transition: all 0.3s ease-in-out; padding: 0.5rem 1rem; font-weight: 600; text-align: center; border: 2px solid transparent; }
                .tab-button.active { background-color: var(--primary-color); color: white; box-shadow: 0 4px 10px rgba(38, 102, 127, 0.4); }
                .tab-button:not(.active) { border-color: var(--primary-color); color: var(--primary-color); }
                @keyframes ping-slow { 0% { transform: scale(1); opacity: 0.75; } 100% { transform: scale(2.5); opacity: 0; } }
                .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
            `}</style>
            
            {page === 'splash' && (
                <div id="splash-screen" className="min-h-screen flex flex-col justify-center items-center text-center">
                    <Logo className="w-24 h-24 logo-animate" />
                    <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#26667F] to-[#67C090] mt-4 animated-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        TariffGenie
                    </h1>
                </div>
            )}

            {page === 'home' && (
                 <section id="home-page" className="min-h-screen flex flex-col justify-center items-center text-center px-4 animated-fade-in-up">
                     <div className="w-full max-w-2xl">
                         <Logo className="w-20 h-20 mx-auto mb-4" />
                         <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#26667F] to-[#67C090] mb-4">
                             TariffGenie
                         </h1>
                         <p className="text-xl text-[#124170] mb-8">
                             Provides users with tailored tariff plan suggestions, ensuring they get the best plan for their needs.
                         </p>
                         <button onClick={() => setPage('auth')} className="px-8 py-4 text-lg font-bold rounded-full bg-[#26667F] text-white shadow-lg shine-button">
                             Get Started
                         </button>
                     </div>
                 </section>
            )}
            
             {page !== 'splash' && page !== 'home' && (
                 <header className="absolute top-0 left-0 w-full p-4 z-20">
                     <div className="container mx-auto flex items-center justify-between">
                         <div className="flex items-center gap-2 cursor-pointer" onClick={() => currentUser ? setPage('preferences') : setPage('home')}>
                             <Logo className="h-10 w-10" />
                             <span className="text-xl font-bold text-[#26667F]">TariffGenie</span>
                         </div>
                         {currentUser && (page === 'preferences' || page === 'results' || page === 'account' || page === 'about') && (
                             <div className="flex items-center gap-4">
                                 <nav className="hidden sm:flex items-center gap-2 bg-white/70 backdrop-blur-sm p-2 rounded-full shadow-sm">
                                     <button onClick={() => setPage('preferences')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${page === 'preferences' ? 'bg-[#26667F] text-white' : 'hover:bg-gray-200'}`}>Preferences</button>
                                     <button onClick={() => setPage('results')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${page === 'results' ? 'bg-[#26667F] text-white' : 'hover:bg-gray-200'}`}>Find Plans</button>
                                     <button onClick={() => setPage('about')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${page === 'about' ? 'bg-[#26667F] text-white' : 'hover:bg-gray-200'}`}>About TariffGenie</button>
                                 </nav>
                                 <button onClick={() => setPage('account')} className={`relative text-[#26667F] hover:text-[#124170] bg-white/70 p-2 rounded-full shadow-sm hover:shadow-md transition-all ${page === 'account' ? 'ring-2 ring-[#67C090]' : ''} ${subscriptionGlow}`}>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a5.5 5.5 0 0 1 3.096 10.047 9.005 9.005 0 0 1 5.9 8.181.75.75 0 0 1-1.498.07 7.5 7.5 0 0 0-14.992 0 .75.75 0 0 1-1.498-.07 9.005 9.005 0 0 1 5.9-8.181A5.5 5.5 0 0 1 12 2.5ZM8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z" /></svg>
                                      {currentUser.subscriptionTier && currentUser.subscriptionTier !== 'None' && (
                                        <span className="absolute -top-2 -right-3 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                                            {currentUser.subscriptionTier.toUpperCase()}
                                        </span>
                                    )}
                                 </button>
                                 <button 
                                     onClick={() => setIsChatbotOpen(!isChatbotOpen)}
                                     className={`text-[#26667F] hover:text-[#124170] bg-white/70 p-2 rounded-full shadow-sm hover:shadow-md transition-all ${isChatbotOpen ? 'ring-2 ring-[#67C090]' : ''}`}
                                     aria-label="Toggle Chatbot"
                                 >
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                 </button>
                             </div>
                         )}
                     </div>
                 </header>
            )}

            {page === 'auth' && ( <section id="auth-page" className="min-h-screen flex flex-col justify-center items-center text-center px-4 animated-fade-in-up pt-20"><div className="w-full max-w-md"><h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#26667F] to-[#67C090] mb-6">Welcome back!</h1><div className="card w-full"><div className="flex border-b border-gray-200 mb-6"><button onClick={()=>setAuthMode('login')} className={`flex-1 py-3 font-semibold text-lg transition-colors ${authMode==='login' ? 'text-[#26667F] border-b-2 border-[#26667F]' : 'text-gray-500'}`}>Login</button><button onClick={()=>setAuthMode('register')} className={`flex-1 py-3 font-semibold text-lg transition-colors ${authMode==='register' ? 'text-[#26667F] border-b-2 border-[#26667F]' : 'text-gray-500'}`}>Register</button></div>{authMode==='login' ? (<><form onSubmit={handleLogin} className="space-y-6"><input type="tel" placeholder="10-Digit Phone Number" value={loginPhone} onChange={(e)=>setLoginPhone(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#DDF4E7] text-[#124170] border-2 border-[#67C090] focus:outline-none focus:border-[#26667F]" maxLength="10" pattern="\d{10}" title="Phone number must be 10 digits."/><button type="submit" className="w-full px-8 py-3 text-lg font-bold rounded-lg bg-[#26667F] text-white shadow-lg shine-button">Login</button></form><p className="mt-4 text-sm text-center">Don't have an account? <button onClick={()=>setAuthMode('register')} className="font-semibold text-[#67C090] hover:underline">Register now</button></p></>) : (<><form onSubmit={handleRegister} className="space-y-6"><input type="tel" placeholder="10-Digit Phone Number" value={registerPhone} onChange={(e)=>setRegisterPhone(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#DDF4E7] text-[#124170] border-2 border-[#67C090] focus:outline-none focus:border-[#26667F]" required maxLength="10" pattern="\d{10}" title="Phone number must be 10 digits."/><input type="date" placeholder="Date of Birth" value={registerDob} onChange={(e)=>setRegisterDob(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#DDF4E7] text-[#124170] border-2 border-[#67C090] focus:outline-none focus:border-[#26667F]" required/><div className="relative"><input type="text" placeholder="Your City" value={registerLocation} onChange={handleRegisterLocationChange} className="w-full px-4 py-3 rounded-lg bg-[#DDF4E7] text-[#124170] border-2 border-[#67C090] focus:outline-none focus:border-[#26667F]" required/>{registerCitySuggestions.length > 0 && (<ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">{registerCitySuggestions.map(city => <li key={city} onClick={() => handleRegisterSuggestionClick(city)} className="px-4 py-2 cursor-pointer hover:bg-gray-100">{city}</li>)}</ul>)}</div><button type="submit" className="w-full px-8 py-3 text-lg font-bold rounded-lg bg-[#26667F] text-white shadow-lg shine-button">Register</button></form><p className="mt-4 text-sm text-center">Already have an account? <button onClick={()=>setAuthMode('login')} className="font-semibold text-[#67C090] hover:underline">Login here</button></p></>)}</div></div></section>)}
            
            {page === 'account' && currentUser && <AccountPage currentUser={currentUser} calculateMyPlanUsage={calculateMyPlanUsage} handleLogout={handleLogout} onSubscribeClick={() => setIsSubscriptionModalOpen(true)} />}
            
            {page === 'about' && <AboutTariffGeniePage />}

            {page === 'preferences' && currentUser && (
                <section id="preferences-section" className="min-h-screen pt-28 pb-12 flex flex-col items-center px-4">
                    <div className="container mx-auto">
                        <div className="card animated-fade-in-up p-4 sm:p-8">
                            <h2 className="text-3xl font-semibold mb-4 text-[#26667F] text-center">Find Your Perfect Plan</h2>
                            <p className="text-center text-[#124170] mb-6">Find a plan by your style, or fine-tune every detail below.</p>
                            
                             <NearbyTowersMap 
                                towerSignalData={towerSignalData}
                                locationStatus={locationStatus}
                                onManualLocationSubmit={handleManualLocationSubmit}
                                onManualLocationChange={handleManualLocationChange}
                                manualLocation={manualLocation}
                                onSuggestionClick={handleSuggestionClick}
                                citySuggestions={citySuggestions}
                             />

                            <div className="mb-8 p-4 bg-gradient-to-r from-[#67C090] to-[#26667F] rounded-xl shadow-lg"><h3 className="text-lg font-bold text-white mb-4 text-center">Find Plans by Your Style</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{planCategories.map(cat => <div key={cat.name} onClick={() => handleStyleCategoryClick(cat)} className="p-4 rounded-lg text-center cursor-pointer bg-white/80 text-[#124170] transition-all duration-300 transform hover:scale-105 hover:bg-white"><div className="flex justify-center mb-2">{cat.icon}</div><h4 className="font-bold">{cat.name}</h4><p className="text-xs hidden md:block">{cat.description}</p></div>)}</div></div>
                            <div className="flex items-center justify-between p-4 mb-8 bg-gradient-to-r from-[#67C090] to-[#26667F] rounded-xl shadow-lg"><label htmlFor="popularToggle" className="text-lg font-medium text-white">View Most Popular Plans</label><button onClick={handleShowPopularPlansModal} className="px-4 py-2 text-sm font-bold rounded-full bg-[#F9A826] text-white hover:bg-amber-500 transition-colors">Show Me</button></div>
                            
                            <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-md">
                                <h3 className="text-xl font-semibold mb-6 text-[#26667F] text-center border-b pb-4">Set Your Detailed Preferences</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="p-4 bg-white/50 rounded-lg"><h4 className="font-bold text-[#124170] border-b pb-2 mb-3">Budget & Data</h4><div className="space-y-4"><div><h3 className="text-sm font-medium text-[#67C090] mb-3">Budget Range</h3><div className="flex flex-col space-y-2"><label className="flex items-center"><input type="radio" name="userPersona" value="low" checked={userPersona === 'low'} onChange={(e) => setUserPersona(e.target.value)} /><span className="ml-2">Low (Under ₹400)</span></label><label className="flex items-center"><input type="radio" name="userPersona" value="medium" checked={userPersona === 'medium'} onChange={(e) => setUserPersona(e.target.value)} /><span className="ml-2">Medium (₹400-₹800)</span></label><label className="flex items-center"><input type="radio" name="userPersona" value="high" checked={userPersona === 'high'} onChange={(e) => setUserPersona(e.target.value)} /><span className="ml-2">High (Over ₹800)</span></label></div></div><div><label htmlFor="dataSlider" className="block text-sm font-medium text-[#67C090] mb-2">Daily Data Need</label><input type="range" id="dataSlider" min="1" max="5" step="0.5" value={dataNeed} onChange={(e) => setDataNeed(Number(e.target.value))} /><div className="flex justify-between text-xs mt-1"><span>1 GB</span><span className="font-bold">{dataNeed} GB</span><span>5 GB</span></div></div></div></div>
                                        <div className="p-4 bg-white/50 rounded-lg"><h4 className="font-bold text-[#124170] border-b pb-2 mb-3">Calls & SMS</h4><div className="grid grid-cols-2 gap-4"><div><h3 className="text-sm font-medium text-[#67C090] mb-2">Preferred Calls</h3><div className="flex flex-col space-y-2">{CALLS_OPTIONS.map(o => <label key={o} className="flex items-center"><input type="radio" name="calls" value={o} checked={filters.calls === o} onChange={handleFilterChange} /><span className="ml-2">{o}{o !== 'Unlimited' && o !== 'Any' && ' Minutes'}</span></label>)}</div></div><div><h3 className="text-sm font-medium text-[#67C090] mb-2">Preferred SMS</h3><div className="flex flex-col space-y-2">{SMS_OPTIONS.map(o => <label key={o} className="flex items-center"><input type="radio" name="sms" value={o} checked={filters.sms === o} onChange={handleFilterChange} /><span className="ml-2">{o}{o !== 'Unlimited' && o !== 'Any' && '/day'}</span></label>)}</div></div></div></div>
                                    </div>
                                    <div className="space-y-6">
                                         <div className="p-4 bg-white/50 rounded-lg"><h4 className="font-bold text-[#124170] border-b pb-2 mb-3">Network & Validity</h4><div className="grid grid-cols-2 gap-4"><div><h3 className="text-sm font-medium text-[#67C090] mb-2">Operator</h3><div className="flex flex-col space-y-2">{OPERATORS.map(op => <label key={op} className="flex items-center"><input type="checkbox" name="operators" value={op} onChange={handleFilterChange} checked={filters.operators.includes(op)} /><span className="ml-2">{op}</span></label>)}</div></div><div><h3 className="text-sm font-medium text-[#67C090] mb-2">Validity</h3><div className="flex flex-col space-y-2">{VALIDITY_OPTIONS.map(days => (<label key={days} className="flex items-center"><input type="checkbox" name="validity" value={String(days)} onChange={handleFilterChange} checked={filters.validity.includes(String(days))}/><span className="ml-2">{days} Days</span></label>))}</div></div></div></div>
                                         <div className="p-4 bg-white/50 rounded-lg"><h4 className="font-bold text-[#124170] border-b pb-2 mb-3">Extras and Add-ons</h4><div className="grid grid-cols-2 gap-4"><div><h3 className="text-sm font-medium text-[#67C090] mb-2">Speed</h3><div className="flex flex-col space-y-2">{SPEED_OPTIONS.map(speed => (<label key={speed} className="flex items-center"><input type="radio" name="speed" value={speed} checked={filters.speed === speed} onChange={handleFilterChange} /><span className="ml-2">{speed === 'no preference' ? 'Any' : speed.toUpperCase()}</span></label>))}</div></div><div><h3 className="text-sm font-medium text-[#67C090] mb-2">OTT Bundles</h3><label className="flex items-center mb-2"><input type="checkbox" checked={isOttSelected} onChange={(e) => setIsOttSelected(e.target.checked)} /><span className="ml-2 font-bold">Yes, I want OTT</span></label>{isOttSelected && (<div className="flex flex-col space-y-2 ml-6">{OTT_SERVICES.map(service => <label key={service} className="flex items-center"><input type="checkbox" name="ottServices" value={service} onChange={handleFilterChange} checked={filters.ottServices.includes(service)}/><span className="ml-2">{service}</span></label>)}</div>)}</div></div></div>
                                    </div>
                                </div>
                                 <div className="text-center mt-8"><button onClick={showFilteredPlans} className="px-8 py-4 text-lg sm:text-xl font-bold rounded-full bg-[#26667F] text-white shadow-lg shine-button">Show My Plans</button></div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {page === 'results' && currentUser && (
                <section id="results-section" className="min-h-screen pt-28 pb-12 flex flex-col items-center">
                    <div className="container mx-auto">
                        <div className="card h-full flex flex-col relative p-4 sm:p-8">
                            
                            <div className="flex flex-wrap justify-center items-center mb-6 gap-2 bg-white/50 backdrop-blur-sm p-2 rounded-full shadow-inner">
                                <button onClick={()=>setActiveTab('plans')} className={`tab-button text-xs sm:text-base ${activeTab==='plans'?'active':''}`}>Plans</button>
                                <button onClick={() => setActiveTab('dataXchange')} className={`tab-button text-xs sm:text-base ${activeTab === 'dataXchange' ? 'active' : ''}`}>DataXchange</button>
                                <button onClick={openComparisonModal} className="tab-button text-xs sm:text-base">Compare</button>
                                <button onClick={()=>setActiveTab('trends')} className={`tab-button text-xs sm:text-base ${activeTab==='trends'?'active':''}`}>Trends</button>
                            </div>
                            
                            <div className="flex-grow mt-6">
                                {activeTab === 'plans' && (
                                    <div id="plansTab" className="animated-fade-in-up">
                                        <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center mb-6 gap-4">
                                            <h3 className="text-xl font-semibold text-[#26667F] flex-shrink-0">{recommendationTitle}</h3>
                                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                                <input type="text" placeholder="Search by price, GB, OTT..." value={searchQuery} onChange={(e)=>handleSearch(e.target.value)} className="px-4 py-2 border border-[#26667F] rounded-full w-full sm:w-auto"/>
                                                <button onClick={findBestTariffPlans} className="bg-[#26667F] hover:bg-[#124170] text-white font-bold py-2 px-6 rounded-full transition shine-button disabled:opacity-50" disabled={isFindingBest}>{isFindingBest?'Analyzing...':'Find My Best'}</button>
                                                <button onClick={resetFiltersAndPlans} className="text-sm font-semibold text-[#26667F] hover:underline">Reset</button>
                                            </div>
                                        </div>
                                        <div id="resultsGrid" className="plans-grid-container"><PlansGrid plans={recommendedPlans} plansToCompare={plansToCompare} handleCompareChange={handleCompareChange} showCompare={true} onBuyNow={handleInitiatePurchase} /></div>
                                    </div>
                                )}
                                {activeTab === 'dataXchange' && <div id="dataXchangeTab" className="animated-fade-in-up"><DataXchangeTab currentUser={currentUser} calculateMyPlanUsage={calculateMyPlanUsage} dataToSell={dataToSell} setDataToSell={setDataToSell} priceToSell={priceToSell} setPriceToSell={setPriceToSell} handleSellData={handleSellData} marketplaceListings={marketplaceListings} handleBuyData={handleBuyData} /></div>}
                                {activeTab === 'trends' && (
                                    <div id="trendsTab" className="animated-fade-in-up">
                                        <h3 className="text-3xl font-bold text-[#124170] text-center mb-6">Total Market Share</h3>
                                        <div className="p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-md h-96"><canvas id="marketShareChart"></canvas></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}
            
            <VisualComparisonModal isOpen={isComparisonModalOpen} onClose={() => setIsComparisonModalOpen(false)} comparisonSet={comparisonSet} getBestPlan={getBestPlan} />
            <StyleModal isOpen={isStyleModalOpen} onClose={handleCloseStyleModal} content={styleModalContent} onFindBest={findBestPlansInModal} isFindingBest={isFindingBest} onBuyNow={handleInitiatePurchase} />
            <PurchaseModal plan={planToBuy} onClose={() => setPlanToBuy(null)} onConfirm={handleConfirmPurchase} />
            <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} onSelectPlan={handleSelectSubscription} />
            
             {/* Chatbot UI */}
            {page !== 'splash' && page !== 'home' && page !== 'auth' && currentUser && (
                 <Chatbot 
                     isOpen={isChatbotOpen}
                     onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
                     messages={chatMessages}
                     onSendMessage={handleSendMessage}
                     input={chatInput}
                     onInputChange={(e) => setChatInput(e.target.value)}
                     chatBodyRef={chatBodyRef}
                     onBuyNow={handleInitiatePurchase}
                />
            )}

            <div className={`message-box ${isMessageVisible ? 'visible' : ''}`} role="alert">{message}</div>
        </div>
    );
};

export default App;

