const UNWRAP_ERROR_MSG: string = "Called unwrap on nil value";

export type Maybe<T> = null | undefined | T;
type NoMaybe<T> = Exclude<T, null | undefined>;
type EnforceMaybe<T> = null | undefined extends T ? T : never;

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
export function match<T extends Maybe<{}>>(
  maybe: EnforceMaybe<T>,
): Matcher<NoMaybe<T>> {
  return new Matcher<NoMaybe<T>>(Object.freeze(maybe as Maybe<NoMaybe<T>>));
}

class NilMatcher<T> {
  constructor(protected readonly _value: Readonly<Maybe<T>>) {}

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
   * Checks if Matcher value is not nil and applies given map
   * function to it.
   * Map function has to return a matcher
   *
   * @param fn Function to use to map value
   */
  andThen<U extends NoMaybe<{}>>(
    fn: (val: Readonly<T>) => Matcher<U>,
  ): Matcher<U> {
    if (isNil(this._value)) {
      return new Matcher<U>(null);
    }

    return fn(this._value);
  }

  /**
   * Checks if Matcher value is not nil and applies given map
   * function to it.
   * Will return a matcher with nil-value and not apply map if
   * current value is nil
   *
   * @param fn Function to use to map value
   */
  map<U>(fn: (val: Readonly<T>) => Maybe<U>): Matcher<U> {
    if (isNil(this._value)) {
      return new Matcher<U>(null);
    }

    return new Matcher<U>(fn(this._value));
  }

  /**
   * Returns value as Maybe
   */
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
      throw new Error(UNWRAP_ERROR_MSG);
    }

    return this._value;
  }
}
