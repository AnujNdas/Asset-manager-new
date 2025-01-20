const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    // Verify token and decode user information
    const decoded = jwt.verify(token, "jwt_secret");
    req.user = decoded;  // Attach the decoded user info to the request object
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = authenticateToken;
