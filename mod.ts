const UNWRAP_ERROR_MSG: string = "Called unwrap on nil value";

export type Maybe<T> = null | undefined | T;

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
export function isNil(value: Maybe<unknown>): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Utility/ease of use function to create a matcher and chain
 * maps to it
 *
 * @param maybe Value that is possibly null or undefined
 */
export function match<T>(maybe: Maybe<T>): Matcher<T> {
  return new Matcher(Object.freeze(maybe));
}

class NilMatcher<T> {
  constructor(protected _value: Readonly<Maybe<T>>) {}

  /**
   * Checks if value of Matcher is Nil and runs given callback
   * if it is.
   *
   * @param fn Callback to run if Matcher value is nil
   */
  nil(fn: () => void): void {
    if (isNil(this._value)) {
      fn();
    }
  }
}

export class Matcher<T> extends NilMatcher<T> {
  /**
   * Checks if value of Matcher is Nil and rusn given callback
   * if it is not nil
   * @param fn Callback to run if Matcher value is not nil
   */
  ok(fn: (val: Readonly<T>) => void): NilMatcher<T> {
    if (!isNil(this._value)) {
      fn(this._value);
    }

    return new NilMatcher(this._value);
  }

  /**
   * Returns true if Matcher value is not nil
   */
  isOk(): boolean {
    return !isNil(this._value);
  }

  /**
   * Returns true if Matcher value is nil
   */
  isNil(): boolean {
    return isNil(this._value);
  }

  /**
   * Changes value in matcher to given value if matcher value
   * is nil
   *
   * @param fallback Fallback value if inner value is nil
   */
  or<R>(fallback: Maybe<R>): Matcher<R> {
    if (isNil(this._value)) {
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
  map<R>(fn: (val: Readonly<T>) => Maybe<R>): Matcher<R> {
    if (isNil(this._value)) {
      return match<R>(null);
    }

    return match<R>(fn(this._value));
  }

  mapOr<R>(mapFn: (value: T) => Maybe<R>, fallback: R): Matcher<R> {
    return this.map(mapFn).or(fallback);
  }

  is(comparand: T): boolean {
    return comparand === this._value;
  }

  asMaybe(): Maybe<Readonly<T>> {
    return this._value;
  }

  /**
   * Tries to get value out of matcher. If value is nil, will
   * fall back to given default value
   *
   * @param defaultValue Value to return if Matcher value is nil
   */
  unwrapOr(defaultValue: T): Readonly<T> {
    if (isNil(this._value)) {
      return Object.freeze(defaultValue);
    }

    return this._value;
  }

  /**
   * Tries to get value out of matcher. Will throw error if
   * value is nil.
   * This is not considered safe, you should consider using `.ok()` to work with
   * the value
   */
  unwrap(): Readonly<T> | never {
    if (isNil(this._value)) {
      throw new UnsafeOperationError(UNWRAP_ERROR_MSG);
    }

    return this._value;
  }

  expect(msg: string): Readonly<T> | never {
    if (isNil(this._value)) {
      throw new UnsafeOperationError(msg);
    }

    return this._value;
  }

  toPromise(): Promise<T> {
    if (isNil(this._value)) {
      return Promise.reject(UNWRAP_ERROR_MSG);
    }
    return Promise.resolve(this._value);
  }

  toJSON() {
    return this.asMaybe();
  }

  toString() {
    return (this._value ?? "null").toString();
  }
}
