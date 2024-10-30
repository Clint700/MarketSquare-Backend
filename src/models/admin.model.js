const db = require("../../db/connection");

exports.fetchAllOrders = (status) => {
  let queryStr = "SELECT * FROM orders";
  const queryParams = [];

  if (status) {
    queryStr += " WHERE status = $1";
    queryParams.push(status);
  }

  return db
    .query(queryStr, queryParams)
    .then(({ rows }) => rows)
    .catch((err) => {
      console.error("Error fetching orders:", err);
      throw err;
    });
};

exports.updateOrderStatus = (order_id, newStatus) => {
  return db
    .query("UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *", [
      newStatus,
      order_id,
    ])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Order not found" });
      }
      return rows[0];
    });
};

exports.fetchAllProducts = () => {
  return db.query("SELECT * FROM items").then(({ rows }) => rows);
};


exports.fetchAllCustomers = () => {
  return db
    .query("SELECT * FROM users WHERE role = 'customer'")
    .then(({ rows }) => rows);
};
