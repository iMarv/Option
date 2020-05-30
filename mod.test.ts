import { match, isNil, Matcher, Maybe } from "./mod.ts";
import {
  assert,
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.53.0/testing/asserts.ts";

const UNWRAP_ERROR_MSG: string = "Called unwrap on nil value";

Deno.test({
  name: "maybe::isNil::true_for_null",
  fn: () => {
    assert(isNil(null));
  },
});

Deno.test({
  name: "maybe::isNil::true_for_undefined",
  fn: () => {
    assert(isNil(null));
    assert(isNil(undefined));
    assert(!isNil("testi"));
  },
});

Deno.test({
  name: "maybe::isNil::false_for_value",
  fn: () => {
    assert(!isNil("testi"));
    assert(!isNil(2));
    assert(!isNil({}));
    assert(!isNil([]));
  },
});

Deno.test({
  name: "maybe::match::freezes_value",
  fn: () => {
    const val = match("testi");

    assert(Object.isFrozen(val.unwrap()));
  },
});

Deno.test({
  name: "maybe::Matcher::unwrap::return_value",
  fn: () => {
    const original: Maybe<string> = "testi";
    const value: Matcher<string> = match(original);

    assertEquals(value.unwrap(), original);
  },
});

Deno.test({
  name: "maybe::Matcher::unwrap::throw_nil",
  fn: () => {
    const value: Matcher<string> = match(null as unknown as string);

    assertThrows(
      () => {
        value.unwrap();
      },
      Error,
      UNWRAP_ERROR_MSG,
    );
  },
});

Deno.test({
  name: "maybe::Matcher::unwrapOr::return_value",
  fn: () => {
    const original: Maybe<string> = "testi";
    const value: Matcher<string> = match(original);

    assertEquals(value.unwrapOr("testo"), original);
  },
});

Deno.test({
  name: "maybe::Matcher::unwrapOr::return_default_on_nil",
  fn: () => {
    const expected: string = "testo";
    const value: Matcher<string> = match(null as unknown as string);

    assertEquals(value.unwrapOr(expected), expected);
  },
});

Deno.test({
  name: "maybe::Matcher::map::map_with_fn",
  fn: () => {
    const num: Maybe<number> = 1;
    const fn = (n: number): Maybe<string> => `${n}`;

    const mt: Matcher<string> = match(num).map(fn);

    assertEquals(mt.unwrap(), "1");
  },
});

Deno.test({
  name: "maybe::Matcher::map::pass_through_nil",
  fn: () => {
    const num: Maybe<number> = null as unknown as number;
    const fn = (n: number): Maybe<string> => `${n}`;

    const mt: Matcher<string> = match(num).map(fn);

    assertThrows(
      () => {
        mt.unwrap();
      },
      Error,
      UNWRAP_ERROR_MSG,
    );
  },
});

Deno.test({
  name: "maybe::Matcher::map::nil_dont_call_fn",
  fn: () => {
    const num: Maybe<number> = null as unknown as number;
    let called: boolean = false;
    const fn = (n: number): Maybe<string> => {
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
  },
});

Deno.test(
  {
    name: "maybe::Matcher::isOk::true_if_ok",
    fn: () => {
      const mt = match("some");

      assert(mt.isOk());
    },
  },
);

Deno.test(
  {
    name: "maybe::Matcher::isOk::false_if_nil",
    fn: () => {
      const mt = match(null);

      assert(!mt.isOk());
    },
  },
);

Deno.test(
  {
    name: "maybe::Matcher::isNil::true_if_nil",
    fn: () => {
      const mt = match(null);

      assert(mt.isNil());
    },
  },
);

Deno.test(
  {
    name: "maybe::Matcher::isNil::false_if_ok",
    fn: () => {
      const mt = match("some");

      assert(!mt.isNil());
    },
  },
);

Deno.test({
  name: "maybe::Matcher::nil::call_fn_if_nil",
  fn: () => {
    const mt = match(null);
    let called = false;
    const fn = () => called = true;

    mt.nil(fn);

    assert(called);
  },
});

Deno.test({
  name: "maybe::Matcher::nil::dont_call_fn_if_ok",
  fn: () => {
    const mt = match("some");
    let called = false;
    const fn = () => called = true;

    mt.nil(fn);

    assert(!called);
  },
});

Deno.test({
  name: "maybe::Matcher::ok::call_fn_if_ok",
  fn: () => {
    const mt = match("some");
    let called: boolean = false;
    const fn = () => called = true;

    mt.ok(fn);

    assert(called);
  },
});

Deno.test({
  name: "maybe::Matcher::ok::dont_call_chain_nil_if_ok",
  fn: () => {
    const mt = match("some");
    let called: string = "none";
    const fn1 = () => called = "ok";
    const fn2 = () => called = "nil";

    mt.ok(fn1).nil(fn2);

    assertEquals(called, "ok");
  },
});

Deno.test({
  name: "maybe::Matcher::ok::dont_call_fn_if_nil",
  fn: () => {
    const mt = match(null);
    let called: boolean = false;
    const fn = () => called = true;

    mt.ok(fn);

    assert(!called);
  },
});
