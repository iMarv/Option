import {
  assert,
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.147.0/testing/asserts.ts";
import { Option, UNWRAP_ERROR_MSG } from "./util.ts";
import { matchPromise } from "./match.ts";

Deno.test("PromiseMatcher.map() :: maps value if it is some", async () => {
  const a = await matchPromise(2).map((v) => v + 1).toPromise();

  assertEquals(a, 3);
});

Deno.test("PromiseMatcher.map() :: maps value if it is some and function returns promise", async () => {
  const a = await matchPromise(2).map((v) => Promise.resolve(v + 1))
    .toPromise();

  assertEquals(a, 3);
});

Deno.test("PromiseMatcher.map() :: does not map value if it is none", async () => {
  const a = await matchPromise(null as Option<number>).map((v) => v + 1)
    .toPromise();

  assertEquals(a, null);
});

Deno.test("PromiseMatcher.or() :: keeps value if it is some", async () => {
  const a = await matchPromise(2).or(3).toPromise();

  assertEquals(a, 2);
});

Deno.test("PromiseMatcher.or() :: returns fallback value if value is none", async () => {
  const a = await matchPromise(null as Option<number>).or(3).toPromise();

  assertEquals(a, 3);
});

Deno.test("PromiseMatcher.or() :: returns fallback promise if value is none", async () => {
  const a = await matchPromise(null as Option<number>).or(Promise.resolve(3))
    .toPromise();

  assertEquals(a, 3);
});

Deno.test("PromiseMatcher.mapOr() :: maps given value if it is some", async () => {
  const a = await matchPromise(2).mapOr((v) => v + 2, 3).toPromise();

  assertEquals(a, 4);
});

Deno.test("PromiseMatcher.mapOr() :: returns fallback if value is none", async () => {
  const a = await matchPromise(null as Option<number>).mapOr((v) => v + 2, 3)
    .toPromise();

  assertEquals(a, 3);
});

Deno.test("PromiseMatcher.is() :: returns true if value is the same as given one", async () => {
  const a = await matchPromise(2).is(2);

  assert(a);
});

Deno.test("PromiseMatcher.is() :: returns false if value is different to given one", async () => {
  const a = await matchPromise(3).is(2);

  assert(!a);
});

Deno.test("PromiseMatcher.unwrap() :: returns value if it is some", async () => {
  const a = await matchPromise(3).unwrap();

  assertEquals(a, 3);
});

Deno.test("PromiseMatcher.unwrap() :: rejects if value is none", async () => {
  const value = matchPromise(null as Option<number>);

  await assertRejects(
    () => {
      return value.unwrap();
    },
    Error,
    UNWRAP_ERROR_MSG,
  );
});

Deno.test("PromiseMatcher.unwrapOr() :: returns value if it is some", async () => {
  const a = await matchPromise(3).unwrapOr(4);

  assertEquals(a, 3);
});

Deno.test("PromiseMatcher.unwrapOr() :: returns fallback if value is none", async () => {
  const a = await matchPromise(null as Option<number>).unwrapOr(4);

  assertEquals(a, 4);
});

Deno.test("PromiseMatcher.if() :: calls some-callback if value is some", async () => {
  const val = await matchPromise("testi").if(
    { some: (v) => `${v}1`, none: () => "testi2" },
  );
  assertEquals(val, "testi1");
});

Deno.test("PromiseMatcher.if() :: returns null if value is some but no callback is provided", async () => {
  const val = await matchPromise("testi").if({ none: () => "testi1" });

  assertEquals(val, null);
});

Deno.test("PromiseMatcher.if() :: calls none-callback if value is none", async () => {
  const val = await matchPromise(null as Option<string>).if(
    { some: (_) => "testi2", none: () => "testi1" },
  );

  assertEquals(val, "testi1");
});

Deno.test("PromiseMatcher.if() :: returns null if value is none but no callback is provided", async () => {
  const val = await matchPromise(undefined as Option<string>).if({
    some: (_) => "testi1",
  });

  assertEquals(val, null);
});

Deno.test("PromiseMatcher.if() :: throws if no handlers are provided", async () => {
  await assertRejects(() => {
    // @ts-expect-error: Mocking for testing
    return matchPromise(null).if({});
  });
});

Deno.test("PromiseMatcher.clearReject() :: keeps value in promise if it is some", async () => {
  const a = await matchPromise(2).clearReject().toPromise();

  assertEquals(a, 2);
});

Deno.test("PromiseMatcher.clearReject() :: returns null if value is none", async () => {
  const a = await matchPromise(null as Option<number>).clearReject()
    .toPromise();

  assertEquals(a, null);
});

Deno.test("PromiseMatcher.clearReject() :: returns null if promise is rejected", async () => {
  const a = await matchPromise(Promise.reject(2)).clearReject().toPromise();

  assertEquals(a, null);
});

Deno.test("PromiseMatcher.clearReject() :: calls sideEffect function if provided and promise rejects", async () => {
  let called = false;

  const sideEffect = () => {
    called = true;
  };

  await matchPromise(Promise.reject(2)).clearReject(sideEffect)
    .toPromise();

  assert(called);
});

Deno.test("PromiseMatcher.clearReject() :: does not call sideEffect function if promise resolves", async () => {
  let called = false;

  const sideEffect = () => {
    called = true;
  };

  await matchPromise(Promise.resolve(2)).clearReject(sideEffect)
    .toPromise();

  assert(!called);
});
