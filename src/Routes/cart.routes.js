const express = require("express");
const {
  postItemToCart,
  getItemToCart,
  patchItemToCart,
  deleteItemToCart
} = require("../controllers/cart.controller");

const router = express.Router();

router.post("/:user_id/:item_id", postItemToCart);
router.patch("/:user_id/:product_id", patchItemToCart);
router.get("/:user_id", getItemToCart);
router.delete("/:user_id/:cart_id", deleteItemToCart);

module.exports = router;
