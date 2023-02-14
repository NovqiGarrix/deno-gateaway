import "https://deno.land/x/dotenv@v3.2.0/load.ts";

import { Application, oakCors, Router } from "./deps.ts";

import gateawayRoutes from "./routes/gateaway.routes.ts";
import prepareEndpoints from "./helpers/prepareEndpoints.ts";
import logAndErrorHandler from "./middlewares/logAndErrorHandler.ts";

import logger from "./utils/logger.ts";
import forwardMiddleware from "./middlewares/forward.middleware.ts";
import rateLimiterMiddleware from "./middlewares/rateLimiter.middleware.ts";

export default async function createServer() {
  const CORS_ORIGIN = Deno.env.get("CORS_ORIGIN")!;

  const app = new Application();
  const router = new Router();

  app.use(oakCors({
    credentials: true,
    methods: "*",
    origin: [CORS_ORIGIN],
    preflightContinue: true,
  }));

  // Rate Limiter Middleware
  app.use(rateLimiterMiddleware);

  // Logger
  app.use(logAndErrorHandler);

  // This is the main logic of the gateaway
  app.use(forwardMiddleware);

  router.post("/gateaway", gateawayRoutes);

  app.use(router.routes());

  logger.info(`🦕 PREPARING ENDPOINTS DATA... 🔥`);
  await prepareEndpoints("2 * * * *");

  app.addEventListener("listen", ({ hostname, port, serverType }) => {
    logger.info(
      `Listening on ${hostname}:${port} with ${serverType} SERVER`
        .toUpperCase(),
    );
  });

  return app;
}
