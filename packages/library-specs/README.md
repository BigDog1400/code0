# This package creates specs for libraries

> This is not a template generator, if you want to make a template you must check if the libraries you gonna use are here, otherwise you must create a spec for that library

Spec generators must be exported from the `inedex.specs.ts`. A spec is a generic object that indicates how a template should prompt, providing the library documentation and examples to the model.

Specs are a defined structures that you can check in the [types.ts](./types.ts) file. All specs inside modules folder exports an async method that returns an object with the following data:

- `framework`: vue, react, svlete, next, etc...
- `library`: 'shadcn, reactsrap, etc...'
- `specs`: The specs array containing all the components that library uses providing documentation and examples for ech, you can check the shadcn example to know how to generate all this data. If you can provide this data manually somehow, then you don't need to obtain it from anyware, but the return type of the method must still be a promise.
- `clone`: Optional string for indicating if this package should clone a repo for getting your scrap to work.

You can use this package to generate locally custom specs. If you want to contribuute with a new spec for any library. Open a PR.