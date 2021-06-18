import { isNone, match, Matcher, Option } from "./mod.ts";
import { Rhum } from "https://deno.land/x/rhum@v1.1.6/mod.ts";

const UNWRAP_ERROR_MSG = "Called unwrap on nil value";

Rhum.testPlan("option", () => {
  Rhum.testSuite("isNone", () => {
    Rhum.testCase("should be true for null", () => {
      Rhum.asserts.assert(isNone(null));
    });
    Rhum.testCase("should be true for undefined", () => {
      Rhum.asserts.assert(isNone(undefined));
    });
    Rhum.testCase("should be false for string", () => {
      Rhum.asserts.assert(!isNone("testi"));
    });
    Rhum.testCase("should be false for number", () => {
      Rhum.asserts.assert(!isNone(2));
    });
    Rhum.testCase("should be false for object", () => {
      Rhum.asserts.assert(!isNone({}));
    });
    Rhum.testCase("should be false for array", () => {
      Rhum.asserts.assert(!isNone([]));
    });
  });

  Rhum.testSuite("toOption", () => {
    Rhum.testCase("should return value", () => {
      const original: Option<string> = "testi";
      const value: Matcher<string> = match(original);

      Rhum.asserts.assertEquals(value.toOption(), original);
    });

    Rhum.testCase("should return mapped value", () => {
      const original: Option<string> = "testi";
      const value: Matcher<string> = match(original).map((val) => `${val}2`);

      Rhum.asserts.assertEquals(value.toOption(), "testi2");
    });
  });

  Rhum.testSuite("unwrap", () => {
    Rhum.testCase("should return value if it is some", () => {
      const original: Option<string> = "testi";
      const value: Matcher<string> = match(original);

      Rhum.asserts.assertEquals(value.unwrap(), original);
    });
    Rhum.testCase("should throw if value is none", () => {
      const value: Matcher<string> = match(null as unknown as string);

      Rhum.asserts.assertThrows(
        () => {
          value.unwrap();
        },
        Error,
        UNWRAP_ERROR_MSG,
      );
    });
  });
  Rhum.testSuite("unwrapOr", () => {
    Rhum.testCase("should return value if it is some", () => {
      const original: Option<string> = "testi";
      const value: Matcher<string> = match(original);

      Rhum.asserts.assertEquals(value.unwrapOr("testo"), original);
    });
    Rhum.testCase("should return default if value is none", () => {
      const expected = "testo";
      const value: Matcher<string> = match(null as unknown as string);

      Rhum.asserts.assertEquals(value.unwrapOr(expected), expected);
    });
  });
  Rhum.testSuite("map", () => {
    Rhum.testCase("should call given function on value", () => {
      const num: Option<number> = 1;
      const fn = (n: number): Option<string> => `${n}`;

      const mt: Matcher<string> = match(num).map(fn);

      Rhum.asserts.assertEquals(mt.unwrap(), "1");
    });
    Rhum.testCase("should pass value through unchanged if none", () => {
      const num: Option<number> = null as unknown as number;
      const fn = (n: number): Option<string> => `${n}`;

      const mt: Matcher<string> = match(num).map(fn);

      Rhum.asserts.assertThrows(
        () => {
          mt.unwrap();
        },
        Error,
        UNWRAP_ERROR_MSG,
      );
    });
    Rhum.testCase("should not call map function if value is none", () => {
      const num: Option<number> = null as unknown as number;
      let called = false;
      const fn = (n: number): Option<string> => {
        called = true;
        return `${n}`;
      };

      const mt: Matcher<string> = match(num).map(fn);

      Rhum.asserts.assertThrows(
        () => {
          mt.unwrap();
        },
        Error,
        UNWRAP_ERROR_MSG,
      );
      Rhum.asserts.assert(!called);
    });
  });
  Rhum.testSuite("isSome", () => {
    Rhum.testCase("should return true if value is some", () => {
      const mt = match("some");

      Rhum.asserts.assert(mt.isSome());
    });

    Rhum.testCase("should return false if value is none", () => {
      const mt = match(null);

      Rhum.asserts.assert(!mt.isSome());
    });
  });
  Rhum.testSuite("isNone", () => {
    Rhum.testCase("should return true if value is none", () => {
      const mt = match(null);

      Rhum.asserts.assert(mt.isNone());
    });
    Rhum.testCase("should return false if value is some", () => {
      const mt = match("some");

      Rhum.asserts.assert(!mt.isNone());
    });
  });
  Rhum.testSuite("or", () => {
    Rhum.testCase("should not change value if some", () => {
      const original = "testi";
      const mt = match(original).or("testo");

      Rhum.asserts.assertEquals(mt.unwrap(), original);
    });
    Rhum.testCase("should update value if none", () => {
      const original = null;
      const mt = match(original).or("testo");

      Rhum.asserts.assertEquals(mt.unwrap(), "testo");
    });
  });
  Rhum.testSuite("mapOr", () => {
    Rhum.testCase("should not change value if map returns some", () => {
      const original = "testi";
      const mt = match(original).mapOr((o) => o, "testo");

      Rhum.asserts.assertEquals(mt.unwrap(), original);
    });
    Rhum.testCase("should update value if map returns none", () => {
      const original = "testi";
      const mt = match(original).mapOr((_) => null, "testo");

      Rhum.asserts.assertEquals(mt.unwrap(), "testo");
    });
  });
  Rhum.testSuite("toString", () => {
    Rhum.testCase("should return `null` string if none", () => {
      const res = match(undefined).toString();
      Rhum.asserts.assertEquals(res, "null");
    });
    Rhum.testCase(
      "should return return string representation if value is some",
      () => {
        const res = match({ a: 1 }).toString();
        Rhum.asserts.assertEquals(res, { a: 1 }.toString());
      },
    );
  });
  Rhum.testSuite("toJSON", () => {
    Rhum.testCase("should pull out inner value when converting to JSON", () => {
      const actual = JSON.stringify({ a: match(2) });
      const expected = JSON.stringify({ a: 2 });

      Rhum.asserts.assertEquals(actual, expected);
    });
    Rhum.testCase("should pull out none value when converting to JSON", () => {
      const actual = JSON.stringify({ a: match(null) });
      const expected = JSON.stringify({ a: null });

      Rhum.asserts.assertEquals(actual, expected);
    });
  });
  Rhum.testSuite("toPromise", () => {
    Rhum.testCase("should resolve if value is some", async () => {
      const val = await match(2).toPromise();

      Rhum.asserts.assertEquals(val, 2);
    });
    Rhum.testCase("should reject if value is none", async () => {
      const val = await match(null).toPromise().catch((_) => 3);

      Rhum.asserts.assertEquals(val, 3);
    });
  });
  Rhum.testSuite("if", () => {
    Rhum.testCase("should call some callback if value is some", () => {
      const val = match("testi").if(
        { some: (v) => `${v}1`, none: () => "testi2" },
      );
      Rhum.asserts.assertEquals(val, "testi1");
    });
    Rhum.testCase(
      "should return null if value is some but no callback is provided",
      () => {
        const val = match("testi").if({ none: () => "testi1" });
        Rhum.asserts.assertEquals(val, null);
      },
    );
    Rhum.testCase("should call none callback if value is none", () => {
      const val = match(null).if(
        { some: (_) => "testi2", none: () => "testi1" },
      );
      Rhum.asserts.assertEquals(val, "testi1");
    });
    Rhum.testCase(
      "should return null if value is none but no callback is provided",
      () => {
        const val = match(undefined).if({ some: (_) => "testi1" });
        Rhum.asserts.assertEquals(val, null);
      },
    );
    Rhum.testCase("should throw if no handlers are provided", () => {
      Rhum.asserts.assertThrows(() => {
        // @ts-expect-error: Mocking for testing
        match(null).if({});
      });
    });
  });
  Rhum.testSuite("is", () => {
    Rhum.testCase("should return true if value equals comparand", () => {
      Rhum.asserts.assert(match(2).is(2));
    });
    Rhum.testCase(
      "should return false if value does not equal comparand",
      () => {
        Rhum.asserts.assert(!match(2).is(3));
      },
    );
    Rhum.testCase("should return false if value is none", () => {
      Rhum.asserts.assert(!match<number>(null).is(3));
    });
  });
  Rhum.testSuite("expect", () => {
    Rhum.testCase("should return value if some", () => {
      const actual = match(2).expect("This is fine");
      const expected = 2;

      Rhum.asserts.assertEquals(actual, expected);
    });
    Rhum.testCase("should throw if value is none", () => {
      Rhum.asserts.assertThrows(() => {
        match(null).expect("This is fine");
      });
    });
  });
});

Rhum.run();
