exports.verifyAdmin = (req, res, next) => {
  const userRole = req.headers.role || req.body.role || req.user?.role;

  if (userRole !== "admin") {
    return res.status(403).send({ msg: "Admin access only" });
  }
  next();
};
