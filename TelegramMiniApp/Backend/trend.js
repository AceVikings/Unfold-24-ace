const fs = require("fs");

function generateCryptoPrices(totalPoints) {
  const prices = [];
  let currentPrice = 50000; // Starting price
  const pointsPerSide = Math.floor(totalPoints / 2);
  const now = new Date().getTime();

  // Generate past prices
  for (let i = pointsPerSide; i > 0; i--) {
    const change = (Math.random() - 0.5) * 1000;
    currentPrice += change;
    if (currentPrice < 0) currentPrice = 0;

    prices.push({
      timestamp: now - i * 60000, // Past timestamps
      price: currentPrice.toFixed(2),
    });
  }

  // Generate future prices
  for (let i = 0; i < pointsPerSide; i++) {
    const change = (Math.random() - 0.5) * 1000;
    currentPrice += change;
    if (currentPrice < 0) currentPrice = 0;

    prices.push({
      timestamp: now + i * 60000, // Future timestamps
      price: currentPrice.toFixed(2),
    });
  }

  return prices.sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp
}

const dataPoints = generateCryptoPrices(10000);

fs.writeFileSync(
  "cryptoPrices.json",
  JSON.stringify(dataPoints, null, 2),
  "utf-8"
);

console.log("Data points generated and saved to cryptoPrices.json");
