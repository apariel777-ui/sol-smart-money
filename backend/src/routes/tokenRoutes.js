const express = require("express");
const router = express.Router();
const { getTokenSmartMoney } = require("../controllers/tokenController");
const checkUsage = require("../middleware/checkUsage");

router.get("/:address", checkUsage, getTokenSmartMoney);

module.exports = router;