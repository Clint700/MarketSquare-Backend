const db = require("../../db/connection");

exports.placeOrder = (user_id) => {
  return db
    .query(
      `SELECT carts.product_id, carts.quantity, items.price::numeric 
       FROM carts 
       JOIN items ON carts.product_id = items.item_id 
       WHERE carts.user_id = $1`,
      [user_id]
    )
    .then(({ rows: cartItems }) => {
      if (cartItems.length === 0) {
        return Promise.reject({ status: 400, msg: "Cart is empty!" });
      }

      const totalCost = cartItems
        .reduce((sum, item) => sum + item.quantity * item.price, 0)
        .toFixed(2);

      return db
        .query(
          `INSERT INTO orders (user_id, total_amount, status) 
           VALUES ($1, $2, 'pending') RETURNING *`,
          [user_id, totalCost]
        )
        .then(({ rows }) => {
          const newOrder = rows[0];
          newOrder.items = cartItems.map(({ product_id, quantity }) => ({
            product_id,
            quantity,
          }));

          return db
            .query(`DELETE FROM carts WHERE user_id = $1`, [user_id])
            .then(() => newOrder);
        });
    });
};

exports.getOrderById = (order_id, user_id) => {
  return db
    .query(`SELECT * FROM orders WHERE order_id = $1 AND user_id = $2`, [
      order_id,
      user_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Order not found" });
      }
      return rows[0];
    });
};

exports.getOrders = (user_id, status) => {
  const queryStr = status
    ? `SELECT * FROM orders WHERE user_id = $1 AND status = $2`
    : `SELECT * FROM orders WHERE user_id = $1`;

  const queryParams = status ? [user_id, status] : [user_id];

  return db.query(queryStr, queryParams).then(({ rows }) => {
    return rows;
  });
};
