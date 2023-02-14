import { assertArrayIncludes, assertEquals } from "../testDeps.ts";
import { Endpoint } from "../types.ts";

import { EndpointDataMemoryCache } from "./endpointDataMemoryCache.ts";

const endpoints_test: Array<Endpoint> = [
  {
    "base_url": "http://127.0.0.1:4000/api/v1",
    "endpoint": "/todos",
  },
  {
    "base_url": "http://127.0.0.1:4001/api/v1",
    "endpoint": "/products",
  },
];

Deno.test("EndpointDataMemoryCache", async (t) => {
  await t.step("Initial data should be undefined", () => {
    assertEquals(EndpointDataMemoryCache.endpointsData, undefined);
  });

  await t.step(
    "Trying to get the endpoints data from the json file",
    async () => {
      const endpointsData = await EndpointDataMemoryCache.getEndpointsData();

      assertArrayIncludes(endpointsData, endpoints_test);

      // Make sure the function does not set the endpoints data
      assertEquals(EndpointDataMemoryCache.endpointsData, undefined);
    },
  );

  await t.step("Set the endpoints data without any params", async () => {
    await EndpointDataMemoryCache.setEndpointsData();

    assertArrayIncludes(EndpointDataMemoryCache.endpointsData, endpoints_test);
  });

  await t.step("Set the endpoints data without param", async () => {
    await EndpointDataMemoryCache.setEndpointsData();
    assertArrayIncludes(EndpointDataMemoryCache.endpointsData, endpoints_test);
  });

  await t.step("Set the endpoints data with param", async () => {
    const expected: Array<Endpoint> = [
      { base_url: "http://localhost:4000", endpoint: "/todos" },
    ];

    await EndpointDataMemoryCache.setEndpointsData(expected);
    assertArrayIncludes(EndpointDataMemoryCache.endpointsData, expected);

    await EndpointDataMemoryCache.setEndpointsData(endpoints_test);
    assertArrayIncludes(EndpointDataMemoryCache.endpointsData, endpoints_test);
  });

  await t.step(
    "The endpoints data should be available in the memory static variable",
    () => {
      const endpointsData = EndpointDataMemoryCache.getCachedEndpointsData();
      assertArrayIncludes(endpointsData, endpoints_test);
    },
  );
});
