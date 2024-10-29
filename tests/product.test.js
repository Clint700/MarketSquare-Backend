const request = require("supertest");
const app = require("../app.js");
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

describe("/api/product", () => {
  test("POST /api/product Admin - Should allow admin to create new product", () => {
    const itemData = {
      user_id: 1,
      img_url: "https://example.com/img6.jpg",
      created_at: new Date(),
      price: "59.99",
      category: "Toys",
      item_name: "Baby plane",
      item_description: "Safe and portable baby plane to keep them busy.",
    };
    return request(app)
      .post("/api/product")
      .send(itemData)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            user_id: 1,
            img_url: "https://example.com/img6.jpg",
            created_at: expect.any(String),
            price: "59.99",
            category: "Toys",
            item_name: "Baby plane",
            item_description: "Safe and portable baby plane to keep them busy.",
          })
        );
      });
  });

  test("POST /api/product Admin - Should fail with missing fields", () => {
    const itemData = {
      img_url: "https://example.com/img6.jpg",
      created_at: new Date(),
      price: "59.99",
      item_name: "Baby plane",
      item_description: "Safe and portable baby plane to keep them busy.",
    };
    return request(app)
      .post("/api/product")
      .send(itemData)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Please fill up empty fields");
      });
  });

  test("POST /api/product Admin - Should deny non-admin", () => {
    const itemData = {
      user_id: 2,
      img_url: "https://example.com/img6.jpg",
      created_at: new Date(),
      price: "59.99",
      category: "Toys",
      item_name: "Baby plane",
      item_description: "Safe and portable baby plane to keep them busy.",
    };
    return request(app)
      .post("/api/product")
      .send(itemData)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Admin only!");
      });
  });

  test("PATCH /api/product/:product_id Admin - Should allow admin to update product", () => {
    const itemData = {
      user_id: 1,
      img_url: "https://example.com/img10.jpg",
      created_at: new Date(),
      price: "29.99",
      category: "Electronics",
      item_name: "Bluetooth",
      item_description: "Portable wireless speaker with 15-hour battery life.",
    };
    return request(app)
      .patch("/api/product/1")
      .send(itemData)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            user_id: 1,
            img_url: "https://example.com/img10.jpg",
            created_at: expect.any(String),
            price: "29.99",
            category: "Electronics",
            item_name: "Bluetooth",
            item_description:
              "Portable wireless speaker with 15-hour battery life.",
          })
        );
      });
  });

  test("PATCH /api/product/:product_id Admin - Should return 404 if product doesn’t exist", () => {
    const itemData = {
      user_id: 1,
      img_url: "https://example.com/img100.jpg",
      created_at: new Date(),
      price: "79.99",
      category: "Electronics set",
      item_name: "Bluetooth batch",
      item_description: "Portable wireless speaker with 15-hour battery life.",
    };
    return request(app)
      .patch("/api/product/1999")
      .send(itemData)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Product doesn't exist");
      });
  });

  test("PATCH /api/product/:product_id Admin - Should return 404 if product doesn’t exist", () => {
    const itemData = {
      user_id: 2,
      img_url: "https://example.com/img100.jpg",
      created_at: new Date(),
      price: "79.99",
      category: "Electronics set",
      item_name: "Bluetooth batch",
      item_description: "Portable wireless speaker with 15-hour battery life.",
    };
    return request(app)
      .patch("/api/product/2")
      .send(itemData)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Admin only!");
      });
  });

  test("DELETE /api/product/:user_id/:item_id Admin - Should allow admin to delete product", () => {
    return request(app)
      .delete("/api/product/1/2")
      .expect(200)
      .then((response) => {
        expect(response.text).toBe("Item Successfully deleted");
      });
  });

  test("DELETE /api/product/:user_id/:item_id Admin - Should return 404 if product doesn’t exist", () => {
    return request(app)
      .delete("/api/product/1/1999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Product doesn't exist!");
      });
  });

  test("DELETE /api/product/:user_id/:item_id Admin - Should deny non-admin", () => {
    return request(app)
      .delete("/api/product/2/2")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Admin only!");
      });
  });

  test("GET /api/product => Should return list of products", () => {
    return request(app)
      .get("/api/product")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        body.forEach((item) => {
          expect(item).toEqual(
            expect.objectContaining({
              user_id: expect.any(Number),
              img_url: expect.any(String),
              created_at: expect.any(String),
              price: expect.any(String),
              category: expect.any(String),
              item_name: expect.any(String),
              item_description: expect.any(String),
            })
          );
        });
      });
  });

  test("GET /api/product => Should return list of products", () => {
    return request(app)
      .get("/api/product?limit=4&page=1")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        body.forEach((item) => {
          expect(item).toEqual(
            expect.objectContaining({
              user_id: expect.any(Number),
              img_url: expect.any(String),
              created_at: expect.any(String),
              price: expect.any(String),
              category: expect.any(String),
              item_name: expect.any(String),
              item_description: expect.any(String),
            })
          );
        });
      });
  });

  test("Should filter by item_name", () => {
    return request(app)
      .get("/api/product?item_name=Bluetooth Speaker&limit=4&page=1")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        body.forEach((item) => {
          expect(item.item_name).toMatch(/Bluetooth Speaker/i);
        });
      });
  });

  test("Should filter by category and item_name", () => {
    return request(app)
      .get(
        "/api/product?category=Electronics&item_name=Bluetooth Speaker&limit=4&page=1"
      )
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        body.forEach((item) => {
          expect(item.category).toBe("Electronics");
          expect(item.item_name).toMatch(/Bluetooth Speaker/i);
        });
      });
  });

  test("Should filter by item_name and price range", () => {
    return request(app)
      .get(
        "/api/product?item_name=Bluetooth Speaker&price_min=20&price_max=100&limit=4&page=1"
      )
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        body.forEach((item) => {
          expect(item.item_name).toMatch(/Bluetooth Speaker/i);
          expect(Number(item.price)).toBeGreaterThanOrEqual(20);
          expect(Number(item.price)).toBeLessThanOrEqual(100);
        });
      });
  });

  test("GET /api/product/:product_id => Should return product details ", () => {
    return request(app)
      .get("/api/product/4")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            user_id: 4,
            img_url: 'https://example.com/img4.jpg',
            created_at: expect.any(String),
            price: '99.99',
            category: 'Fitness',
            item_name: 'Yoga Mat',
            item_description: 'Non-slip yoga mat with carrying strap.'
          })
        );
      });
  });

  test("GET /api/product/:product_id => Should return 404 if product does not exist", () => {
    return request(app)
      .get("/api/product/6")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Product doesn't exist!");
      });
  });
});
