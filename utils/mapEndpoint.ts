import { EndpointDataMemoryCache } from "./endpointDataMemoryCache.ts";

export function mapEndpoint(endpoint: string) {
  const endpointsData = EndpointDataMemoryCache.getCachedEndpointsData();
  return endpointsData.find((e) => e.endpoint === endpoint);
}
