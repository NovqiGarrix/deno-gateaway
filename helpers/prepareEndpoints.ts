import { cron } from 'https://deno.land/x/deno_cron@v1.0.0/cron.ts';
import { EndpointDataMemoryCache } from "../utils/endpointDataMemoryCache.ts";

/**
 * 
 * @param schedule. 
 * Default: * * * * * (every minute)
 */
export default async function prepareEndpoints(schedule = "* * * * *") {
    // Fetch new endpoints data
    const endpointsData = await EndpointDataMemoryCache.getEndpointsData();

    // Lalu set data nya ke class EndpointDataMemoryCache
    await EndpointDataMemoryCache.setEndpointsData(endpointsData);

    // Set scheduler untuk update endpoints data
    cron(schedule, async () => {
        console.log(`🦕 UPDATING ENDPOINTS DATA... 🔥`);

        const endpointsData = await EndpointDataMemoryCache.getEndpointsData();
        await EndpointDataMemoryCache.setEndpointsData(endpointsData);

        console.log(`🦕 ENDPOINTS DATA UPDATED!!! 🔥`);
    });
}