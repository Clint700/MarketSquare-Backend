const bcrypt = require("bcrypt");
const db = require("../../db/connection");

exports.findUserByUsername = (username) => {
  return db
    .query("SELECT * FROM users WHERE username = $1", [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 401,
          msg: "Invalid username or password",
        });
      }
      return rows[0];
    });
};

exports.verifyPassword = (plainTextPassword, hashedPassword) => {
  return bcrypt.compare(plainTextPassword, hashedPassword).then((isMatch) => {
    if (!isMatch) {
      return Promise.reject({
        status: 400,
        msg: "Invalid username or password",
      });
    }
    return true;
  });
};

exports.postRegisteredUser = (
  username,
  password,
  first_name,
  last_name,
  email,
  number,
  role
) => {
  return db
    .query("SELECT * FROM users WHERE username = $1 OR email = $2", [
      username,
      email,
    ])
    .then(({ rows }) => {
      if (rows.length > 0) {
        return Promise.reject({
          status: 409,
          msg: "Username or email already exists! Please log in.",
        });
      }
      return bcrypt.hash(password, 10);
    })
    .then((hashedPassword) => {
      return db.query(
        "INSERT INTO users (username, password, first_name, last_name, email, number, role) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [username, hashedPassword, first_name, last_name, email, number, role]
      );
    })
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.fetchUserData = (userId) => {
  return db
    .query("SELECT * FROM users WHERE user_id = $1", [userId])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User not found" });
      }
      return rows[0];
    });
};