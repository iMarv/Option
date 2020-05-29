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

// It is save to work with the values even if we do not know if
// they are nil

notOk.map((s) => s.length).ok((val) => {
  console.log("I will not be evaluated");
  assert(false);
}).nil(() => {
  // Runs if value does not exist
  console.log("Value is nil");
  assert(true);
});

```
