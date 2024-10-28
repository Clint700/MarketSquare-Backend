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

describe("/api/auth", () => {
  test("POST /api/auth/login => Should log in with valid credentials (admin or customer)", () => {
    const loginData = {
      username: "adminJohn",
      password: "adminPassword123",
    };
    return request(app)
      .post("/api/auth/login")
      .send(loginData)
      .expect(200) 
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            username: 'adminJohn',
            first_name: 'John',
            last_name: 'Admin',
            email: 'admin.john@example.com',
            number: '1234567890',
            role: 'admin',
          })
        );
      });
  });

  test("400 /api/auth/login => Should fail with invalid username/password", () => {
    const loginData = {
      username: "adminJohn",
      password: "adminPassword",
    };
    return request(app)
      .post("/api/auth/login")
      .send(loginData)
      .expect(400) 
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid username or password");
      });
  });

  test("404 /api/auth/login => Should log in with valid credentials (admin or customer)", () => {
    const loginData = {
      username: "adminJohn",
      password: "adminPassword123",
    };
    return request(app)
      .post("/api/auth/logi")
      .send(loginData)
      .expect(404) 
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Page not found");
      });
  });
});

describe("/api/auth", () => {
  test("POST /api/auth/register => Should register a new customer", () => {
    const registerData = {
      username: 'adminFrank',
      password: 'FrankPassword123',
      first_name: 'Frank',
      last_name: 'Admin',
      email: 'admin.Frank@example.com',
      number: '1234567890',
      role: 'admin'
    };
    return request(app)
      .post("/api/auth/register")
      .send(registerData)
      .expect(200) 
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            username: 'adminFrank',
            first_name: 'Frank',
            last_name: 'Admin',
            email: 'admin.Frank@example.com',
            number: '1234567890',
            role: 'admin'
          })
        );
      });
  });

  test("400 /api/auth/register => Should fail with missing fields", () => {
    const registerData = {
      username: 'adminFrank',
      password: 'FrankPassword123',
      first_name: 'Frank',
      last_name: 'Admin',
      email: 'admin.Frank@example.com',
      number: '1234567890',
    };
    return request(app)
      .post("/api/auth/register")
      .send(registerData)
      .expect(400) 
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Missing field required");
      });
  });

  test("400 /api/auth/register => Should fail if username/email exists", () => {
    const registerData = {
      username: 'adminJohn',
      password: 'adminPassword123',
      first_name: 'John',
      last_name: 'Admin',
      email: 'admin.john@example.com',
      number: '1234567890',
      role: 'admin'
    };
    return request(app)
      .post("/api/auth/register")
      .send(registerData)
      .expect(409) 
      .then(({ body: { msg } }) => {
        expect(msg).toBe("username or email exists! Please login");
      });
  });
});