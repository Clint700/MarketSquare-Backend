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

describe.only("/api/admin", () => {
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
                user_id: expect.any(Number),
                full_name: expect.any(String),
                order_id: expect.any(Number),
                items: expect.any(Array),
                total_amount: expect.any(String),
                shipping_cost: expect.any(Number),
                status: expect.any(String),
                payment_status: expect.any(String),
                shipping_address: expect.any(Object),
                billing_address: expect.any(Object),
                created_at: expect.any(String),
                updated_at: expect.any(String),
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

  describe("GET /api/admin/orders/:order_id", () => {
    test("Should return details of a specific order for admin", () => {
      return request(app)
        .get("/api/admin/orders/1")
        .set("role", "admin")
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              user_id: 2,
              full_name: "Jane Doe",
              order_id: 1,
              items: JSON.stringify([
                {
                  item_id: 1,
                  item_name: "Bluetooth Speaker",
                  price: 29.99,
                  quantity: 2,
                  total_price: 59.98,
                },
              ]),
              total_amount: 59.98,
              shipping_cost: 10.0,
              status: "processing",
              payment_status: "paid",
              shipping_address: JSON.stringify({
                street: "2 Customer Street",
                city: "Manchester",
                county: "Greater Manchester",
                postcode: "M1 1AE",
                country: "UK",
              }),
              billing_address: JSON.stringify({
                street: "2 Customer Street",
                city: "Manchester",
                county: "Greater Manchester",
                postcode: "M1 1AE",
                country: "UK",
              }),
              created_at: expect.any(String),
              updated_at: expect.any(String),
            })
          );
        });
    });

    test("Should return 404 if specific order does not exist", () => {
      return request(app)
        .get("/api/admin/orders/9999")
        .set("role", "admin")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Order not found");
        });
    });

    test("Should deny access to specific order for non-admin", () => {
      return request(app)
        .get("/api/admin/orders/1")
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
        .send({
          status: "shipped",
          payment_status: "unpaid",
          shipping_cost: 5.0,
          updated_at: new Date(),
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              order_id: 1,
              status: "shipped",
              payment_status: "unpaid",
              updated_at: expect.any(String),
            })
          );
        });
    });

    test("Should return 404 if order doesn’t exist", () => {
      return request(app)
        .patch("/api/admin/orders/9999")
        .set("role", "admin")
        .send({
          status: "shipped",
          payment_status: "unpaid",
          shipping_cost: 5.0,
          updated_at: new Date()
        })
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
                user_id: expect.any(Number),
                img_url: expect.any(String),
                created_at: expect.any(String),
                price: expect.any(String),
                stock: expect.any(Number),
                item_id: expect.any(Number),
                category: expect.any(String),
                item_name: expect.any(String),
                item_description: expect.any(String),
                dimensions: expect.any(Object) || null,
                rating: expect.any(Number)
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
                username: expect.any(String),
                password: expect.any(String),
                first_name: expect.any(String),
                last_name: expect.any(String),
                email: expect.any(String),
                number: expect.any(String),
                role: expect.any(String),
                address: {
                  street: expect.any(String),
                  city: expect.any(String),
                  county: expect.any(String),
                  postcode: expect.any(String),
                  country: expect.any(String)
                },
                preferences: { theme: expect.any(String), notifications: expect.any(Boolean) }
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
