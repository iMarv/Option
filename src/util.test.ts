import { isNone } from "./util.ts";
import { assert } from "https://deno.land/std@0.147.0/testing/asserts.ts";

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
