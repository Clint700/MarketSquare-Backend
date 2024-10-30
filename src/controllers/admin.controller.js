const {
  fetchAllOrders,
  updateOrderStatus,
  fetchAllProducts,
  fetchAllCustomers,
} = require("../models/admin.model");

exports.getAllOrders = (req, res, next) => {
  const { status } = req.query;
  fetchAllOrders(status)
    .then((orders) => res.status(200).send(orders))
    .catch((err) => {
      console.error("Error in getAllOrders controller:", err);
      next(err);
    });
};

exports.updateOrder = (req, res, next) => {
  const { order_id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).send({ msg: "Status is required" });
  }

  updateOrderStatus(order_id, status)
    .then((order) => res.status(200).send(order))
    .catch(next);
};

exports.getAllProducts = (req, res, next) => {
  fetchAllProducts()
    .then((products) => res.status(200).send(products))
    .catch(next);
};

exports.getAllCustomers = (req, res, next) => {
  fetchAllCustomers()
    .then((customers) => res.status(200).send(customers))
    .catch(next);
};
