const db = require("../../db/connection");

exports.fetchAllOrders = (status) => {
  let queryStr = "SELECT * FROM orders";
  const queryParams = [];

  if (status) {
    queryStr += " WHERE status = $1";
    queryParams.push(status);
  }

  return db.query(queryStr, queryParams).then(({ rows }) => {
    return rows;
  });
};

exports.fetchOrder = (order_id) => {
  return db
    .query("SELECT * FROM orders WHERE order_id = $1", [order_id])
    .then(({ rows }) => {
      if (!rows[0]) {
        return Promise.reject({ status: 404, msg: "Order not found" });
      }
      return rows[0];
    });
};

exports.updateOrderStatus = (
  order_id,
  status,
  payment_status,
  shipping_cost,
  updated_at = new Date()
) => {
  return db
    .query(
      "UPDATE orders SET status = $1, payment_status = $2, shipping_cost = $3, updated_at = $4 WHERE order_id = $5 RETURNING *",
      [status, payment_status, shipping_cost, updated_at, order_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Order not found" });
      }
      return rows[0];
    });
};

exports.fetchAllProducts = () => {
  return db.query("SELECT * FROM items").then(({ rows }) => {
    return rows;
  });
};

exports.fetchAllCustomers = () => {
  return db
    .query("SELECT * FROM users WHERE role = 'customer'")
    .then(({ rows }) => {
      return rows;
    });
};
