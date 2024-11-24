const db = require("../../db/connection");

exports.AddItem = (
  user_id,
  img_url,
  created_at,
  price,
  stock,
  category,
  item_name,
  item_description,
  dimensions,
  rating
) => {
  return db
    .query("SELECT * FROM users WHERE user_id = $1", [user_id])
    .then(({ rows }) => {
      if (rows[0].role !== "admin") {
        return Promise.reject({
          status: 400,
          msg: "Admin only!",
        });
      }
      return rows[0];
    })
    .then(() => {
      return db
        .query(
          "INSERT INTO items (user_id, img_url, created_at, price, stock, category, item_name, item_description, dimensions, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
          [
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
        .then(({ rows }) => {
          return rows[0];
        });
    });
};

exports.UpdateItem = (
  user_id,
  item_id,
  img_url,
  created_at,
  price,
  stock,
  category,
  item_name,
  item_description,
  dimensions,
  rating
) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (user_id) {
    fields.push(`user_id = $${index++}`);
    values.push(user_id);
  }
  if (img_url) {
    fields.push(`img_url = $${index++}`);
    values.push(img_url);
  }
  if (created_at) {
    fields.push(`created_at = $${index++}`);
    values.push(created_at);
  }
  if (price) {
    fields.push(`price = $${index++}`);
    values.push(price);
  }
  if (stock) {
    fields.push(`stock = $${index++}`);
    values.push(stock);
  }
  if (category) {
    fields.push(`category = $${index++}`);
    values.push(category);
  }
  if (item_name) {
    fields.push(`item_name = $${index++}`);
    values.push(item_name);
  }
  if (item_description) {
    fields.push(`item_description = $${index++}`);
    values.push(item_description);
  }
  if (dimensions) {
    fields.push(`dimensions = $${index++}`);
    values.push(dimensions);
  }
  if (rating) {
    fields.push(`rating = $${index++}`);
    values.push(rating);
  }

  if (!fields.length) {
    return Promise.reject({ status: 400, msg: "No fields to update" });
  }

  const queryStr = `UPDATE items SET ${fields.join(
    ", "
  )} WHERE item_id = $${index} RETURNING *`;
  values.push(item_id);

  return db
    .query("SELECT * FROM users WHERE user_id = $1", [user_id])
    .then(({ rows }) => {
      if (rows[0].role !== "admin") {
        return Promise.reject({
          status: 400,
          msg: "Admin only!",
        });
      }
      return rows[0];
    })
    .then(() => {
      return db.query(queryStr, values).then(({ rows }) => {
        if (!rows.length) {
          return Promise.reject({ status: 404, msg: "Product doesn't exist" });
        }
        return rows[0];
      });
    });
};

exports.removeItem = (user_id, item_id) => {
  return db
    .query("SELECT * FROM users WHERE user_id = $1", [user_id])
    .then(({ rows }) => {
      if (rows[0].role !== "admin") {
        return Promise.reject({
          status: 400,
          msg: "Admin only!",
        });
      }
      return rows[0];
    })
    .then(() => {
      return db
        .query("DELETE FROM items WHERE item_id = $1 RETURNING *", [item_id])
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

exports.fetchItems = (
  limit = 10,
  page = 1,
  category,
  price_min,
  price_max,
  item_name
) => {
  const validLimit = isNaN(limit) ? 10 : Number(limit);
  const validPage = isNaN(page) ? 1 : Number(page);
  const offset = (validPage - 1) * validLimit;

  let queryStr = "SELECT * FROM items";
  const queryValues = [];
  const conditions = [];

  if (category) {
    queryValues.push(category);
    conditions.push(`category = $${queryValues.length}`);
  }

  if (price_min) {
    queryValues.push(price_min);
    conditions.push(`price >= $${queryValues.length}`);
  }

  if (price_max) {
    queryValues.push(price_max);
    conditions.push(`price <= $${queryValues.length}`);
  }

  if (item_name) {
    queryValues.push(`%${item_name}%`);
    conditions.push(`item_name ILIKE $${queryValues.length}`);
  }

  if (conditions.length > 0) {
    queryStr += ` WHERE ${conditions.join(" AND ")}`;
  }

  queryStr += ` LIMIT $${queryValues.length + 1} OFFSET $${
    queryValues.length + 2
  }`;
  queryValues.push(validLimit, offset);

  return db.query(queryStr, queryValues).then(({ rows }) => rows);
};

exports.fetchItem = (item_id) => {
  return db
    .query("SELECT * FROM items WHERE item_id = $1", [item_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Product doesn't exist!",
        });
      }
      return rows[0];
    });
};
