import { Status } from "../deps.ts";
import {
  assertEquals,
  assertExists,
  assertStringIncludes,
  superdeno,
} from "../testDeps.ts";

import createServer from "../app.ts";
import serviceManager from "../utils/serviceManager.ts";
import { invalidBaseUrl } from "../schemas/service.schema.ts";

Deno.test("#1. Success to Add a Service", async () => {
  const app = createServer();

  const reqBody = { base_url: "http://localhost:4000/api", endpoint: "/todos" };

  await superdeno(app.handle.bind(app))
    .post("/gateway/services")
    .send(reqBody)
    .expect((res) => {
      const { body, headers, status } = res;

      const contentType = headers["content-type"].toString();
      assertExists(contentType);
      assertStringIncludes(contentType!, "application/json");

      assertEquals(status, Status.Created);

      assertEquals(body, {
        code: 201,
        status: "Created",
      });

      assertEquals(serviceManager.get(reqBody.endpoint), reqBody);
    });
});

Deno.test("#2. Failed to Add a Service due to invalid req body", async () => {
  const app = createServer();

  const reqBody = { base_url: "http://", endpoint: "/todos" };

  await superdeno(app.handle.bind(app))
    .post("/gateway/services")
    .send(reqBody)
    .expect((res) => {
      const { body, headers, status } = res;

      const contentType = headers["content-type"].toString();
      assertExists(contentType);
      assertStringIncludes(contentType!, "application/json");

      assertEquals(status, Status.BadRequest);

      assertEquals(body, {
        code: Status.BadRequest,
        status: "Bad Request",
        errors: [
          {
            field: "base_url",
            error: invalidBaseUrl,
          },
        ],
      });

      assertEquals(serviceManager.get(reqBody.endpoint), undefined);
    });
});

Deno.test("#3. Sucess to delete a service", async () => {
  const app = createServer();

  const reqBody = { base_url: "http://localhost:4000/api", endpoint: "/todos" };
  serviceManager.set(reqBody);

  await superdeno(app.handle.bind(app))
    .delete(
      `/gateway/services?endpoint=${encodeURIComponent(reqBody.endpoint)}`,
    )
    .expect((res) => {
      const { body, headers, status } = res;

      const contentType = headers["content-type"].toString();
      assertExists(contentType);
      assertStringIncludes(contentType!, "application/json");

      assertEquals(status, Status.OK);

      assertEquals(body, {
        code: Status.OK,
        status: "OK",
      });

      assertEquals(serviceManager.get(reqBody.endpoint), undefined);
    });
});

Deno.test("#4. Failed to delete a service due to no service", async () => {
  const app = createServer();

  const service = { endpoint: "/todos" };
  // serviceManager.set(reqBody);

  await superdeno(app.handle.bind(app))
    .delete(
      `/gateway/services?endpoint=${encodeURIComponent(service.endpoint)}`,
    )
    .expect((res) => {
      const { body, headers, status } = res;

      const contentType = headers["content-type"].toString();
      assertExists(contentType);
      assertStringIncludes(contentType!, "application/json");

      assertEquals(status, Status.NotFound);

      assertEquals(body, {
        code: Status.NotFound,
        status: "Not Found",
        errors: [
          {
            error: "Service not found",
          },
        ],
      });

      assertEquals(serviceManager.get(service.endpoint), undefined);
    });
});

Deno.test("#5. Success to return a service based on the endpoint", async () => {
  const app = createServer();

  const service = { base_url: "http://localhost:4000/api", endpoint: "/todos" };
  serviceManager.set(service);

  await superdeno(app.handle.bind(app))
    .get(
      `/gateway/services?endpoint=${encodeURIComponent(service.endpoint)}`,
    )
    .expect((res) => {
      const { body, headers, status } = res;

      const contentType = headers["content-type"].toString();
      assertExists(contentType);
      assertStringIncludes(contentType!, "application/json");

      assertEquals(status, Status.OK);

      assertEquals(body, {
        code: Status.OK,
        status: "OK",
        data: service,
      });

      assertEquals(serviceManager.get(service.endpoint), service);
    });
});

Deno.test("#6. Should return not found for service that does not exist", async () => {
  const app = createServer();

  const service = { endpoint: "/todos" };

  await superdeno(app.handle.bind(app))
    .get(
      `/gateway/services?endpoint=${encodeURIComponent(service.endpoint)}`,
    )
    .expect((res) => {
      const { body, headers, status } = res;

      const contentType = headers["content-type"].toString();
      assertExists(contentType);
      assertStringIncludes(contentType!, "application/json");

      assertEquals(status, Status.NotFound);

      assertEquals(body, {
        code: Status.NotFound,
        status: "Not Found",
      });

      assertEquals(serviceManager.get(service.endpoint), undefined);
    });
});
