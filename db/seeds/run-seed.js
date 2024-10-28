const seed = require('./seed');
const db = require('../connection');
const userData = require('../data/users');
const itemsData = require('../data/items');
const cartData = require('../data/cartData');
const ordersData = require('../data/ordersData');

const runSeed = () => {
  console.log('Running seed...');
  
  return seed({ userData, itemsData, cartData, ordersData })
    .then(() => {
      console.log('Seeding completed successfully.');
      return db.end();
    })
    .catch((err) => {
      console.error('Error during seeding:', err.message || err);
      db.end();
    });
};

runSeed();