// deno-lint-ignore-file no-explicit-any

import { Context, red, Status } from "../deps.ts";
import logger from "../utils/logger.ts";

export default async function logAndErrorHandler(
  { request, response }: Context<Record<string, any>, Record<string, any>>,
  next: () => Promise<unknown>,
) {
  const startTime = Date.now();

  try {
    if (request.url.pathname === "/favicon.ico") {
      return await next();
    }

    logger.info(
      `[METHOD]: "${request.method}" [ENDPOINT]: "${request.originalRequest.url}"`,
    );
    await next();

    const endTime = Date.now();
    const took = endTime - startTime;

    logger.success(
      `[TOOK]: ${took}ms [METHOD]: "${request.method}" [CODE]: "${response.status}" [ENDPOINT]: "${request.originalRequest.url}"`,
    );
  } catch (error) {
    let message: string = error.message;
    response.status = error.status || Status.InternalServerError;

    const endTime = Date.now();
    const took = endTime - startTime;
    logger.info(
      red(
        `[TOOK]: ${took}ms [METHOD]: "${request.method}" [STATUS]: "${response.status}" [ENDPOINT]: "${request.originalRequest.url}"`,
      ),
    );

    if (
      message.includes(
        "No connection could be made because the target machine actively refused it.",
      )
    ) {
      message = "Service is Not Available Right Now";
      response.status = Status.ServiceUnavailable;
    } else {
      message = error.message;
      response.status = Status.InternalServerError;
    }

    console.log(error);

    if (response.status >= Status.InternalServerError) {
      logger.error(`Catched 5xx Error: ${JSON.stringify(error)}`);
      response.body = {
        error: "An error occurred while doing your request!",
        code: response.status,
      };
      return;
    }

    response.body = {
      errors: [{
        error: message,
      }],
      code: response.status,
    };
  }
}
