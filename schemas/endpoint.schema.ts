import { z } from "../deps.ts";
import isURL from "../utils/isURL.ts";

export type Endpoint = z.infer<typeof endpointSchema>;
export const endpointSchema = z.object({
  base_url: z.string({ required_error: "base_url is required" }).refine(
    isURL,
    { message: "Invalid URL" },
  ),
  endpoint: z.string({ required_error: "Endpoint is Required!" }).min(1, {
    message: "Endpoint must be at least 1 character long",
  }),
});
