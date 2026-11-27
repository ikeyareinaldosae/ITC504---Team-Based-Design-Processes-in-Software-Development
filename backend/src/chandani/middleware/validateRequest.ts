// Runs validators before a controller. Owner: Chandani Gupta.
// Each validator reads the raw request and returns clean values (or throws a 400 ApiError).
// The clean values are stored in res.locals.input so controllers never read raw input.
import type { Request, RequestHandler } from "express";

export type Validator<T> = (req: Request) => T;

export function validateRequest<T>(validator: Validator<T>): RequestHandler {
  return (req, res, next) => {
    res.locals.input = validator(req);
    next();
  };
}
