import { IEndpointsData } from '../types.ts';

export class EndpointDataMemoryCache {
    public static endpointsData: IEndpointsData;

    public static async setEndpointsData(endpointsData?: IEndpointsData) {
        if (endpointsData) {
            this.endpointsData = endpointsData;
            return;
        }

        this.endpointsData = await this.getEndpointsData();
    }

    public static async getEndpointsData(): Promise<IEndpointsData> {
        // This should be an HTTP request to the endpoints service

        const decoder = new TextDecoder();
        const data = await Deno.readFile("./endpoints_test.json");

        return JSON.parse(decoder.decode(data));
    }

    public static getCachedEndpointsData(): IEndpointsData {
        return this.endpointsData;
    }

}