# Option

Deno module inspired by Rusts `Option<T>` to help handling `null` and
`undefined` in Typescript.

## How to use

The main idea is to type all values that are either `T | null` or
`T | undefined` into a unified `Option<T>` and to handle either cases with the
help of `match()` and the `Matcher` class.

This allows solid type/null safety in your project without the fear of
`cannot read property name of undefined`.

