import { Matcher, Maybe, match } from "../mod.ts";
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
