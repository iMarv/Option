# Option

Deno module inspired by Rusts `Option<T>` to help handling `null` and
`undefined` in Typescript.

## How to use

The main idea is to type all values that are either `T | null` or
`T | undefined` into a unified `Option<T>` and to handle either cases with the
help of `match()` and the `Matcher` class.

This allows solid type/null safety in your project without the fear of
`cannot read property name of undefined`.

### Code example

```ts
import { match, Matcher, Option } from "../mod.ts";
import { assert } from "https://deno.land/std@0.83.0/testing/asserts.ts";

// Run this example yourself with `deno run --allow-net examples/fetch-wrapper.ts

async function saveFetch(url: string): Promise<Matcher<string>> {
  const response: Option<string> = await fetch(url).then(
    (res) => res.text(),
    // Catch any error and map it to a none value
  ).catch(() => null);

  // Return a matcher
  return match(response);
}

const ok: Matcher<string> = await saveFetch("https://example.com");
// We got a value
assert(ok.isSome());

// We can map the value to our liking
ok.map((s) => s.length).if({
  some: (val) => {
    console.log("Page size:", val);
    assert(val > 0);
  },
});

// We can also get a mapped value back as a Maybe
console.log("Page Size:", ok.map((s) => s.length).toOption());

// Null values need to be handled manually now though
console.log("Page Size:", ok.map(() => null).toOption());

// Errors do not crash our program but can be handled properly
const notOk: Matcher<string> = await saveFetch("https://example.cpm");
assert(notOk.isNone());

// Safe access to the value is not very comfortable in an if block:
if (notOk.isSome()) {
  // Would prefer not to unwrap, because here we should be able to know
  // that the value is not nil.
  console.log(notOk.unwrap());
  assert(false);
} else {
  console.log("I run if the value is not ok 1");
  assert(true);
}

// You can use .ok() and .nil() as an easy to access alternative:

notOk.if({
  some: (val) => {
    // Value is already unwrapped for us
    console.log(val);
    assert(false);
  },
  none: () => {
    console.log("I run if the value is not ok 2");
    assert(true);
  },
});

// Keeping the matcher inline instead of using Option<T> works aswell
interface UserInfo {
  name: string;
  nickname: Matcher<string>;
}

const user: UserInfo = { name: "John", nickname: match<string>(null) };
console.log("What we send to api:", JSON.stringify(user));
```
