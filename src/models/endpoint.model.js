const fs = require("fs/promises");
const path = require("path");

exports.fetchApiEndpoints = () => {
  const filePath = path.join(__dirname, "../../Endpoints/endpoint.json");
  return fs.readFile(filePath, "utf-8")
    .then((data) => {
      return JSON.parse(data);
    });
};