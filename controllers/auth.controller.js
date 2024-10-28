const {
  findUserByUsername,
  verifyPassword,
  postRegisteredUser,
} = require("../models/auth.model");

exports.loginUser = (req, res, next) => {
  const { username, password } = req.body;

  findUserByUsername(username)
    .then((user) => {
      return verifyPassword(password, user.password).then(() => {
        delete user.password;
        return res.status(200).send(user);
      });
    })
    .catch((err) => {
      next(err);
    });
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
      delete user.password;
      return res.status(200).send(user);
    })
    .catch((err) => {
      next(err);
    });
};
