const request = require("supertest");
const app = require("../apps/app.js");
const endpointJSON = require("../Endpoints/endpoint.json")

describe("GET - /api", () => {
    test("should serve up a json representation of all the available endpoints of the api", () => {
        return request(app)
        .get("/api")
        .expect(200)
        .then((response) => {
            expect(response.body.api).toEqual(endpointJSON)
        })
    })
})