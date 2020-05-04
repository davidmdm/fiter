# Iterable Utils

This package provides barebone utilities for working with (sync and async) iterators and iterable values in nodejs.

More specifically it provides the highorder filter, map and find functions, as well as, concat and merge utilities.

### map

Map over the values of any iterable and get a new iterable object.

```javascript
const result = map([1, 2, 3], x => 2 * x);
result.next(); // { value: 2, done: false };
result.next(); // { value: 4, done: false };
result.next(); // { value: 6, done: false };
result.next(); // { value: undefined, done: true };
```

If the initial argument is an async iterator or async iterable value (Readable streams for example) than map will return a new async iterable.

```javascript
// A contrived readable stream
const readable = new Readable({ objectMode: true });
readable.push(1);
readable.push(2);
readable.push(3);
readable.push(null);

const result = map(readable, x => 2 * x);
result.next(); // Promise<{ value: 2, done: false }>;
result.next(); // Promise<{ value: 4, done: false }>;
result.next(); // Promise<{ value: 6, done: false }>;
result.next(); // Promise<{ value: undefined, done: true }>;
```

### filter

```javascript
const result = filter([1, 2, 3], x => x % 2 === 1);
result.next(); // { value: 1, done: false };
result.next(); // { value: 3, done: false };
result.next(); // { value: undefined, done: true };
```

Same as with `map`, if the first argument is an async iterator or iterable value the returned value shall also be an async iterable value.

```javascript
const iter = (async function* () {
  yield 1;
  await somePromise();
  yield 2;
  await someOtherPromise();
  yield 3;
})();

const result = filter([1, 2, 3], x => x % 2 === 1);
result.next(); // Promise<{ value: 1, done: false }>;
result.next(); // Promise<{ value: 3, done: false }>;
result.next(); // Promise<{ value: undefined, done: true }>;
```

### flatMap

Should your iterables map onto more iterables you can flat map them to flatten the second level of iterables. flatMap always returns an async iterable since the mapping function is computed iteratively and there is no way to know in advance if the resulting values will be sync or async iterable.

```javascript
const iter = flatMap(['file.txt', 'next.txt'], file => fs.createReadableStream(file));
```

### find

Analagous to `Array.prototype.find`, will return first element to match predicate function otherwise undefined.

```javascript
find([1, 2, 3], x => x % 2 === 0); // 2
find([1, 2, 3], x => x === 0); // undefined
```

When using an async iterable the result if a Promise.

```javascript
const iter = (async function* () {
  yield 1;
  await somePromise();
  yield 2;
  await someOtherPromise();
  yield 3;
})();

find(iter, x => x % 2 === 0); // Promise<2>
find(iter, x => x === 0); // Promise<undefined>
```

### concat

Concat will take iterable values and return a new iterable object that is the concatenation of those iterables. Should any iterable be async the returned iterable shall also be iterable.

```javascript
const iter = concat(
  [1],
  (function* () {
    yield 2;
  })()
);

iter.next(); // { value: 1, done: false };
iter.next(); // { value: 2, done: false };
iter.next(); // { value: undefined, done: true };
```

async example:

```javascript
const readable = new Readable({ objectMode: true });
readable.push(3);
readable.push(null);

const iter = concat(
  [1],
  (async function* () {
    await somePromise();
    yield 2;
  })(),
  readable
);

iter.next(); // Promise<{ value: 1, done: false }>;
iter.next(); // Promise<{ value: 2, done: false }>;
iter.next(); // Promise<{ value: 3, done: false }>;
iter.next(); // Promise<{ value: undefined, done: true }>;
```

### merge

If the order between iterables do not need to be preserved a merge utility is provided. The result of merge will always be an async iterable regardless of whether all iterable values to be merged are synchronous.

```javascript
const readable = new Readable({ objectMode: true });
readable.push(3);
readable.push(null);

const iter = merge(
  [1],
  (async function* () {
    await somePromise();
    yield 2;
  })(),
  readable
);

// the order of values when calling next is not guaranteed but all values 1, 2, 3 will be emitted before done is true.
```
