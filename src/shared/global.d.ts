import type { Request } from 'express';

declare global {
  export type ConstValue<T> = T extends Record<string | number | symbol, infer U> ? U : never;

  export type IRequest = Request;
}

export {};
