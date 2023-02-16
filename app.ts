import "https://deno.land/x/dotenv@v3.2.0/load.ts";

import { Application, oakCors, Router } from "./deps.ts";

import logger from "./utils/logger.ts";
import gateawayRoutes from "./routes/gateaway.routes.ts";

import rateLimiter from "./middlewares/rateLimiter.middleware.ts";
import forwardMiddleware from "./middlewares/forward.middleware.ts";
import logAndErrorHandler from "./middlewares/logAndErrorHandler.ts";

export default function createServer() {
  const ORIGINS = Deno.env.get("ORIGINS");
  if (!ORIGINS) throw new Error("Missing ORIGINS in env variables");

  const app = new Application();
  const router = new Router();

  app.use(oakCors({
    credentials: true,
    methods: "*",
    origin: JSON.parse(ORIGINS),
    preflightContinue: true,
  }));

  // Rate Limiter Middleware
  app.use(rateLimiter);

  // Logger
  app.use(logAndErrorHandler);

  // This is the main logic of the gateaway
  app.use(forwardMiddleware);

  router.post("/gateway", gateawayRoutes);

  app.use(router.routes());

  app.addEventListener("listen", ({ hostname, port }) => {
    logger.info(
      `Listening on ${hostname}:${port}`
        .toUpperCase(),
    );
  });

  return app;
}
