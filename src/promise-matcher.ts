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

  map<R>(fn: (val: T) => PromiseOption<R> | Option<R>): PromiseMatcher<R> {
    return matchPromise(
      this._value.then(match).then((m) => m.map(fn).toOption()),
    );
  }

  or<R>(fallback: Option<R> | PromiseOption<R>): PromiseMatcher<R> {
    return matchPromise(
      this._value.then(match).then((m) => m.or(fallback).toOption()),
    );
  }

  mapOr<R>(
    mapFn: (value: T) => PromiseOption<R> | Option<R>,
    fallback: R,
  ): PromiseMatcher<R> {
    return this.map(mapFn).or(fallback);
  }

  is(comparand: T): Promise<boolean> {
    return this._value.then((v) => v === comparand);
  }

  unwrapOr(defaultValue: T): Promise<T> {
    return this._value.then(match).then((m) => m.unwrapOr(defaultValue));
  }

  unwrap(): Promise<T> | never {
    return this._value.then((val) => {
      if (isNone(val)) {
        throw new UnsafeOperationError(UNWRAP_ERROR_MSG);
      }

      return val;
    });
  }

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

  toPromise(): PromiseOption<T> {
    return this._value;
  }
}
