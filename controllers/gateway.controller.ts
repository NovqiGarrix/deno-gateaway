import { getQuery, Status } from "../deps.ts";
import { OakContext } from "../types.ts";

import serviceManager from "../utils/serviceManager.ts";
import ServiceExeption from "../exeptions/service.exeption.ts";

export const addService = async (ctx: OakContext<"/services">) => {
  const { response: res, request: req } = ctx;

  const { type, value } = req.body();

  ctx.assert(
    type === "json",
    Status.BadRequest,
    "Request body should be type of JSON",
  );

  try {
    serviceManager.set(await value);

    res.status = Status.Created;
    res.body = {
      code: Status.Created,
      status: "Created",
    };
  } catch (error) {
    if (error instanceof ServiceExeption) {
      res.status = Status.BadRequest;
      res.body = {
        code: Status.BadRequest,
        status: "Bad Request",
        errors: error.errors,
      };
      return;
    }

    throw error;
  }
};

export const deleteService = (ctx: OakContext<"/services">) => {
  const { response: res } = ctx;

  const { endpoint } = getQuery(ctx);

  ctx.assert(
    endpoint && typeof endpoint === "string",
    Status.BadRequest,
    `Missing required parameter 'endpoint' from query parameter`,
  );

  if (!serviceManager.get(endpoint)) {
    res.status = Status.NotFound;
    res.body = {
      code: Status.NotFound,
      status: "Not Found",
      errors: [
        {
          error: "Service not found",
        },
      ],
    };
    return;
  }

  serviceManager.del(endpoint);

  res.status = Status.OK;
  res.body = {
    code: Status.OK,
    status: "OK",
  };
};

export const getService = (ctx: OakContext<"/services">) => {
  const { response: res } = ctx;

  const { endpoint } = getQuery(ctx);

  ctx.assert(
    endpoint && typeof endpoint === "string",
    Status.BadRequest,
    `Missing required parameter 'endpoint' from query parameter`,
  );

  const service = serviceManager.get(endpoint);

  let status: string;

  if (service) {
    res.status = Status.OK;
    status = "OK";
  } else {
    res.status = Status.NotFound;
    status = "Not Found";
  }

  res.body = {
    code: res.status,
    status,
    data: service,
  };
};
