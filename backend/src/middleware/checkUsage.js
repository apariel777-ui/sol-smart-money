const fs = require("fs");
const path = require("path");

// 📁 Path to usage JSON file
const usagePath = path.join(__dirname, "../../data/usageCache.json");

// Load usage data
let usage = {};

if (fs.existsSync(usagePath)) {
  try {
    usage = JSON.parse(fs.readFileSync(usagePath, "utf-8"));
  } catch (err) {
    console.error("Error loading usage file:", err);
    usage = {};
  }
}

module.exports = (req, res, next) => {
  try {
    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "unknown";

    const today = new Date().toISOString().split("T")[0];

    // If IP not tracked yet
    if (!usage[ip]) {
      usage[ip] = {
        date: today,
        count: 1
      };

      fs.writeFileSync(usagePath, JSON.stringify(usage, null, 2));
      return next();
    }

    // If new day → reset count
    if (usage[ip].date !== today) {
      usage[ip] = {
        date: today,
        count: 1
      };

      fs.writeFileSync(usagePath, JSON.stringify(usage, null, 2));
      return next();
    }

    // Check daily limit (5)
    if (usage[ip].count >= 5) {
      return res.status(429).json({
        success: false,
        message: "Daily free limit reached (5 scans)."
      });
    }

    // Increment usage
    usage[ip].count += 1;
    fs.writeFileSync(usagePath, JSON.stringify(usage, null, 2));

    next();

  } catch (err) {
    console.error("Usage middleware error:", err);
    next(); // fail open
  }
};