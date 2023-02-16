import { getQuery, Router, Status } from "../deps.ts";

import {
  addService,
  deleteService,
  getService,
} from "../controllers/gateway.controller.ts";
import sleep from "../utils/sleep.ts";

const router = new Router();

router.get("/healthcheck", ({ response }) => {
  response.status = Status.OK;
  response.body = {
    code: Status.OK,
    data: "OK",
  };
});

router.get("/services", getService);

router.post("/services", addService);

router.delete("/services", deleteService);

router.get("/rate_test", async (ctx) => {
  const { sleep: sleepInQuery } = getQuery(ctx);

  const sleepTime = Number(sleepInQuery || 0);

  await sleep(sleepTime);

  ctx.response.status = Status.OK;
  ctx.response.body = {
    code: Status.OK,
    status: "OK",
  };
});

export default router.routes();
