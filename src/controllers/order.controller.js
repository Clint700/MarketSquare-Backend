const {
  placeOrder,
  getOrderById,
  getOrders,
} = require("../models/order.model");

exports.postOrder = (req, res, next) => {
  const { user_id } = req.body;
  placeOrder(user_id)
    .then((order) => {
      res.status(201).send(order);
    })
    .catch(next);
};

exports.getOrder = (req, res, next) => {
  const { order_id } = req.params;
  const { user_id } = req.body;

  getOrderById(order_id, user_id)
    .then((order) => {
      res.status(200).send(order);
    })
    .catch((err) => {
      if (err.status === 404) res.status(404).send({ msg: "Order not found" });
      else if (err.status === 403)
        res.status(403).send({ msg: "Unauthorized access to this order" });
      else next(err);
    });
};

exports.getAllOrders = (req, res, next) => {
  const { user_id } = req.body;
  const { status } = req.query;

  getOrders(user_id, status)
    .then((orders) => {
      res.status(200).send(orders);
    })
    .catch(next);
};
