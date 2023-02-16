import { z } from "../deps.ts";
import isURL from "../utils/isURL.ts";

export const invalidBaseUrl = "Invalid BASE URL";

export const emptyEndpointError = "Endpoint can't be an empty string";

export const slashEndpointError =
  "Endpoint can't be only '/'. You should provided the domain business name!";

export const urlEndpointError = "Endpoint can't be a URL";

export type Service = z.infer<typeof serviceSchema>;
export const serviceSchema = z.object({
  base_url: z.string({ required_error: "base_url is required" })
    .refine((base_url) => isURL(base_url), { message: invalidBaseUrl }),
  endpoint: z.string({ required_error: "Endpoint is Required!" })
    .refine((endpoint) => endpoint.length > 0, {
      message: emptyEndpointError,
    })
    .refine((endpoint) => endpoint !== "/", {
      message: slashEndpointError,
    })
    .refine((endpoint) => !isURL(endpoint), {
      message: urlEndpointError,
    }),
});
