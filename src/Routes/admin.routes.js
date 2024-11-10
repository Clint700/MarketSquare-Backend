const express = require("express");
const {
  getAllOrders,
  updateOrder,
  getAllProducts,
  getAllCustomers,
  getSpecificOrder,
} = require("../controllers/admin.controller");
const { verifyAdmin } = require("../middleware/admin.middleware");

const router = express.Router();

router.get("/orders", verifyAdmin, getAllOrders);
router.get("/orders/:order_id", verifyAdmin, getSpecificOrder);
router.patch("/orders/:order_id", verifyAdmin, updateOrder);
router.get("/products", verifyAdmin, getAllProducts);
router.get("/users", verifyAdmin, getAllCustomers);

module.exports = router;