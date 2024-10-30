const db = require("../../db/connection");

exports.addItemToCart = (user_id, item_id, quantity) => {
  return db
    .query("SELECT * FROM users WHERE user_id = $1", [user_id])
    .then(({ rows }) => {
      if (rows[0].role === "admin") {
        return Promise.reject({
          status: 400,
          msg: "Customer only!",
        });
      }
      return rows[0];
    })
    .then(() => {
      return db
        .query("SELECT * FROM items WHERE item_id = $1", [item_id])
        .then(({ rows }) => {
          if (rows.length === 0) {
            return Promise.reject({
              status: 400,
              msg: "Out of stock",
            });
          }
          return rows[0];
        });
    })
    .then(() => {
      return db
        .query(
          "INSERT INTO carts (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
          [user_id, item_id, quantity]
        )
        .then(({ rows }) => {
          return rows[0];
        });
    });
};

exports.fetchItemInCart = (user_id) => {
  return db
    .query(
      `
      SELECT carts.user_id, carts.product_id, carts.quantity, items.price
      FROM carts
      JOIN items ON carts.product_id = items.item_id
      WHERE carts.user_id = $1
      `,
      [user_id]
    )
    .then(({ rows }) => {
      const totalCost = rows
        .reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)
        .toFixed(2);

      return { items: rows, totalCost: parseFloat(totalCost) };
    });
};

exports.updateItemInCart = (user_id, product_id, quantity) => {
  return db
    .query("SELECT * FROM carts WHERE user_id = $1 AND product_id = $2", [
      user_id,
      product_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Product not in stock",
        });
      }
      if (rows[0].quantity < quantity) {
        return Promise.reject({
          status: 400,
          msg: "Quantity exceeds stock",
        });
      }
      return rows;
    })
    .then(() => {
      return db
        .query(
          "UPDATE carts SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *",
          [quantity, user_id, product_id]
        )
        .then(({ rows }) => {
          return rows[0];
        });
    });
};

exports.removeItemInCart = (user_id, product_id) => {
    return db
      .query("SELECT * FROM carts WHERE user_id = $1 AND product_id = $2", [user_id, product_id])
      .then(() => {
        return db
          .query("DELETE FROM carts WHERE user_id = $1 AND product_id = $2 RETURNING *", [user_id, product_id])
          .then(({ rows }) => {
            if (rows.length === 0) {
              return Promise.reject({
                status: 404,
                msg: "Product doesn't exist!",
              });
            }
            return "Item Successfully deleted";
          });
      });
  };