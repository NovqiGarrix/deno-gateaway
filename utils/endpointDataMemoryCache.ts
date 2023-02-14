import { Endpoint } from "../types.ts";

export class EndpointDataMemoryCache {
  public static endpointsData: Array<Endpoint>;

  public static async setEndpointsData(endpointsData?: Array<Endpoint>) {
    if (endpointsData) {
      this.endpointsData = endpointsData;
      return;
    }

    this.endpointsData = await this.getEndpointsData();
  }

  public static async getEndpointsData(
    file = "./endpoints.json",
  ): Promise<Array<Endpoint>> {
    // This should be an HTTP request to the endpoints service

    const decoder = new TextDecoder();
    const data = await Deno.readFile(file);

    const endpointsData = JSON.parse(decoder.decode(data)) as {
      endpoints: Array<Endpoint>;
    };

    // VALIDATE EACH ENDPOINT

    return endpointsData.endpoints;
  }

  public static getCachedEndpointsData(): Array<Endpoint> {
    return this.endpointsData;
  }
}
