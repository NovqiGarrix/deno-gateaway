import { Router, Status } from "../deps.ts";

import {
  addService,
  deleteService,
  getService,
} from "../controllers/gateway.controller.ts";

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

export default router.routes();
