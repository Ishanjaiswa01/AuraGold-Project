const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

// Models & Services
const PriceData = require('./models/PriceData');
const { generatePrediction } = require('./predictionService');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json()); // CRITICAL: Allows reading JSON in POST requests

// --- Database Connection ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected successfully');
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB:', err.message);
        // Don't kill the process immediately in dev, but log the error
    }
};
connectDB();

// --- API Endpoints ---

// 1. Root Test Route
app.get('/', (req, res) => {
    res.send('AuraGold Backend is running!');
});

// 2. System Health Route (Check DB Status)
app.get('/api/status', (req, res) => {
    res.json({
        server: 'Online',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date()
    });
});

// 3. Metrics Data Route (Static Dashboard Stats)
app.get('/api/metrics', (req, res) => {
    const metricsData = {
        currentPrice: { value: 2415.50, change: "+0.25%" },
        forecast: { value: 2421.75, change: "+0.51%" },
        accuracy: { value: "94.7%", change: "Stable" },
        sentiment: { value: "Bullish 🐂", change: "Improving" },
    };
    res.json(metricsData);
});

// 4. Chart Data Route (with DB caching and AI prediction)
app.get('/api/chartdata', async (req, res) => {
    try {
        // Check for cached data from the last 24 hours
        const cachedData = await PriceData.findOne({ symbol: 'GLD' }).sort({ createdAt: -1 });
        const oneDay = 24 * 60 * 60 * 1000;

        if (cachedData && (new Date() - cachedData.createdAt) < oneDay) {
            console.log("📦 Serving from Cache");
            return res.json({ labels: cachedData.labels, prices: cachedData.prices });
        }

        // Cache stale - Fetch from Alpha Vantage
        console.log("🌐 Fetching fresh data from Alpha Vantage...");
        const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=GLD&outputsize=compact&apikey=${apiKey}`;
        
        const response = await axios.get(url);

        if (response.data['Note']) {
            return res.status(429).json({ error: "API Limit Reached (Alpha Vantage)" });
        }

        const dailyData = response.data['Time Series (Daily)'];
        if (!dailyData) throw new Error("Invalid API Response Structure");

        const dates = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b));
        const recentDates = dates.slice(-30);

        const historicalLabels = recentDates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const historicalPrices = recentDates.map(date => parseFloat(dailyData[date]['4. close']));
        
        // Generate Predictions
        const predictedPrices = generatePrediction(historicalPrices, 7);
        const lastDate = new Date(recentDates[recentDates.length - 1]);
        const predictedLabels = [];

        for (let i = 1; i <= 7; i++) {
            const nextDate = new Date(lastDate);
            nextDate.setDate(lastDate.getDate() + i);
            predictedLabels.push(nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }

        const finalLabels = [...historicalLabels, ...predictedLabels];
        const finalPrices = [...historicalPrices, ...predictedPrices];

        // Update Cache: Clear old entries and save new one
        await PriceData.deleteMany({ symbol: 'GLD' });
        const newPriceData = new PriceData({ 
            symbol: 'GLD',
            labels: finalLabels, 
            prices: finalPrices 
        });
        await newPriceData.save();

        res.json({ labels: finalLabels, prices: finalPrices });

    } catch (error) {
        console.error("Error in /api/chartdata:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 5. News Data Route
app.get('/api/news', async (req, res) => {
    try {
        const apiKey = process.env.NEWS_API_KEY;
        const url = `https://newsapi.org/v2/everything?q=gold+investing&sortBy=publishedAt&language=en&apiKey=${apiKey}`;
        const response = await axios.get(url);
        
        const articles = response.data.articles.slice(0, 5).map((article, index) => ({
            id: index,
            source: article.source.name,
            time: new Date(article.publishedAt).toLocaleDateString(),
            headline: article.title,
            url: article.url,
            sentiment: 'Neutral'
        }));
        
        res.json(articles);
    } catch (error) {
        console.error("Error fetching news:", error.message);
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

// 6. Manual Cache Reset (Useful for testing)
app.post('/api/admin/clear-cache', async (req, res) => {
    try {
        await PriceData.deleteMany({});
        res.json({ message: "Database cache cleared" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});