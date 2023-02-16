import { assertEquals, assertInstanceOf, expect } from "../testDeps.ts";

import { Service } from "../types.ts";
import {
  invalidBaseUrl,
  slashEndpointError,
} from "../schemas/service.schema.ts";

import serviceManager from "./serviceManager.ts";
import ServiceExeption from "../exeptions/service.exeption.ts";

const services: Array<Service> = [
  {
    "base_url": "http://127.0.0.1:4000/api/v1",
    "endpoint": "/todos",
  },
  {
    "base_url": "http://127.0.0.1:4001/api/v1",
    "endpoint": "/products",
  },
];

Deno.test("#1. Should add a new endpoint", async (t) => {
  for await (const service of services) {
    await t.step(service.base_url, () => {
      serviceManager.set(service);
    });
  }

  assertEquals(serviceManager.getAllInArray(), services);
});

Deno.test("#2. Should not add an invalid endpoint and return errors", async (t) => {
  const invalidServices = [
    {
      base_url: "",
      endpoint: "/",
      errors: [
        {
          field: "base_url",
          error: invalidBaseUrl,
        },
        {
          field: "endpoint",
          error: slashEndpointError,
        },
      ],
    },
    {
      base_url: "http://localhost:3000",
      endpoint: "/",
      errors: [
        {
          field: "endpoint",
          error: slashEndpointError,
        },
      ],
    },
  ];

  for await (const { base_url, endpoint, errors } of invalidServices) {
    await t.step(`Base URL: ${base_url}. Endpoint: ${endpoint}`, () => {
      try {
        serviceManager.set({ base_url, endpoint });
      } catch (error) {
        assertInstanceOf(error, ServiceExeption);
        assertEquals(error.errors, errors);
        expect(serviceManager.get(endpoint)).toBeUndefined();
      }
    });
  }
});

Deno.test("#3. Should return a service based on the endpoint", () => {
  serviceManager.set(services[0]);

  const actual = serviceManager.get(services[0].endpoint);
  expect(actual).toBeDefined();

  assertEquals(actual!, services[0]);
});
