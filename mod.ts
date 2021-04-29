const UNWRAP_ERROR_MSG: string = "Called unwrap on nil value";

export type Some<T> = T;
export type None = null | undefined;
export type Option<T> = Some<T> | None;

export class UnsafeOperationError extends Error {
  name: string = "UnsafeOperationError";

  constructor(msg: string) {
    super(msg);
  }
}

/**
 * Equivalent to nodes `isNullOrUndefined`, asserts whether
 * given value is `null | undefined` or not
 *
 * @param value Value that is possibly null or undefined
 */
export function isNone(value: Option<unknown>): value is None {
  return value === null || value === undefined;
}

/**
 * Utility/ease of use function to create a matcher and chain
 * maps to it
 *
 * @param maybe Value that is possibly null or undefined
 */
export function match<T>(maybe: Option<T>): Matcher<T> {
  return new Matcher(maybe);
}

interface isSomeArg<T, R> {
  some: (val: T) => R;
}

interface isNoneArg<R> {
  none: () => R;
}

interface AllArgs<T, R> extends isSomeArg<T, R>, isNoneArg<R> {}

export class Matcher<T> {
  constructor(protected _value: Readonly<Option<T>>) {}

  if<R>(opts: AllArgs<T, R>): Some<R>;
  if<R>(opts: isNoneArg<R>): Option<R>;
  if<R>(opts: isSomeArg<T, R>): Option<R>;
  if<R>(opts: Partial<AllArgs<T, R>>): unknown {
    const hasSomeArg = !isNone(opts.some);
    const hasNoneArg = !isNone(opts.none);

    if (!isNone(this._value) && hasSomeArg) {
      return opts.some!(this._value);
    } else if (isNone(this._value) && hasNoneArg) {
      return opts.none!();
    } else if (!hasSomeArg && !hasNoneArg) {
      throw new UnsafeOperationError("Did not provide any handlers for `if`");
    }

    return null;
  }

  /**
   * Returns true if Matcher value is not nil
   */
  isSome(): boolean {
    return !isNone(this._value);
  }

  /**
   * Returns true if Matcher value is nil
   */
  isNone(): boolean {
    return isNone(this._value);
  }

  /**
   * Changes value in matcher to given value if matcher value
   * is nil
   *
   * @param fallback Fallback value if inner value is nil
   */
  or<R>(fallback: Option<R>): Matcher<R> {
    if (isNone(this._value)) {
      return new Matcher(fallback);
    } else {
      return new Matcher(this._value as unknown as R);
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
  map<R>(fn: (val: Readonly<T>) => Option<R>): Matcher<R> {
    if (isNone(this._value)) {
      return match<R>(null);
    }

    return match<R>(fn(this._value));
  }

  mapOr<R>(mapFn: (value: T) => Option<R>, fallback: R): Matcher<R> {
    return this.map(mapFn).or(fallback);
  }

  is(comparand: T): boolean {
    return comparand === this._value;
  }

  /**
   * Tries to get value out of matcher. If value is nil, will
   * fall back to given default value
   *
   * @param defaultValue Value to return if Matcher value is nil
   */
  unwrapOr(defaultValue: T): Some<Readonly<T>> {
    if (isNone(this._value)) {
      return defaultValue;
    }

    return this._value;
  }

  /**
   * Tries to get value out of matcher. Will throw error if
   * value is nil.
   * This is not considered safe, you should consider using `.ok()` to work with
   * the value
   */
  unwrap(): Some<Readonly<T>> | never {
    if (isNone(this._value)) {
      throw new UnsafeOperationError(UNWRAP_ERROR_MSG);
    }

    return this._value;
  }

  expect(msg: string): Some<Readonly<T>> | never {
    if (isNone(this._value)) {
      throw new UnsafeOperationError(msg);
    }

    return this._value;
  }

  toOption(): Option<T> {
    return this._value;
  }

  toPromise(): Promise<T> {
    if (isNone(this._value)) {
      return Promise.reject(UNWRAP_ERROR_MSG);
    }
    return Promise.resolve(this._value);
  }

  toJSON() {
    return this.toOption();
  }

  toString() {
    return (this._value ?? "null").toString();
  }
}
