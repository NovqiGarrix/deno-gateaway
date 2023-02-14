import isURL from "./isURL.ts";
import { assertEquals } from "../testDeps.ts";

Deno.test("isAURL Function", async (t) => {
  await t.step("Local URL", () => {
    const localURL = isURL("http://localhost:8080");
    assertEquals(localURL, true);
  });

  await t.step("HTTPS URL", () => {
    const httpsURL = isURL("https://google.com");
    assertEquals(httpsURL, true);
  });

  await t.step("Invalid URL", () => {
    const invalidURL = isURL("heello world");
    assertEquals(invalidURL, false);
  });
});
