const {
  addItemToCart,
  fetchItemInCart,
  updateItemInCart,
  removeItemInCart,
} = require("../models/cart.model");

exports.postItemToCart = (req, res, next) => {
  const { user_id, item_id } = req.params;
  const { quantity } = req.body;

  if (!user_id || !item_id || !quantity || quantity === 0 || isNaN(quantity)) {
    return res.status(400).send({ msg: "Bad Request!" });
  }

  addItemToCart(user_id, item_id, quantity)
    .then((cart) => {
      res.status(201).send(cart);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getItemToCart = (req, res, next) => {
  const { user_id } = req.params;

  fetchItemInCart(user_id)
    .then((cart) => {
      res.status(200).send(cart);
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchItemToCart = (req, res, next) => {
  const { user_id, product_id } = req.params;
  const { items, updated_at } = req.body;

  updateItemInCart(user_id, product_id, items, updated_at)
    .then((cart) => {
      res.status(200).send({ ...cart, items: JSON.stringify(cart.items) });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteItemToCart = (req, res, next) => {
  const { user_id, cart_id } = req.params;

  removeItemInCart(user_id, cart_id)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((err) => {
      next(err);
    });
};
