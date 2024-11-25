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

describe("/api/profile", () => {
  test("POST /api/profile/:user_id => Should post a user profile", () => {
    const profileData = {
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
      .post("/api/profile/3")
      .send(profileData)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            user_id: 3,
            address: {
              street: "6 Mike Crescent",
              city: "Edinburgh",
              county: "Midlothian",
              postcode: "EH1 1AA",
              country: "UK",
            },
            preferences: { theme: "light", notifications: false },
          })
        );
      });
  });

  test("POST /api/profile/:user_id => Should fail with missing fields", () => {
    const profileData = {
        address: {
          street: "6 Mike Crescent",
          city: "Edinburgh",
          county: "Midlothian",
          postcode: "EH1 1AA",
          country: "UK",
        },
      };
    return request(app)
      .post("/api/profile/3")
      .send(profileData)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Missing field required");
      });
  });

  test("GET /api/profile/:user_id => Should return current user details if authenticated", () => {
    return request(app)
      .get("/api/profile/3")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            username: 'customerAlice',
            password: 'aliceSecure789',
            full_name: 'Alice Wong',
            email: 'alice.wong@example.co.uk',
            number: '07345678901',
            role: 'customer',
            address: {
              street: '3 Alice Avenue',
              city: 'Birmingham',
              county: 'West Midlands',
              postcode: 'B1 1AA',
              country: 'UK',
            },
            preferences: { theme: 'dark', notifications: false },
          })
        );
      });
  });

  test("GET /api/profile/:user_id => Should fail if token is invalid", () => {
    return request(app)
      .get("/api/profile/3000")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid user ID");
      });
  });

  test("PATCH /api/profile/:user_id => Should post a user profile", () => {
    const profileData = {
      address: {
        street: "16 Mike Crescent",
        city: "Edinburgh center",
        county: "Midlothian main",
        postcode: "EH1 1AA",
        country: "UK",
      },
      preferences: { theme: "light", notifications: true },
    };
    return request(app)
      .patch("/api/profile/3")
      .send(profileData)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            user_id: 3,
            address: {
              street: "16 Mike Crescent",
              city: "Edinburgh center",
              county: "Midlothian main",
              postcode: "EH1 1AA",
              country: "UK",
            },
            preferences: { theme: "light", notifications: true },
          })
        );
      });
  });

  test("PATCH /api/profile/:user_id => Should fail with missing fields", () => {
    const profileData = {
        address: {
          street: "6 Mike Crescent",
          city: "Edinburgh",
          county: "Midlothian",
          postcode: "EH1 1AA",
          country: "UK",
        },
      };
    return request(app)
      .patch("/api/profile/3")
      .send(profileData)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Missing field required");
      });
  });
});