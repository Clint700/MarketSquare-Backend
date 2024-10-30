const { fetchApiEndpoints } = require("../models/endpoint.model");

exports.getApiEndpoints = (req, res, next) => {
  fetchApiEndpoints()
    .then((endpoints) => {
      res.status(200).send({ api: endpoints });
    })
    .catch((err) => {
      next(err); 
    });
};