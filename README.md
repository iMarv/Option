# Maybe

Deno module inspired by Rusts `Option<T>` to help handling `null` and `undefined` in Typescript.

## How to use

The main idea is to type all values that are either `T | null` or `T | undefined` into a unified `Maybe<T>` and to handle either cases with the help of `match()` and the `Matcher` class.

This allows solid type/null safety in your project without the fear of `cannot read property name of undefined`.

### Code example

```ts
import { Matcher, Maybe, match } from "https://deno.land/x/maybe/mod.ts";
import {
  assert,
} from "https://deno.land/std@0.53.0/testing/asserts.ts";

// Run this example yourself with `deno run --allow-net examples/fetch-wrapper.ts

async function saveFetch(url: string): Promise<Matcher<string>> {
  const response: Maybe<string> = await fetch(url).then(
    (res) => res.text(),
    // Catch any error and map it to a nil value
  ).catch(() => null);

  // Return a matcher
  return match(response);
}

const ok: Matcher<string> = await saveFetch("https://example.com");
// We got a value
assert(ok.isOk());

// We can map the value to our liking
ok.map((s) => s.length).ok((val) => {
  console.log("Page size:", val);
  assert(val > 0);
});

// Errors do not crash our program but can be handled properly
const notOk: Matcher<string> = await saveFetch("https://example.cpm");
assert(notOk.isNil());

// Safe access to the value is not very comfortable in an if block:
if (notOk.isOk()) {
  // Would prefer not to unwrap, because here we should be able to know
  // that the value is not nil.
  console.log(notOk.unwrap());
  assert(false);
} else {
  console.log("I run if the value is not ok 1");
  assert(true);
}

// You can use .ok() and .nil() as an easy to access alternative:

notOk.ok((val) => {
  // Value is already unwrapped for us
  console.log(val);
  assert(false);
}).nil(() => {
  console.log("I run if the value is not ok 2");
  assert(true);
});

```
