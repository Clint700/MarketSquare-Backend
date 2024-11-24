const {
  fetchAllOrders,
  updateOrderStatus,
  fetchAllProducts,
  fetchAllCustomers,
  fetchOrder,
} = require("../models/admin.model");

exports.getAllOrders = (req, res, next) => {
  const { status } = req.query;
  fetchAllOrders(status)
    .then((orders) => res.status(200).send(orders))
    .catch((err) => {
      next(err);
    });
};

exports.getSpecificOrder = (req, res, next) => {
  const { order_id } = req.params;
  fetchOrder(order_id)
    .then((order) => {
      res.status(200).send({
        ...order,
        shipping_address: JSON.stringify(order.billing_address),
        billing_address: JSON.stringify(order.shipping_address),
        items: JSON.stringify(order.items),
        total_amount: Number(order.total_amount),
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.updateOrder = (req, res, next) => {
  const { order_id } = req.params;
  const { status, payment_status, shipping_cost, updated_at } = req.body;

  if (!status || !payment_status || !shipping_cost || !updated_at) {
    return res.status(400).send({ msg: "Status is required" });
  }

  updateOrderStatus(order_id, status, payment_status, shipping_cost, updated_at)
    .then((order) => res.status(200).send(order))
    .catch(next);
};

exports.getAllProducts = (req, res, next) => {
  fetchAllProducts()
    .then((products) => {
      res
        .status(200)
        .send(products);
    })
    .catch(next);
};

exports.getAllCustomers = (req, res, next) => {
  fetchAllCustomers()
    .then((customers) => res.status(200).send(customers))
    .catch(next);
};
