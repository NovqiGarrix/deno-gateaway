import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import { Handler, serve } from "https://deno.land/std@0.170.0/http/mod.ts";

import prepareEndpoints from "./helpers/prepareEndpoints.ts";

import { mapEndpoint } from "./utils/mapEndpoint.ts";
import { reqLog, resLog } from "./utils/reqResLog.ts";
import { getEndpoint, getServiceEndpoint } from "./utils/getEndpoint.ts";
import { EndpointDataMemoryCache } from "./utils/endpointDataMemoryCache.ts";

const abortController = new AbortController();

const signals = ["SIGINT", "SIGTERM"];
for (let systemSignal of signals) {
  if (Deno.build.os === "windows" && systemSignal === "SIGTERM") {
    systemSignal = "SIGBREAK";
  }

  Deno.addSignalListener(systemSignal as Deno.Signal, () => {
    console.log(`Received ${systemSignal}, exiting...`.toUpperCase());
    Deno.exit(0);
  });
}

// Shutdown the server when the process is about to exit
globalThis.addEventListener("unload", () => {
  const reason = "🦕 Deno is exiting!! ⬇️";
  console.log(reason);
  abortController.abort(reason);
});

const handler: Handler = async (req) => {
  const endpoint = getEndpoint(req.url);
  const serviceEndpoint = getServiceEndpoint(req.url);

  reqLog(req);
  const startTime = Date.now();

  switch (endpoint) {
    // Endpoint for health check
    case "/gateaway/health": {
      const status = 200;

      resLog(req, status);
      return Response.json({ code: status, status: "OK" }, { status });
    }

    case "/gateaway/endpoints": {
      // Endpoint for update endpoints data
      if (req.method === "POST") {
        await EndpointDataMemoryCache.setEndpointsData();
      }

      // Unimplemented Routes
      const status = 501;
      resLog(req, status);
      return Response.json(
        { error: "Unimplemented Route", code: status },
        {
          status,
          statusText: "Not Implemented",
        },
      );
    }

    default: {
      const API_URL = mapEndpoint(serviceEndpoint);
      if (!API_URL) {
        const status = 404;

        resLog(req, status);
        return Response.json({
          error: "Service Not Found or Service is Not Available Right Now",
          code: status,
        }, { status, statusText: "Not Found or Not Available" });
      }

      const resp = await fetch(`${API_URL.BASE_URL}${endpoint}`, req);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log(`Response Time: ${responseTime}ms`);

      resLog(req, resp.status);
      return resp;
    }
  }
};

serve(handler, {
  async onListen({ hostname, port }) {
    await prepareEndpoints("2 * * * *");
    console.log(`API Gateaway Running on ${hostname}:${port}`);
  },

  // deno-lint-ignore no-explicit-any
  onError(err: any) {
    let message: string;
    let status: number;

    if (
      err.message.includes(
        "No connection could be made because the target machine actively refused it.",
      )
    ) {
      message = "Service is Not Available Right Now";
      status = 503;
    } else {
      message = err.message;
      status = 500;
    }

    console.error(message);
    return Response.json({ message }, { status });
  },

  port: +(Deno.env.get("PORT")! || 8080),
  signal: abortController.signal,
});
