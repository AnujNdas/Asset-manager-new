module.exports = (req, res, next) => {
  if (req.user.role === "super-admin") {
    return next(); // full access
  }

  if (!req.user.organizationId) {
    return res.status(403).json({ error: "Organization not assigned" });
  }

  req.organizationId = req.user.organizationId;
  next();
};
/* ============================*/