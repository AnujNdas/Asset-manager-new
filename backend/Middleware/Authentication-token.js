const jwt = require("jsonwebtoken");

const authenticateToken = (roles = []) => {
  return (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const decoded = jwt.verify(token, "jwt_secret");
      req.user = decoded; // contains { id, email, role }

      // ✅ Role check
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden: Access denied" });
      }

      next();
    } catch (error) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
  };
};

module.exports = authenticateToken;
