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
    const cartItem = { quantity: 100 };
    return request(app)
      .post("/api/cart/5/3")
      .send(cartItem)
      .expect(201)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            user_id: 5,
            full_name: "Eve Taylor",
            items: expect.any(Object),
            created_at: expect.any(String),
            updated_at: expect.any(String),
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
      quantity: 10000,
    };
    return request(app)
      .post("/api/cart/5/3")
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
      .get("/api/cart/6")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.items)).toBe(true);
        body.items.forEach((item) => {
          expect(item).toEqual(
            expect.objectContaining({
              user_id: 6,
              full_name: "Mike Brown",
              items: expect.any(Object),
              created_at: expect.any(String),
              updated_at: expect.any(String),
            })
          );
        });
      });
  });

  test("PATCH /api/cart/user_id/product_id => Should allow customer to update product quantity", () => {
    const cartItem = {
      items: ([
        {
          quantity: 4,
        },
      ]),
      updated_at: new Date(),
    };
    return request(app)
      .patch("/api/cart/2/1")
      .send(cartItem)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            user_id: 2,
            full_name: 'Jane Doe',
            items: JSON.stringify([
              {
                item_id: 1,
                item_name: 'Bluetooth Speaker',
                price: 29.99,
                quantity: 4,
                total_price: 119.96,
                product_image: 'https://example.com/img1.jpg'
              }
            ]),
            created_at: expect.any(String),
            updated_at: expect.any(String)
          })
        );
      });
  });

  test("PATCH /api/cart/product_id => Should fail if quantity exceeds stock", () => {
    const cartItem = {
      items: ([
        {
          quantity: 4000,
        },
      ]),
      updated_at: new Date(),
    };
    return request(app)
      .patch("/api/cart/2/1")
      .send(cartItem)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Quantity exceeds stock");
      });
  });

  test("PATCH /api/cart/product_id => Should return 404 if product is not in cart", () => {
    const cartItem = {
      items: ([
        {
          quantity: 4000,
        },
      ]),
      updated_at: new Date(),
    };
    return request(app)
      .patch("/api/cart/2/3000")
      .send(cartItem)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Product not in stock");
      });
  });

  test("DELETE /api/cart/:user_id/:cart_id Admin - Should allow admin to delete product", () => {
    return request(app)
      .delete("/api/cart/3/10")
      .expect(200)
      .then((response) => {
        expect(response.text).toBe("Item Successfully deleted");
      });
  });

  test("DELETE /api/cart/:user_id/:cart_id Admin - Should return 404 if product doesn’t exist", () => {
    return request(app)
      .delete("/api/cart/3/1999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Cart doesn't exist!");
      });
  });
});
