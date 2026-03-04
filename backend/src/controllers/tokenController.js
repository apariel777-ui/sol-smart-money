const fs = require("fs");
const path = require("path");
const { fetchTokenTransactions } = require("../services/walletService");

// 📁 Path to JSON cache file
const cachePath = path.join(__dirname, "../../data/tokenCache.json");

// Load cache from file (if exists)
let cache = {};
if (fs.existsSync(cachePath)) {
  try {
    cache = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
  } catch (err) {
    console.error("Error loading cache file:", err);
    cache = {};
  }
}

exports.getTokenSmartMoney = async (req, res) => {
  try {
    const address = req.params.address;

    // 🔎 Check JSON cache first
    if (cache[address]) {
      console.log("Loaded from JSON cache");
      return res.json({
        success: true,
        source: "database",
        data: cache[address]
      });
    }

    console.log("Running fresh analysis");

    // 🔥 Use real fetch when ready
    const rawData = await fetchTokenTransactions(address);

console.log("RAW DATA LENGTH:", rawData.length);
console.log("RAW DATA:", rawData);

    const scored = rawData.map(wallet => {
      let score = 0;

      if (wallet.minutesAfterLaunch <= 2) score += 40;
      else if (wallet.minutesAfterLaunch <= 5) score += 25;

      if (wallet.netAmount > 5000) score += 30;
      else if (wallet.netAmount > 1000) score += 15;

      score += wallet.holdingScore * 30;

      return {
        ...wallet,
        smartScore: score
      };
    });

    const finalData = scored
      .sort((a, b) => b.smartScore - a.smartScore)
      .slice(0, 10);

  

    // 💾 Save to JSON file
    cache[address] = finalData;
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));

    res.json({
      success: true,
      source: "fresh_analysis",
      data: finalData
    });

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};