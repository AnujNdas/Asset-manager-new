const jwt = require("jsonwebtoken");

const authenticateToken = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        username: decoded.username,
        organizationId: decoded.organizationId || null, // 🔑 REQUIRED
      };

      // 🔒 Role-based access
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden: Access denied" });
      }

      next();
    } catch (error) {
      console.error("JWT verification failed:", error.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
};

module.exports = authenticateToken;
