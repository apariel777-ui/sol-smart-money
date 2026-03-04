
const express = require('express');
const cors = require('cors');
const tokenRoutes = require('./routes/tokenRoutes');
const rateLimit = require("express-rate-limit");

const app = express();

app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per IP
  message: {
    success: false,
    message: "Too many requests. Try again later."
  }
});

app.use('/api/token', apiLimiter, tokenRoutes);

module.exports = app;