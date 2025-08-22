const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  console.log("Received Token:", token); // Debug token

  try {
    const decoded = jwt.verify(token, "jwt_secret");
    console.log("Decoded Token:", decoded); // Check payload
    req.user = decoded;
    next();
  } catch (error) {
    console.log("JWT Error:", error.message); // Will show 'jwt expired' or 'invalid signature'
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = authenticateToken;

