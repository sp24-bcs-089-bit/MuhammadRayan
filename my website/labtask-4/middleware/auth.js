const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {
  if (req.session.user) {
    return next();
  }

  req.flash("error", "Please log in to continue");
  res.redirect("/auth/login");
}

function isAdmin(req, res, next) {
  if (
    req.session.user &&
    req.session.user.role === "admin"
  ) {
    return next();
  }

  req.flash("error", "Access Denied");
  res.redirect("/");
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

module.exports = {
  isLoggedIn,
  isAdmin,
  verifyToken,
};