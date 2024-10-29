const express = require("express");
const { postItem, patchItem, deleteItem, getItems, getItem } = require("../controllers/product.controller");

const router = express.Router();

router.post("/", postItem);
router.patch("/:item_id", patchItem);
router.delete("/:user_id/:item_id", deleteItem);
router.get("/", getItems);
router.get("/:item_id", getItem);

module.exports = router;
