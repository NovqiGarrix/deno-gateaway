import createServer from "./app.ts";
import { assertEquals, superdeno } from "./testDeps.ts";
import checkEndpointData from "./utils/checkEndpointData.ts";

// Endpoints to check the health of the server
Deno.test("GET /gateaway/healthcheck", async () => {
  const app = await createServer();

  await superdeno(app.handle.bind(app))
    .get("/gateaway/healthcheck")
    .expect(200)
    .expect((resp) => {
      const { body } = resp;

      assertEquals(body.code, 200);
      assertEquals(body.data, "OK");
    });
});

// Endpoint to update the endpoint list
Deno.test("GET /gateaway/endpoints", async () => {
  const app = await createServer();

  await superdeno(app.handle.bind(app))
    .post("/gateaway/endpoints")
    .expect(200)
    .expect((resp) => {
      const { body: { data, code } } = resp;

      assertEquals(code, 200);

      for (const ed of data) {
        if (!checkEndpointData(ed)) {
          console.log(JSON.stringify(ed, null, 2));
          throw new Error("Endpoint data is not valid");
        }
      }
    });
});
