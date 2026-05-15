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

module.exports = {
  isLoggedIn,
  isAdmin,
};