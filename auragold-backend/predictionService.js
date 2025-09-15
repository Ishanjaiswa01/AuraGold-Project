// src/predictionService.js
const ss = require('simple-statistics');

/**
 * Generates future price predictions using simple linear regression.
 * @param {number[]} historicalPrices - An array of past prices.
 * @param {number} daysToPredict - How many future days to predict.
 * @returns {number[]} An array of predicted prices.
 */
function generatePrediction(historicalPrices, daysToPredict) {
  // 1. Prepare the data for the regression model.
  // We need pairs of [time, price]. Time is just an index [0, 1, 2, ...].
  const dataForRegression = historicalPrices.map((price, index) => [index, price]);

  // 2. Create the linear regression model.
  // This gives us the 'm' (slope) and 'b' (y-intercept) for the trend line (y = mx + b).
  const { m, b } = ss.linearRegression(dataForRegression);
  const regressionLine = ss.linearRegressionLine({ m, b });

  // 3. Predict the future prices.
  const lastIndex = historicalPrices.length - 1;
  const predictions = [];

  for (let i = 1; i <= daysToPredict; i++) {
    // We predict the price for the next time steps (e.g., lastIndex + 1, lastIndex + 2, ...).
    const futureIndex = lastIndex + i;
    const predictedPrice = regressionLine(futureIndex);
    predictions.push(parseFloat(predictedPrice.toFixed(2)));
  }

  return predictions;
}

module.exports = { generatePrediction };