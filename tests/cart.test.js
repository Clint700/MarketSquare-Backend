const request = require("supertest");
const app = require("../apps/app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const {
  userData,
  itemsData,
  cartData,
  ordersData,
} = require("../db/data/index.js");

beforeAll(() => {
  return seed({ userData, itemsData, cartData, ordersData });
});

afterAll(() => {
  return db.end();
});

describe("/api/cart", () => {
  test("POST /api/cart/user_id/product_id => Should add a product to the cart", () => {
    const cartItem = {
      quantity: 1,
    };
    return request(app)
      .post("/api/cart/3/2")
      .send(cartItem)
      .expect(201)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            cart_id: expect.any(Number),
            user_id: 3,
            product_id: 2,
            quantity: 1,
          })
        );
      });
  });

  test("POST /api/cart/user_id/product_id => Should fail if required fields are missing", () => {
    const cartItem = {};
    return request(app)
      .post("/api/cart/3/2")
      .send(cartItem)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request!");
      });
  });

  test("POST /api/cart/user_id/product_id => Should fail if quantity is not a positive number", () => {
    const cartItem = {
      quantity: "A",
    };
    return request(app)
      .post("/api/cart/3/2")
      .send(cartItem)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request!");
      });
  });

  test("POST /api/cart/user_id/product_id => Should fail if product is out of stock", () => {
    const cartItem = {
      quantity: 1,
    };
    return request(app)
      .post("/api/cart/3/20")
      .send(cartItem)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Out of stock");
      });
  });

  test("POST /api/cart/user_id/product_id => Should deny unauthenticated users", () => {
    const cartItem = {
      quantity: 1,
    };
    return request(app)
      .post("/api/cart/1/2")
      .send(cartItem)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Customer only!");
      });
  });

  test("GET /api/cart/user_id Customer - Should return customers cart with products", () => {
    return request(app)
      .get("/api/cart/3")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.items)).toBe(true);
        body.items.forEach((item) => {
          expect(item).toEqual(
            expect.objectContaining({
              user_id: expect.any(Number),
              product_id: expect.any(Number),
              quantity: expect.any(Number),
            })
          );
        });
      });
  });

  test("GET /api/cart/:user_id => Should calculate total cost", () => {
    return request(app)
      .get("/api/cart/3")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            items: expect.any(Array),
            totalCost: 119.96,
          })
        );
        body.items.forEach((item) => {
          expect(item).toEqual(
            expect.objectContaining({
              user_id: 3,
              product_id: expect.any(Number),
              quantity: expect.any(Number),
              price: expect.any(String),
            })
          );
        });
      });
  });

  test("PATCH /api/cart/product_id => Should allow customer to update product quantity", () => {
    const cartItem = {
      quantity: 2,
    };
    return request(app)
      .patch("/api/cart/3/3")
      .send(cartItem)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            cart_id: expect.any(Number),
            user_id: 3,
            product_id: 3,
            quantity: 2,
          })
        );
      });
  });

  test("PATCH /api/cart/product_id => Should fail if quantity exceeds stock", () => {
    const cartItem = {
      quantity: 3,
    };
    return request(app)
      .patch("/api/cart/3/3")
      .send(cartItem)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Quantity exceeds stock");
      });
  });

  test("PATCH /api/cart/product_id => Should return 404 if product is not in cart", () => {
    const cartItem = {
      quantity: 3,
    };
    return request(app)
      .patch("/api/cart/3/30")
      .send(cartItem)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Product not in stock");
      });
  });

  test("DELETE /api/product/:user_id/:item_id Admin - Should allow admin to delete product", () => {
    return request(app)
      .delete("/api/cart/3/3")
      .expect(200)
      .then((response) => {
        expect(response.text).toBe("Item Successfully deleted");
      });
  });

  test("DELETE /api/product/:user_id/:item_id Admin - Should return 404 if product doesn’t exist", () => {
    return request(app)
      .delete("/api/cart/1/1999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Product doesn't exist!");
      });
  });
});
