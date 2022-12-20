import { assertEquals } from '../testDeps.ts';
import { getEndpoint } from "./getEndpoint.ts";

Deno.test("Get Endpoint", async (t) => {

    const requestsURLs = [
        { url: "https://localhost:8080/todos/products", endpoint: "/products" },
        { url: "https://localhost:8080/todos/products/1", endpoint: "/products/1" },
        { url: "https://localhost:8080/todos/products/1/1/todos/1", endpoint: "/products/1/1/todos/1" },
        { url: "https://localhost:8080/gateaway/", endpoint: "/gateaway/" },
        { url: "https://localhost:8080/gateaway/health", endpoint: "/gateaway/health" },
        { url: "https://localhost:8080/gateaway/endpoints", endpoint: "/gateaway/endpoints" },
    ]

    for (const req of requestsURLs) {
        await t.step(req.endpoint, () => {
            const endpoint = getEndpoint(req.url);
            assertEquals(endpoint, req.endpoint);
        });
    }

});