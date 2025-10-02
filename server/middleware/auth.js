const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.cookies.authToken;
  if (!token) return res.status(401).send({ message: "No token, unauthorized" });

  jwt.verify(token, process.env.JWTPRIVATEKEY, {}, (err, userData) => {
    if (err) return res.status(403).send({ message: "Invalid token" });

    req.user = userData; // attach payload to request
    next();
  });
}

module.exports = auth;
