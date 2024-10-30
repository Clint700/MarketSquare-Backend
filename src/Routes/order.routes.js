const express = require("express");
const { postOrder, getOrder, getAllOrders } = require("../controllers/order.controller");

const router = express.Router();

router.post("/", postOrder);
router.get("/:order_id", getOrder);
router.get("/", getAllOrders);

module.exports = router;