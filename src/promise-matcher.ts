import {
  AllArgs,
  isNone,
  isNoneArg,
  isSomeArg,
  Option,
  PromiseOption,
  UnsafeOperationError,
  UNWRAP_ERROR_MSG,
} from "./util.ts";
import { match, matchPromise } from "./match.ts";

function isPromise<T>(val: unknown | Promise<T>): val is Promise<T> {
  return val instanceof Promise;
}

export class PromiseMatcher<T> {
  protected _value: PromiseOption<T>;

  constructor(value: PromiseOption<T> | Option<T>) {
    if (isPromise(value)) {
      this._value = value;
    } else {
      this._value = Promise.resolve(value);
    }
  }

  /**
   * Checks if Matcher value is not nil and applies given map
   * function to it.
   * Will return a matcher with nil-value and not apply map if
   * current value is nil
   *
   * @param fn Function to use to map value
   */
  map<R>(fn: (val: T) => PromiseOption<R> | Option<R>): PromiseMatcher<R> {
    return matchPromise(
      this._value.then(match).then((m) => m.map(fn).toOption()),
    );
  }

  /**
   * Changes value in matcher to given value if matcher value
   * is nil
   *
   * @param fallback Fallback value if inner value is nil
   */
  or<R>(fallback: Option<R> | PromiseOption<R>): PromiseMatcher<R> {
    return matchPromise(
      this._value.then(match).then((m) => m.or(fallback).toOption()),
    );
  }

  /**
   * Applies map function to inner value or applies fallback value if inner
   * value is nil
   *
   * @param mapFn
   * @param fallback
   */
  mapOr<R>(
    mapFn: (value: T) => PromiseOption<R> | Option<R>,
    fallback: R,
  ): PromiseMatcher<R> {
    return this.map(mapFn).or(fallback);
  }

  /**
   * Returns boolean promise whether the value inside matches the comparand or not
   * @param comparand
   */
  is(comparand: T): Promise<boolean> {
    return this._value.then((v) => v === comparand);
  }

  /**
   * Returns inner promise, but inserts fallback if value is none
   * @param defaultValue
   */
  unwrapOr(defaultValue: T): Promise<T> {
    return this._value.then(match).then((m) => m.unwrapOr(defaultValue));
  }

  /**
   * Returns inner promise, but throws if value is none
   */
  unwrap(): Promise<T> | never {
    return this._value.then((val) => {
      if (isNone(val)) {
        throw new UnsafeOperationError(UNWRAP_ERROR_MSG);
      }

      return val;
    });
  }

  /**
   * Allows to resolve inner value with given callbacks
   *
   * @param opts Options to resolve value
   *
   * @example
   * ```
   * import { matchPromise } from './match-promise.ts';
   * import { Option } from './util.ts';
   *
   * const n: Option<number> = null as Option<number>;
   *
   * const m1: Option<number> = await matchPromise(0).if({ some: a => a + 2 }); // 2
   * const m2: Option<number> = await matchPromise(0).if({ none: () => 2 }); // null
   *
   * const m3: Option<number> = await matchPromise(n).if({ some: a => a + 2 }); // null
   * const m4: Option<number> = await matchPromise(n).if({ none: () => 2 }); // 2
   *
   * const m5: number = await matchPromise(0).if({ some: a => a + 2, none: () => 5 }); // 2
   * const m6: number = await matchPromise(n).if({ some: a => a + 2, none: () => 5 }); // 5
   * ```
   */
  if<R>(opts: AllArgs<T, R>): Promise<R>;
  if<R>(opts: isNoneArg<R>): PromiseOption<R>;
  if<R>(opts: isSomeArg<T, R>): PromiseOption<R>;
  if<R>(opts: Partial<AllArgs<T, R>>): unknown {
    // @ts-expect-error: Hard to type
    return this._value.then(match).then((m) => m.if(opts));
  }

  /**
   * Maps a rejected promise to a none value in a resolved promise.
   * Allows logging the error (or similar) with a given fn
   *
   * @example
   * ```ts
   * import { matchPromise } from './match-promise.ts';
   *
   * const m = await matchPromise(Promise.reject(new Error("error")))
   *   .clearReject()
   *   .toPromise()
   *   .then(() => 1)
   *   .catch(() => 2); // returns 1
   *
   * ```
   * @param sideEffect
   */
  clearReject(
    sideEffect?: (error: unknown) => void | Promise<void>,
  ): PromiseMatcher<T> {
    return matchPromise(this._value.catch((err) => {
      if (sideEffect) {
        const sResult = sideEffect(err);

        if (isPromise(sResult)) {
          return sResult.then(() => null);
        }
      }

      return null;
    }));
  }

  /**
   * Returns the inner promise
   */
  toPromise(): PromiseOption<T> {
    return this._value;
  }
}
