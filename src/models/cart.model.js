const db = require("../../db/connection");

exports.addItemToCart = (user_id, item_id, quantity) => {
  if (!quantity || quantity <= 0 || typeof quantity !== "number") {
    return Promise.reject({
      status: 400,
      msg: "Bad Request!",
    });
  }

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
      return db.query("SELECT * FROM items WHERE item_id = $1", [item_id]);
    })
    .then(({ rows }) => {
      if (rows.length === 0 || rows[0].stock < quantity) {
        return Promise.reject({
          status: 400,
          msg: "Out of stock",
        });
      }
      return rows[0];
    })
    .then((item) => {
      return db
        .query("SELECT * FROM carts WHERE user_id = $1", [user_id])
        .then(({ rows }) => {
          const cartData = rows[0];
          if (cartData && cartData.items.some((i) => i.item_id === item_id)) {
            const cartItem = cartData.items.find((i) => i.item_id === item_id);
            cartItem.quantity += quantity;
            cartItem.total_price = cartItem.quantity * item.price;

            return db.query(
              `
              UPDATE carts 
              SET items = $1, updated_at = $2 
              WHERE user_id = $3 RETURNING *;`,
              [JSON.stringify(cartData.items), new Date(), user_id]
            );
          } else {
            const newItem = {
              item_id,
              item_name: item.item_name,
              price: item.price,
              product_image: item.img_url,
              quantity,
              total_price: quantity * item.price,
            };

            if (cartData) {
              cartData.items.push(newItem);
              return db.query(
                `
                UPDATE carts 
                SET items = $1, updated_at = $2 
                WHERE user_id = $3 RETURNING *;`,
                [JSON.stringify(cartData.items), new Date(), user_id]
              );
            } else {
              return db.query(
                `
                INSERT INTO carts (user_id, items, created_at, updated_at) 
                VALUES ($1, $2, $3, $4) RETURNING *;`,
                [user_id, JSON.stringify([newItem]), new Date(), new Date()]
              );
            }
          }
        });
    })
    .then(({ rows }) => rows[0]);
};

exports.fetchItemInCart = (user_id) => {
  return db
    .query(
      `
      SELECT * FROM carts WHERE user_id = $1
      `,
      [user_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Cart not found" });
      }
      return { items: rows };
    });
};

exports.updateItemInCart = (user_id, product_id, items, updated_at) => {
  const quantity = items[0]?.quantity;
  if (!quantity || quantity <= 0 || typeof quantity !== "number") {
    return Promise.reject({
      status: 400,
      msg: "Bad Request!",
    });
  }

  return db
    .query(
      `
      SELECT * FROM carts 
      WHERE carts.user_id = $1 AND cart_id = $2
      `,
      [user_id, product_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({
          status: 404,
          msg: "Product not in stock",
        });
      }

      const cartRow = rows[0];
      const itemInCart = cartRow.items[0];

      return db
        .query("SELECT * FROM items WHERE item_id = $1", [product_id])
        .then(({ rows: itemsRows }) => {
          if (!itemsRows.length) {
            return Promise.reject({
              status: 404,
              msg: "Product not found in inventory",
            });
          }

          const product = itemsRows[0];
          if (quantity > product.stock) {
            return Promise.reject({
              status: 400,
              msg: "Quantity exceeds stock",
            });
          }

          const updatedItem = {
            ...itemInCart,
            quantity,
            total_price: quantity * product.price,
          };

          const updatedItems = [updatedItem];

          return db.query(
            `
            UPDATE carts 
            SET items = $1, updated_at = $2 
            WHERE user_id = $3 RETURNING *;`,
            [JSON.stringify(updatedItems), updated_at || new Date(), user_id]
          );
        });
    })
    .then(({ rows }) => rows[0]);
};

exports.removeItemInCart = (user_id, cart_id) => {
  return db
    .query("SELECT * FROM carts WHERE user_id = $1 AND cart_id = $2", [
      user_id,
      cart_id,
    ])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({
          status: 404,
          msg: "Cart doesn't exist!",
        });
      }

      return db
        .query(
          "DELETE FROM carts WHERE user_id = $1 AND cart_id = $2 RETURNING *",
          [user_id, cart_id]
        )
        .then(() => "Item Successfully deleted");
    });
};
