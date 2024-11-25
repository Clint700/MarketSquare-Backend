const request = require("supertest");
const app = require("../apps/app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const jwt = require("jsonwebtoken");
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
  let token;

  beforeAll(() => {
    token = jwt.sign(
      { user_id: 1, username: "adminJohn", role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  test("POST /api/auth/login => Should log in with valid credentials (admin or customer)", () => {
    const loginData = {
      username: "adminJohn",
      password: "adminPassword123",
    };
    return request(app)
      .post("/api/auth/login")
      .send(loginData)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            user: expect.objectContaining({
              username: "adminJohn",
              full_name: "John Admin",
              email: "admin.john@example.co.uk",
              number: "07123456789",
              role: "admin",
            }),
            token: expect.any(String),
          })
        );
      });
  });

  test("POST /api/auth/login => Should fail with invalid username/password", () => {
    const loginData = {
      username: "adminJohn",
      password: "wrongPassword",
    };
    return request(app)
      .post("/api/auth/login")
      .send(loginData)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid username or password");
      });
  });

  test("POST /api/auth/register => Should register a new customer", () => {
    const registerData = {
      username: "customerDike",
      password: "dikeSecure456",
      full_name: "Dike Thrown",
      email: "dike.trown@example.co.uk",
      number: "07478901234",
      role: "customer",
      address: {
        street: "6 Mike Crescent",
        city: "Edinburgh",
        county: "Midlothian",
        postcode: "EH1 1AA",
        country: "UK",
      },
      preferences: { theme: "light", notifications: false },
    };
    return request(app)
      .post("/api/auth/register")
      .send(registerData)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            user: {
              user_id: expect.any(Number),
              username: "customerDike",
              full_name: "Dike Thrown",
              email: "dike.trown@example.co.uk",
              number: "07478901234",
              role: "customer",
              address: expect.any(Object),
              preferences: expect.any(Object),
            },
            token: expect.any(String),
          })
        );
      });
  });

  test("POST /api/auth/register => Should fail with missing fields", () => {
    const registerData = {
      username: "incompleteUser",
      password: "Password123",
      full_name: "Incomplete User",
      email: "incomplete.user@example.co.uk",
    };
    return request(app)
      .post("/api/auth/register")
      .send(registerData)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Missing field required");
      });
  });

  test("POST /api/auth/register => Should fail if username/email exists", () => {
    const registerData = {
      username: "adminJohn",
      password: "adminPassword123",
      full_name: "John Admin",
      email: "admin.john@example.co.uk",
      number: "07123456789",
      role: "admin",
    };
    return request(app)
      .post("/api/auth/register")
      .send(registerData)
      .expect(409)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Username or email already exists! Please log in.");
      });
  });
});