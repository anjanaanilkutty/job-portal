import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/apiError';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Validates and replaces a request part with the parsed/typed result.
 */
export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[part]);
      // query/params getters can be read-only in some setups; assign defensively
      (req as unknown as Record<string, unknown>)[part] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        throw ApiError.badRequest('Validation failed', details);
      }
      throw err;
    }
  };
}
