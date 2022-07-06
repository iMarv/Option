import { Option, PromiseOption } from "./util.ts";
import { Matcher } from "./matcher.ts";
import { PromiseMatcher } from "./promise-matcher.ts";

export function matchPromise<T>(
  maybe: PromiseOption<T> | Option<T>,
): PromiseMatcher<T> {
  return new PromiseMatcher<T>(maybe);
}

export function match<T>(maybe: Option<T>): Matcher<T> {
  return new Matcher(maybe);
}
