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

describe("/api/orders", () => {
  describe("POST /api/orders", () => {
    test("Should allow customer to place an order", () => {
      return request(app)
        .post("/api/orders")
        .send({ user_id: 3 })
        .expect(201)
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              order_id: expect.any(Number),
              user_id: 3,
              total_cost: expect.any(String), // Use total_amount instead of total_cost
              status: "pending",
              created_at: expect.any(String),
              items: expect.any(Array),
            })
          );
        });
    });

    test("Should fail if cart is empty", () => {
      return request(app)
        .post("/api/orders")
        .send({ user_id: 5 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Cart is empty!");
        });
    });

    test("Should fail if product is unavailable", () => {
      return request(app)
        .post("/api/orders")
        .send({ user_id: 3, product_id: 9999 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Cart is empty!");
        });
    });
  });

  describe("GET /api/orders/:order_id", () => {
    test("Should return order details", () => {
      return request(app)
        .get("/api/orders/2")
        .send({ user_id: 2 })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              order_id: expect.any(Number),
              user_id: 2,
              total_amount: expect.any(String),
              status: expect.any(String),
              created_at: expect.any(String),
            })
          );
        });
    });

    test("Should return 404 if order doesn’t exist", () => {
      return request(app)
        .get("/api/orders/9999")
        .send({ user_id: 3 })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Order not found");
        });
    });

    test("Should deny access to others’ orders", () => {
      return request(app)
        .get("/api/orders/2")
        .send({ user_id: 3 })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Order not found");
        });
    });
  });

  describe("GET /api/orders", () => {
    test("Should return list of customer’s orders", () => {
      return request(app)
        .get("/api/orders")
        .send({ user_id: 3 })
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
          body.forEach((order) => {
            expect(order).toEqual(
              expect.objectContaining({
                order_id: expect.any(Number),
                user_id: 3,
                total_amount: expect.any(String),
                status: expect.any(String),
              })
            );
          });
        });
    });

    test("Should allow filtering by status (e.g., pending, shipped)", () => {
      return request(app)
        .get("/api/orders?status=pending")
        .send({ user_id: 3 })
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
          body.forEach((order) => {
            expect(order.status).toBe("pending");
          });
        });
    });
  });
});
