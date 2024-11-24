const db = require("../../db/connection");

exports.placeOrder = (user_id) => {
  return db
    .query(
      `SELECT *
      FROM carts 
      JOIN users ON carts.user_id = users.user_id 
      WHERE carts.user_id = $1`,
      [user_id]
    )
    .then(({ rows: cartItems }) => {
      if (cartItems.length === 0) {
        return Promise.reject({ status: 400, msg: "Cart is empty!" });
      }

      const total_price = cartItems.reduce((cartSum, cart) => {
        const cartTotal = cart.items.reduce(
          (itemSum, item) => itemSum + item.total_price,
          0
        );
        return cartSum + cartTotal;
      }, 0);

      const shipping_cost = 15;
      const status = "shipped";
      const payment_status = "paid";

      const shipping_address = JSON.stringify({
        street: "2 Customer Street",
        city: "Manchester",
        county: "Greater Manchester",
        postcode: "M1 1AE",
        country: "UK",
      });

      const billing_address = JSON.stringify({
        street: "2 Customer Street",
        city: "Manchester",
        county: "Greater Manchester",
        postcode: "M1 1AE",
        country: "UK",
      });

      const full_name = cartItems[0].full_name;

      const items = cartItems.flatMap((cart) => cart.items);

      return db
        .query(
          `INSERT INTO orders (user_id, full_name, items, total_amount, shipping_cost, status, payment_status, shipping_address, billing_address, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
          [
            user_id,
            full_name,
            JSON.stringify(items),
            total_price.toFixed(2),
            shipping_cost,
            status,
            payment_status,
            shipping_address,
            billing_address,
            new Date(),
            new Date(),
          ]
        )
        .then(({ rows }) => {
          rows[0].total_amount = Number(rows[0].total_amount);
          const newOrder = rows[0];
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
      rows[0].total_amount = Number(rows[0].total_amount);
      return rows[0];
    });
};

exports.getOrders = (user_id, status) => {
  const queryStr = status
    ? `SELECT * FROM orders WHERE user_id = $1 AND status = $2`
    : `SELECT * FROM orders WHERE user_id = $1`;

  const queryParams = status ? [user_id, status] : [user_id];

  return db.query(queryStr, queryParams).then(({ rows }) => {
    rows.map((row) => {
      row.total_amount = Number(row.total_amount);
    });
    return rows;
  });
};
