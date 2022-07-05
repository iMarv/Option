import { isNone, match, Matcher, matchPromise, Option } from "./mod.ts";
import {
  assert,
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.147.0/testing/asserts.ts";

const UNWRAP_ERROR_MSG = "Called unwrap on nil value";

Deno.test("isNone :: returns true for null and undefined", () => {
  const a = isNone(null);
  const b = isNone(undefined);

  assert(a);
  assert(b);
});

Deno.test("isNone :: returns false for 'empty' values", () => {
  const a = isNone("");
  const b = isNone(0);
  const c = isNone([]);
  const d = isNone({});

  assert(!a);
  assert(!b);
  assert(!c);
  assert(!d);
});

Deno.test("Matcher.toOption :: returns value inside matcher", () => {
  const original: Option<string> = "testi";
  const value: Matcher<string> = match(original);

  assertEquals(value.toOption(), original);
});

Deno.test("Matcher.unwrap() :: returns value if it is some", () => {
  const original: Option<string> = "testi";
  const value: Matcher<string> = match(original);

  assertEquals(value.unwrap(), original);
});

Deno.test("Matcher.unwrap() :: throws if value is none", () => {
  const value: Matcher<string> = match(null as unknown as string);

  assertThrows(
    () => {
      value.unwrap();
    },
    Error,
    UNWRAP_ERROR_MSG,
  );
});

Deno.test("Matcher.unwrapOr() :: returns value if it is some", () => {
  const original: Option<string> = "testi";
  const value: Matcher<string> = match(original);

  assertEquals(value.unwrapOr("testo"), original);
});

Deno.test("Matcher.unwrapOr() :: returns default value if value is none", () => {
  const expected = "testo";
  const value: Matcher<string> = match(null as unknown as string);

  assertEquals(value.unwrapOr(expected), expected);
});

Deno.test("Matcher.map() :: calls given function on value", () => {
  const num: Option<number> = 1;
  const fn = (n: number): Option<string> => `${n}`;

  const mt: Matcher<string> = match(num).map(fn);

  assertEquals(mt.unwrap(), "1");
});

Deno.test("Matcher.map() :: does not call map function if value is none", () => {
  const num: Option<number> = null as unknown as number;
  let called = false;
  const fn = (n: number): Option<string> => {
    called = true;
    return `${n}`;
  };

  const mt: Matcher<string> = match(num).map(fn);

  assertThrows(
    () => {
      mt.unwrap();
    },
    Error,
    UNWRAP_ERROR_MSG,
  );
  assert(!called);
});

Deno.test("Matcher.isSome() :: returns true if value is some", () => {
  const mt = match("some");

  assert(mt.isSome());
});

Deno.test("Matcher.isSome() :: returns false if value is none", () => {
  const mt = match(null);

  assert(!mt.isSome());
});

Deno.test("Matcher.isNone() :: returns true if value is none", () => {
  const mt = match(null);

  assert(mt.isNone());
});

Deno.test("Matcher.isNone() :: returns false if value is some", () => {
  const mt = match("some");

  assert(!mt.isNone());
});

Deno.test("Matcher.or() :: does not change value if it is some", () => {
  const original = "testi";
  const mt = match(original).or("testo");

  assertEquals(mt.unwrap(), original);
});

Deno.test("Matcher.or() :: returns fallback value if value is none", () => {
  const original = null;
  const mt = match(original).or("testo");

  assertEquals(mt.unwrap(), "testo");
});

Deno.test("Matcher.mapOr() :: returns value if it is some", () => {
  const original = "testi";
  const mt = match(original).mapOr((o) => o, "testo");

  assertEquals(mt.unwrap(), original);
});

Deno.test("Matcher.mapOr() :: updates value if map returns none", () => {
  const original = "testi";
  const mt = match(original).mapOr((_) => null, "testo");

  assertEquals(mt.unwrap(), "testo");
});

Deno.test("Matcher.toString() :: returns `null` string if none", () => {
  const res = match(undefined).toString();
  assertEquals(res, "null");
});

Deno.test("Matcher.toString() :: returns string representation of value if it is some", () => {
  const res = match({ a: 1 }).toString();
  assertEquals(res, { a: 1 }.toString());
});

Deno.test("Matcher.toJSON() :: pulls out inner value when converting to JSON", () => {
  const actual = JSON.stringify({ a: match(2) });
  const expected = JSON.stringify({ a: 2 });

  assertEquals(actual, expected);
});

Deno.test("Matcher.toJSON() :: pulls out none value when converting to JSON", () => {
  const actual = JSON.stringify({ a: match(null) });
  const expected = JSON.stringify({ a: null });

  assertEquals(actual, expected);
});

Deno.test("Matcher.if() :: calls some-callback if value is some", () => {
  const val = match("testi").if(
    { some: (v) => `${v}1`, none: () => "testi2" },
  );
  assertEquals(val, "testi1");
});

Deno.test("Matcher.if() :: returns null if value is some but no callback is provided", () => {
  const val = match("testi").if({ none: () => "testi1" });
  assertEquals(val, null);
});

Deno.test("Matcher.if() :: calls none-callback if value is none", () => {
  const val = match(null).if(
    { some: (_) => "testi2", none: () => "testi1" },
  );
  assertEquals(val, "testi1");
});

Deno.test("Matcher.if() :: returns null if value is none but no callback is provided", () => {
  const val = match(undefined).if({ some: (_) => "testi1" });
  assertEquals(val, null);
});

Deno.test("Matcher.if() :: throws if no handlers are provided", () => {
  assertThrows(() => {
    // @ts-expect-error: Mocking for testing
    match(null).if({});
  });
});

Deno.test("Matcher.is() :: returns true if value is equal to given value", () => {
  assert(match(2).is(2));
});

Deno.test("Matcher.is() :: returns false if value is not equal to given value", () => {
  assert(!match(2).is(3));
});

Deno.test("Matcher.is() :: returns false if value is none", () => {
  assert(!match<number>(null).is(3));
});

Deno.test("Matcher.expect() :: returns value if some", () => {
  const actual = match(2).expect("This is fine");
  const expected = 2;

  assertEquals(actual, expected);
});

Deno.test("Matcher.expect() :: throws if none", () => {
  assertThrows(() => {
    match(null).expect("This is fine");
  });
});

Deno.test("PromiseMatcher.map() :: maps value if it is some", async () => {
  const a = await matchPromise(2).map((v) => v + 1).extract();

  assertEquals(a, 3);
});

Deno.test("PromiseMatcher.map() :: does not map value if it is none", async () => {
  const a = await matchPromise(null as Option<number>).map((v) => v + 1)
    .extract();

  assertEquals(a, null);
});
