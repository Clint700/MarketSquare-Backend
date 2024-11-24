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
    .query(`DROP TABLE IF EXISTS orders, carts, items, users;`)
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
          role VARCHAR(10) NOT NULL,
          address JSON NOT NULL,
          preferences JSON NOT NULL
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
          stock INT NOT NULL,
          category VARCHAR NOT NULL,
          item_name VARCHAR NOT NULL,
          item_description VARCHAR NOT NULL,
          dimensions JSON,
          rating FLOAT
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE carts (
          cart_id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(user_id),
          full_name VARCHAR(100) NOT NULL,
          items JSON NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE orders (
          order_id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(user_id),
          full_name VARCHAR(100) NOT NULL,
          items JSON NOT NULL,
          total_amount VARCHAR NOT NULL,
          shipping_cost FLOAT NOT NULL,
          status VARCHAR(20) NOT NULL,
          payment_status VARCHAR(20) NOT NULL,
          shipping_address JSON NOT NULL,
          billing_address JSON NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
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
        `INSERT INTO users (username, password, first_name, last_name, email, number, role, address, preferences) VALUES %L;`,
        hashedUserData.map(
          ({
            username,
            password,
            first_name,
            last_name,
            email,
            number,
            role,
            address,
            preferences,
          }) => [
            username,
            password,
            first_name,
            last_name,
            email,
            number,
            role,
            address,
            preferences,
          ]
        )
      );
      return db.query(insertUsersQueryStr);
    })
    .then(() => {
      const insertItemsQueryStr = format(
        `INSERT INTO items (user_id, img_url, created_at, price, stock, category, item_name, item_description, dimensions, rating) VALUES %L;`,
        itemsData.map(
          ({
            user_id,
            img_url,
            created_at,
            price,
            stock,
            category,
            item_name,
            item_description,
            dimensions,
            rating,
          }) => [
            user_id,
            img_url,
            created_at,
            price,
            stock,
            category,
            item_name,
            item_description,
            dimensions,
            rating,
          ]
        )
      );
      return db.query(insertItemsQueryStr);
    })
    .then(() => {
      const insertCartsQueryStr = format(
        `INSERT INTO carts (user_id, full_name, items, created_at, updated_at) VALUES %L;`,
        cartData.map(
          ({
            user_id,
            product_id,
            full_name,
            items,
            created_at,
            updated_at,
          }) => [user_id, full_name, items, created_at, updated_at]
        )
      );
      return db.query(insertCartsQueryStr);
    })
    .then(() => {
      const insertOrdersQueryStr = format(
        `INSERT INTO orders (user_id, full_name, items, total_amount, shipping_cost, status, payment_status, shipping_address, billing_address, created_at, updated_at) VALUES %L;`,
        ordersData.map(
          ({
            user_id,
            full_name,
            items,
            total_amount,
            shipping_cost,
            status,
            payment_status,
            shipping_address,
            billing_address,
            created_at,
            updated_at,
          }) => [
            user_id,
            full_name,
            items,
            total_amount,
            shipping_cost,
            status,
            payment_status,
            shipping_address,
            billing_address,
            created_at,
            updated_at,
          ]
        )
      );
      return db.query(insertOrdersQueryStr);
    })
    .catch((err) => {
      console.error("Error during seeding:", err);
    });
};

module.exports = seed;
