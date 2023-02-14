import { Endpoint } from "../types.ts";
import { endpointSchema } from "../schemas/endpoint.schema.ts";

export default function checkEndpointData(
  endpointData: Endpoint,
) {
  const validationStatus = endpointSchema.safeParse(endpointData);

  if (!validationStatus.success) {
    // Handle error
  }

  return validationStatus.success;
}
