import { assertEquals } from "../testDeps.ts";
import checkEndpointData from "./checkEndpointData.ts";

Deno.test("Check Endpoint Data", async (t) => {
  const endpointsData = [
    { endpoint: "/products", base_url: "http://localhost:5000", valid: true },
    { endpoint: "/todos", valid: false },
    { base_url: "http://localhost:5000", valid: false },
    { base_url: "", valid: false },
    { base_url: "http://localhost:5000", endpoint: "", valid: false },
    { endpoint: "/todos", base_url: "http://localhost:4000", valid: true },
  ];

  let index = 0;

  for (const e of endpointsData) {
    await t.step(`Index: ${index}`, () => {
      // @ts-ignore - For testing purposes
      assertEquals(checkEndpointData(e), e.valid);
    });
    index++;
  }
});
