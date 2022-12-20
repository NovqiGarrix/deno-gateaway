import { getServiceEndpoint } from "./getEndpoint.ts";

export function reqLog(req: Request) {
    const serviceEndpoint = getServiceEndpoint(req.url);
    console.log(`[METHOD]: ${req.method}. [URL]: ${serviceEndpoint}`);
}

export function resLog(req: Request, status: number) {
    const serviceEndpoint = getServiceEndpoint(req.url);
    console.log(`[METHOD]: ${req.method} [URL]: ${serviceEndpoint} [STATUS]: ${status}`);
}