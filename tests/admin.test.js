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

describe("/api/admin", () => {
    describe("GET /api/admin/orders", () => {
      test("Should return list of all customer orders", () => {
        return request(app)
          .get("/api/admin/orders")
          .set("role", "admin")
          .expect(200)
          .then(({ body }) => {
            expect(Array.isArray(body)).toBe(true);
            body.forEach((order) =>
              expect(order).toEqual(
                expect.objectContaining({
                  order_id: expect.any(Number),
                  user_id: expect.any(Number),
                  total_amount: expect.any(String),
                  status: expect.any(String),
                })
              )
            );
          });
      });
  
      test("Should allow filtering by status", () => {
        return request(app)
          .get("/api/admin/orders?status=pending")
          .set("role", "admin")
          .expect(200)
          .then(({ body }) => {
            body.forEach((order) => {
              expect(order.status).toBe("pending");
            });
          });
      });
  
      test("Should deny non-admin", () => {
        return request(app)
          .get("/api/admin/orders")
          .set("role", "customer")
          .expect(403)
          .then(({ body }) => {
            expect(body.msg).toBe("Admin access only");
          });
      });
    });
  
    describe("PATCH /api/admin/orders/:order_id", () => {
      test("Should allow admin to update order status", () => {
        return request(app)
          .patch("/api/admin/orders/1")
          .set("role", "admin")
          .send({ status: "shipped" })
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                order_id: 1,
                status: "shipped",
              })
            );
          });
      });
  
      test("Should return 404 if order doesn’t exist", () => {
        return request(app)
          .patch("/api/admin/orders/9999")
          .set("role", "admin")
          .send({ status: "shipped" })
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Order not found");
          });
      });
    });
  
    describe("GET /api/admin/products", () => {
      test("Should return list of all products", () => {
        return request(app)
          .get("/api/admin/products")
          .set("role", "admin")
          .expect(200)
          .then(({ body }) => {
            expect(Array.isArray(body)).toBe(true);
            body.forEach((product) =>
              expect(product).toEqual(
                expect.objectContaining({
                  item_id: expect.any(Number),
                  user_id: expect.any(Number),
                  item_name: expect.any(String),
                })
              )
            );
          });
      });
  
      test("Should deny non-admin access", () => {
        return request(app)
          .get("/api/admin/products")
          .set("role", "customer")
          .expect(403)
          .then(({ body }) => {
            expect(body.msg).toBe("Admin access only");
          });
      });
    });
  
    describe("GET /api/admin/users", () => {
      test("Should return list of all customers", () => {
        return request(app)
          .get("/api/admin/users")
          .set("role", "admin")
          .expect(200)
          .then(({ body }) => {
            expect(Array.isArray(body)).toBe(true);
            body.forEach((user) =>
              expect(user).toEqual(
                expect.objectContaining({
                  user_id: expect.any(Number),
                  username: expect.any(String),
                  role: "customer",
                })
              )
            );
          });
      });
  
      test("Should deny non-admin access", () => {
        return request(app)
          .get("/api/admin/users")
          .set("role", "customer")
          .expect(403)
          .then(({ body }) => {
            expect(body.msg).toBe("Admin access only");
          });
      });
    });
  });