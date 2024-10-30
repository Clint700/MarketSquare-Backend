const express = require("express");
const { getApiEndpoints } = require("../controllers/endpoint.controller");

const router = express.Router();

router.get("/", getApiEndpoints);

module.exports = router;