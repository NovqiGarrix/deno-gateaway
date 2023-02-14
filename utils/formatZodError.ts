import { z } from "../deps.ts";

interface FormError {
  field: string;
  message: string;
}

const parseZodError = (error: z.ZodError): Array<FormError> =>
  error.issues.map((error) => ({
    field: `${error.path[0]}`,
    message: error.message,
  }));
export default parseZodError;
