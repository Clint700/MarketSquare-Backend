const {
  AddItem,
  UpdateItem,
  removeItem,
  fetchItems,
  fetchItem,
} = require("../models/product.model");

exports.postItem = (req, res, next) => {
  const {
    user_id,
    img_url,
    created_at,
    price,
    category,
    item_name,
    item_description,
  } = req.body;

  if (
    !user_id ||
    !img_url ||
    !created_at ||
    !price ||
    !category ||
    !item_name ||
    !item_description
  ) {
    return res.status(400).send({ msg: "Please fill up empty fields" });
  }
  AddItem(
    user_id,
    img_url,
    created_at,
    price,
    category,
    item_name,
    item_description
  )
    .then((item) => {
      return res.status(200).send(item);
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchItem = (req, res, next) => {
  const { item_id } = req.params;
  const {
    user_id,
    img_url,
    created_at,
    price,
    category,
    item_name,
    item_description,
  } = req.body;
  UpdateItem(
    item_id,
    user_id,
    img_url,
    created_at,
    price,
    category,
    item_name,
    item_description
  )
    .then((item) => {
      res.status(200).send(item);
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteItem = (req, res, next) => {
  const { user_id, item_id } = req.params;
  removeItem(user_id, item_id)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getItems = (req, res, next) => {
  const { limit, page, category, price_min, price_max, item_name } = req.query;

  fetchItems(
    Number(limit),
    Number(page),
    category,
    price_min,
    price_max,
    item_name
  )
    .then((items) => {
      res.status(200).send(items);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getItem = (req, res, next) => {
  const { item_id } = req.params;
  fetchItem(item_id)
    .then((item) => {
      res.status(200).send(item);
    })
    .catch((err) => {
      if (err.status) {
        res.status(err.status).send({ msg: err.msg });
      } else {
        next(err);
      }
    });
};
