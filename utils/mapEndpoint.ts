import serviceManager from "./serviceManager.ts";

export function mapEndpoint(endpoint: string) {
  const endpointsData = serviceManager.getAll();
  return endpointsData.get(endpoint);
}
