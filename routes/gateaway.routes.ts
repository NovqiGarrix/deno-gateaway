import { Router, Status } from "../deps.ts";
import { EndpointDataMemoryCache } from "../utils/endpointDataMemoryCache.ts";
import logger from "../utils/logger.ts";

const router = new Router();

router.get("/healthcheck", ({ response }) => {
  response.status = Status.OK;
  response.body = {
    code: Status.OK,
    data: "OK",
  };
});

router.post("/endpoints", async (ctx) => {
  const { response } = ctx;

  try {
    const endpointsData = await EndpointDataMemoryCache
      .getEndpointsData();
    await EndpointDataMemoryCache.setEndpointsData(endpointsData);

    response.status = Status.OK;
    response.body = {
      code: Status.OK,
      data: endpointsData,
    };
  } catch (err) {
    logger.error(`Err In: /gateaway/endpoints POST: ${err}`);

    response.status = Status.InternalServerError;
    response.body = {
      code: Status.InternalServerError,
      error: "Error updating endpoints data",
    };
  }
});

export default router.routes();
