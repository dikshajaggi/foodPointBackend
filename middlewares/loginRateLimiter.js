const rateLimit = require("express-rate-limit");

// Limit login attempts to 5 per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes -> window in milliseconds
  max: 5,                   // limit each IP to 5 requests per windowMs
  message: {
    msg: "Too many login attempts from this IP, please try again after 15 minutes"
  },
  standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false     // Disable the `X-RateLimit-*` headers
});


module.exports = loginLimiter