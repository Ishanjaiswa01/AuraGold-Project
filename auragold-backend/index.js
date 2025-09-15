const PriceData = require('./models/PriceData');
const { generatePrediction } = require('./predictionService');
const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');

// --- Database Connection ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    }
};
connectDB();

// --- Express App Setup ---
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;
app.use(cors());

// --- API Endpoints ---

// Test Route
app.get('/', (req, res) => {
    res.send('AuraGold Backend is running!');
});

// Metrics Data Route
app.get('/api/metrics', (req, res) => {
    const metricsData = {
        currentPrice: { value: 2415.50, change: "+0.25%" },
        forecast: { value: 2421.75, change: "+0.51%" },
        accuracy: { value: "94.7%", change: "Stable" },
        sentiment: { value: "Bullish 🐂", change: "Improving" },
    };
    res.json(metricsData);
});

// Chart Data Route (with DB caching and AI prediction)
app.get('/api/chartdata', async (req, res) => {
    try {
        // 1. Check the database first
        const cachedData = await PriceData.findOne({ symbol: 'GLD' }).sort({ createdAt: -1 });
        const oneDay = 24 * 60 * 60 * 1000;

        // 2. If we have recent data, serve it from the cache
        if (cachedData && (new Date() - cachedData.createdAt) < oneDay) {
            console.log("Serving chart data from DB cache.");
            return res.json({ labels: cachedData.labels, prices: cachedData.prices });
        }

        // 3. If no recent data, fetch from the API
        console.log("Cache stale or empty. Fetching new data from Alpha Vantage...");
        const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=GLD&outputsize=compact&apikey=${apiKey}`;
        const response = await axios.get(url);

        console.log('Full Alpha Vantage Response:', JSON.stringify(response.data, null, 2));

        if (response.data['Error Message'] || !response.data['Time Series (Daily)']) {
            throw new Error(response.data['Error Message'] || response.data['Note'] || response.data['Information'] || 'Invalid data from Alpha Vantage');
        }

        const dailyData = response.data['Time Series (Daily)'];
        const dates = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b));
        const recentDates = dates.slice(-30);

        const historicalLabels = recentDates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const historicalPrices = recentDates.map(date => parseFloat(dailyData[date]['4. close']));
        
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

        // 4. Save the fresh data to the database
        await PriceData.deleteMany({ symbol: 'GLD' });
        const newPriceData = new PriceData({ labels: finalLabels, prices: finalPrices });
        await newPriceData.save();
        console.log("New data fetched and saved to DB.");

        res.json({ labels: finalLabels, prices: finalPrices });

    } catch (error) {
        console.error("Error in /api/chartdata endpoint:", error.message);
        res.status(500).json({ error: "Failed to fetch or process financial data" });
    }
});

// News Data Route
app.get('/api/news', async (req, res) => {
    try {
        const apiKey = process.env.NEWS_API_KEY;
        const url = `https://newsapi.org/v2/everything?q=gold+investing&sortBy=publishedAt&language=en&apiKey=${apiKey}`;
        const response = await axios.get(url);
        const articles = response.data.articles.slice(0, 5);
        
        const formattedNews = articles.map((article, index) => ({
            id: index,
            source: article.source.name,
            time: new Date(article.publishedAt).toLocaleDateString(),
            headline: article.title,
            sentiment: 'Neutral'
        }));
        res.json(formattedNews);
    } catch (error) {
        console.error("Error fetching news from NewsAPI:", error.message);
        res.status(500).json({ error: "Failed to fetch news data" });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});