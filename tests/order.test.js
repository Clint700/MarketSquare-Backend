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
              user_id: 3,
              full_name: "Alice Wong",
              items:expect.any(Array),
              total_amount: 89.97,
              shipping_cost: 15.0,
              status: "shipped",
              payment_status: "paid",
              shipping_address: expect.any(Object),
              billing_address: expect.any(Object),
              created_at: expect.any(String),
              updated_at: expect.any(String),
            })
          );
        });
    });

    test("Should fail if cart is empty", () => {
      return request(app)
        .post("/api/orders")
        .send({ user_id: 50000000 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Cart is empty!");
        });
    });
  });

  describe("GET /api/orders/:order_id", () => {
    test("Should return order details", () => {
      return request(app)
        .get("/api/orders/1")
        .send({ user_id: 2 })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              user_id: 2,
              full_name: "Jane Doe",
              items: expect.any(Array),
              total_amount: 59.98,
              shipping_cost: 10.0,
              status: "processing",
              payment_status: "paid",
              shipping_address: expect.any(Object),
              billing_address: expect.any(Object),
              created_at: expect.any(String),
              updated_at: expect.any(String),
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
        .get("/api/orders/1")
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
                user_id: expect.any(Number),
                full_name: expect.any(String),
                items: expect.any(Array),
                total_amount: expect.any(Number),
                shipping_cost: expect.any(Number),
                status: expect.any(String),
                payment_status: expect.any(String),
                shipping_address: expect.any(Object),
                billing_address: expect.any(Object),
                created_at: expect.any(String),
                updated_at: expect.any(String),
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
