// deno-lint-ignore-file no-explicit-any
import { ZodError } from "../types.ts";

class ServiceExeption extends Error {
  constructor(
    public errors: Array<ZodError>,
    public cause?: any,
  ) {
    super(undefined, { cause });
  }
}

export default ServiceExeption;
