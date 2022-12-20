import { assertObjectMatch, assertEquals } from '../testDeps.ts';
import { EndpointDataMemoryCache } from "./endpointDataMemoryCache.ts"

const endpoints_test = {
    "/todos": {
        "BASE_URL": "http://localhost:4000"
    },
    "products": {
        "BASE_URL": "http://localhost:4001"
    }
}

Deno.test("EndpointDataMemoryCache", async (t) => {

    await t.step("Initial data should be undefined", () => {
        assertEquals(EndpointDataMemoryCache.endpointsData, undefined);
    });

    await t.step("Trying to get the endpoints data from the json file", async () => {

        const endpointsData = await EndpointDataMemoryCache.getEndpointsData();

        assertObjectMatch(endpointsData, endpoints_test);

        // Make sure the function does not set the endpoints data
        assertEquals(EndpointDataMemoryCache.endpointsData, undefined);

    });

    await t.step("Set the endpoints data without any params", async () => {

        await EndpointDataMemoryCache.setEndpointsData();

        assertObjectMatch(EndpointDataMemoryCache.endpointsData, endpoints_test);

    });

    await t.step("Set the endpoints data without param", async () => {

        await EndpointDataMemoryCache.setEndpointsData();
        assertObjectMatch(EndpointDataMemoryCache.endpointsData, endpoints_test);

    });

    await t.step("Set the endpoints data with param", async () => {

        await EndpointDataMemoryCache.setEndpointsData({
            "/todos": {
                "BASE_URL": "http://localhost:4000"
            }
        });

        assertObjectMatch(EndpointDataMemoryCache.endpointsData, {
            "/todos": {
                "BASE_URL": "http://localhost:4000"
            }
        });

        await EndpointDataMemoryCache.setEndpointsData(endpoints_test);
        assertObjectMatch(EndpointDataMemoryCache.endpointsData, endpoints_test);

    });

    await t.step("The endpoints data should be available in the memory static variable", () => {

        const endpointsData = EndpointDataMemoryCache.getCachedEndpointsData();
        assertObjectMatch(endpointsData, endpoints_test);

    });

});