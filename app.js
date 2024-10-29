require("dotenv").config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/Routes/auth.routes');
const productRoutes = require('./src/Routes/product.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: 'Internal Server Error' });
  }
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid Id" });
  } else if (err.msg === "Page Not Found")
    res.status(404).send({ msg: "Page not found" });
  next(err);
});

app.all("/*", (req, res) => {
  res.status(404).send({ msg: 'Page not found' });
});

module.exports = app;