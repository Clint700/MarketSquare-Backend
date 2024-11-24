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
        delete user.password;
        res.status(200).send({ user, token });
      });
    })
    .catch(next);
};

exports.registerUser = (req, res, next) => {
  const {
    username,
    password,
    first_name,
    last_name,
    email,
    number,
    role,
    address,
    preferences,
  } = req.body;

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
    role,
    address,
    preferences
  )
    .then((user) => {
      const token = jwt.sign(
        { user_id: user.user_id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      delete user.password;
      return res.status(200).send({ user, token });
    })
    .catch(next);
};

exports.getUser = (req, res, next) => {
  const { user_id } = req.user;

  fetchUserData(user_id)
    .then((userData) => {
      if (!userData) {
        return res.status(404).send({ msg: "User not found" });
      }
      delete userData.password;
      return res.status(200).send(userData);
    })
    .catch(next);
};
