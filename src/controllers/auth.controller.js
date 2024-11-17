const jwt = require("jsonwebtoken");
const {
  findUserByUsername,
  verifyPassword,
  postRegisteredUser,
  fetchUserData,
} = require("../models/auth.model");

exports.loginUser = (req, res, next) => {
  const { username, password } = req.body;

  findUserByUsername(username)
    .then((user) => {
      return verifyPassword(password, user.password).then(() => {
        const token = jwt.sign(
          { user_id: user.user_id, username: user.username, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        delete user.password; // Remove sensitive data
        res.status(200).send({ user, token });
      });
    })
    .catch(next); // Pass errors to global error handler
};

exports.registerUser = (req, res, next) => {
  const { username, password, first_name, last_name, email, number, role } =
    req.body;

  if (
    !username ||
    !password ||
    !first_name ||
    !last_name ||
    !email ||
    !number ||
    !role
  ) {
    return res.status(400).send({ msg: "Missing field required" });
  }

  postRegisteredUser(
    username,
    password,
    first_name,
    last_name,
    email,
    number,
    role
  )
    .then((user) => {
      const token = jwt.sign(
        { user_id: user.user_id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      delete user.password; // Remove sensitive data
      return res.status(200).send({ user, token });
    })
    .catch(next); // Pass errors to global error handler
};

exports.getUser = (req, res, next) => {
  const { user_id } = req.user;

  fetchUserData(user_id)
    .then((userData) => {
      if (!userData) {
        return res.status(404).send({ msg: "User not found" });
      }
      delete userData.password; // Remove sensitive data
      return res.status(200).send(userData);
    })
    .catch(next); // Pass errors to global error handler
};