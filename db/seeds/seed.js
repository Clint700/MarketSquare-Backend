const format = require("pg-format");
const db = require("../connection");
const bcrypt = require("bcrypt");

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return reject(err);
      resolve(hash);
    });
  });
};

const seed = ({ userData, itemsData, cartData, ordersData }) => {
  return db
    .query(`DROP TABLE IF EXISTS carts, orders, items, users;`)
    .then(() => {
      return db.query(`
        CREATE TABLE users (
          user_id SERIAL PRIMARY KEY,
          username VARCHAR(20) NOT NULL,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(20) NOT NULL,
          last_name VARCHAR(20) NOT NULL,
          email VARCHAR(100) NOT NULL,
          number VARCHAR(20) NOT NULL,
          role VARCHAR(10) NOT NULL
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE items (
          item_id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(user_id),
          img_url VARCHAR NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          price VARCHAR NOT NULL,
          category VARCHAR NOT NULL,
          item_name VARCHAR NOT NULL,
          item_description VARCHAR NOT NULL
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE carts (
          cart_id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(user_id),
          product_id INT REFERENCES items(item_id),
          quantity INT NOT NULL
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE orders (
          order_id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(user_id),
          total_amount VARCHAR NOT NULL,
          status VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
    })
    .then(() => {
      return Promise.all(
        userData.map((user) =>
          hashPassword(user.password).then((hashedPassword) => ({
            ...user,
            password: hashedPassword,
          }))
        )
      );
    })
    .then((hashedUserData) => {
      const insertUsersQueryStr = format(
        "INSERT INTO users (username, password, first_name, last_name, email, number, role) VALUES %L;",
        hashedUserData.map(
          ({ username, password, first_name, last_name, email, number, role }) => [
            username,
            password,
            first_name,
            last_name,
            email,
            number,
            role,
          ]
        )
      );
      return db.query(insertUsersQueryStr);
    })
    .then(() => {
      const insertItemsQueryStr = format(
        "INSERT INTO items (user_id, img_url, created_at, price, category, item_name, item_description) VALUES %L;",
        itemsData.map(
          ({ user_id, img_url, created_at, price, category, item_name, item_description }) => [
            user_id,
            img_url,
            created_at,
            price,
            category,
            item_name,
            item_description,
          ]
        )
      );
      return db.query(insertItemsQueryStr);
    })
    .then(() => {
      const insertCartsQueryStr = format(
        "INSERT INTO carts (user_id, product_id, quantity) VALUES %L;",
        cartData.map(({ user_id, product_id, quantity }) => [
          user_id,
          product_id,
          quantity,
        ])
      );
      return db.query(insertCartsQueryStr);
    })
    .then(() => {
      const insertOrdersQueryStr = format(
        "INSERT INTO orders (user_id, total_amount, status, created_at) VALUES %L;",
        ordersData.map(({ user_id, total_amount, status, created_at }) => [
          user_id,
          total_amount,
          status,
          created_at,
        ])
      );
      return db.query(insertOrdersQueryStr);
    })
    .catch((err) => {
      console.error("Error during seeding:", err);
    });
};

module.exports = seed;