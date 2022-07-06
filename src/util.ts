export const UNWRAP_ERROR_MSG = "Called unwrap on nil value";

export type Some<T> = T;
export type None = null | undefined;
export type Option<T> = Some<T> | None;
export type PromiseOption<T> = Promise<Option<T>>;

export interface isSomeArg<T, R> {
  some: (val: T) => R;
}

export interface isNoneArg<R> {
  none: () => R;
}

export interface AllArgs<T, R> extends isSomeArg<T, R>, isNoneArg<R> {}

export class UnsafeOperationError extends Error {
  name = "UnsafeOperationError";

  constructor(msg: string) {
    super(msg);
  }
}

/**
 * Equivalent to nodes `isNullOrUndefined`, asserts whether
 * given value is `null | undefined` or not
 *
 * @param value Value that is possibly null or undefined
 *
 * @example
 * ```
 * import { isNone } from './mod.ts';
 *
 * const a = isNone(null); // true
 * const b = isNone(0); //false
 * ```
 */
export function isNone(value: Option<unknown>): value is None {
  return value === null || value === undefined;
}
