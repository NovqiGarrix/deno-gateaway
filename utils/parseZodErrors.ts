import { z } from "../deps.ts";
import { ZodError } from "../types.ts";

const parseZodError = (error: z.ZodError): Array<ZodError> =>
  error.issues.map((error) => ({
    field: `${error.path[0]}`,
    error: error.message,
  }));
export default parseZodError;
