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
import { match } from "./matcher.ts";

function isPromise<T>(val: unknown | Promise<T>): val is Promise<T> {
  return val instanceof Promise;
}

export function matchPromise<T>(
  maybe: PromiseOption<T> | Option<T>,
): PromiseMatcher<T> {
  return new PromiseMatcher<T>(maybe);
}

class PromiseMatcher<T> {
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

  or<R>(fallback: Option<R>): PromiseMatcher<R> {
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

  toPromise(): PromiseOption<T> {
    return this._value;
  }
}
