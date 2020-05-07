'use strict';

const assert = require('assert');
const stream = require('stream');
const { concat, filter, map, merge, find, flatMap, flat, reduce } = require('../src/index');

async function* asyncGen() {
  yield 1;
  yield 2;
}
function* gen() {
  yield 'hello';
  yield 'world';
}

async function toArray(it) {
  const result = [];
  for await (const value of it) {
    result.push(value);
  }
  return result;
}

describe('concat', () => {
  it('should concat sync iterables together and return a new sync iterable', () => {
    const iter = concat([1, 2], ['hello', 'world']);
    assert.ok(iter[Symbol.iterator]);
    assert.ok(iter[Symbol.asyncIterator] === undefined);
    assert.deepEqual(Array.from(iter), [1, 2, 'hello', 'world']);
  });

  it('should concat a mix of sync and async iterables into a new async iterable', async () => {
    const iter = concat(asyncGen(), gen());
    assert.ok(iter[Symbol.iterator] === undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    assert.deepEqual(await toArray(iter), [1, 2, 'hello', 'world']);
  });

  it('should concat async iterables into a new async iterable', async () => {
    const iter = concat(asyncGen(), asyncGen());
    assert.ok(iter[Symbol.iterator] === undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    assert.deepEqual(await toArray(iter), [1, 2, 1, 2]);
  });
});

describe('filter', () => {
  it('should filter iterable - array', () => {
    const iter = filter([1, 2, 3, 4, 5], x => x % 2 === 0);
    assert.ok(iter[Symbol.iterator]);
    assert.ok(iter[Symbol.asyncIterator] === undefined);
    assert.deepEqual(Array.from(iter), [2, 4]);
  });

  it('should filter iterable - generator', () => {
    const i = (function* () {
      yield 1;
      yield 2;
      yield 3;
      yield 4;
      yield 5;
    })();
    const iter = filter(i, x => x % 2 === 0);
    assert.ok(iter[Symbol.iterator]);
    assert.ok(iter[Symbol.asyncIterator] === undefined);
    assert.deepEqual(Array.from(iter), [2, 4]);
  });

  it('should filter async iterable and return a new async iterable', async () => {
    const i = (async function* () {
      yield 1;
      yield 2;
      yield 3;
      yield 4;
      yield 5;
    })();
    const iter = filter(i, x => x % 2 === 0);
    assert.ok(iter[Symbol.iterator] === undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    assert.deepEqual(await toArray(iter), [2, 4]);
  });

  it('should filter readable stream and return a new async iterable', async () => {
    const r = new stream.Readable({ objectMode: true });
    r.push(1);
    r.push(2);
    r.push(3);
    r.push(4);
    r.push(5);
    r.push(null);

    const iter = filter(r, x => x % 2 === 0);
    assert.ok(iter[Symbol.iterator] === undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    assert.deepEqual(await toArray(iter), [2, 4]);
  });
});

describe('map', () => {
  it('should map iterable to new iterable - array', () => {
    const iter = map([1, 2, 3], x => 2 * x);
    assert.ok(iter[Symbol.iterator]);
    assert.ok(iter[Symbol.asyncIterator] === undefined);
    assert.deepEqual(Array.from(iter), [2, 4, 6]);
  });

  it('should map iterable to new iterable - generator', () => {
    const i = (function* () {
      yield 1;
      yield 2;
      yield 3;
    })();
    const iter = map(i, x => 2 * x);
    assert.ok(iter[Symbol.iterator]);
    assert.ok(iter[Symbol.asyncIterator] === undefined);
    assert.deepEqual(Array.from(iter), [2, 4, 6]);
  });

  it('should map async iterable to new async iterable', async () => {
    const i = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    })();
    const iter = map(i, x => 2 * x);
    assert.ok(iter[Symbol.iterator] === undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    assert.deepEqual(await toArray(iter), [2, 4, 6]);
  });

  it('should map readable string to new async iterable', async () => {
    const r = new stream.Readable({ objectMode: true });
    r.push(1);
    r.push(2);
    r.push(3);
    r.push(null);

    const iter = map(r, x => 2 * x);
    assert.ok(iter[Symbol.iterator] === undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    assert.deepEqual(await toArray(iter), [2, 4, 6]);
  });
});

describe('flatMap', () => {
  it('should be the same as a map if mapFn does not return iterables', async () => {
    const iter = flatMap([1, 2, 3], x => 2 * x);
    assert.equal(iter[Symbol.iterator], undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    assert.deepEqual(await toArray(iter), [2, 4, 6]);
  });

  it('should flatten mapped iterables', async () => {
    const iter = flatMap([1, 2, 3], x => [2 * x]);
    assert.equal(iter[Symbol.iterator], undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    assert.deepEqual(await toArray(iter), [2, 4, 6]);
  });

  it('should be the same as a map if mapFn does not return iterables - async', async () => {
    const i = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    })();
    const iter = flatMap(i, x => 2 * x);
    assert.equal(iter[Symbol.iterator], undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    assert.deepEqual(await toArray(iter), [2, 4, 6]);
  });

  it('should flatten mapped iterables - async', async () => {
    const asReadable = x => {
      const r = new stream.Readable({ objectMode: true });
      r.push(x);
      r.push(null);
      return r;
    };

    const i = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    })();
    const iter = flatMap(i, x => asReadable(x));
    assert.equal(iter[Symbol.iterator], undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    assert.deepEqual(await toArray(iter), [1, 2, 3]);
  });
});

describe('flat', () => {
  async function* asyncRange(start, end) {
    while (start < end) {
      yield start++;
    }
  }

  it('should flatten iterable values inside iterable', async () => {
    const iter = flat([[1, 2], [3], 4]);
    assert.equal(iter[Symbol.iterator], undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    assert.deepEqual(await toArray(iter), [1, 2, 3, 4]);
  });

  it('should flatten async iterable values inside iterable', async () => {
    const iter = flat([asyncRange(1, 3), asyncRange(3, 5)]);
    assert.equal(iter[Symbol.iterator], undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    assert.deepEqual(await toArray(iter), [1, 2, 3, 4]);
  });

  it('should flatten mix of async/synchronous iterables in iterable', async () => {
    const iter = flat([asyncRange(1, 3), [3], 4]);
    assert.equal(iter[Symbol.iterator], undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    assert.deepEqual(await toArray(iter), [1, 2, 3, 4]);
  });

  it('should flatten async iterable of iterables', async () => {
    const i = (async function* () {
      yield asyncRange(1, 3);
      yield [3];
      yield 4;
    })();
    const iter = flat(i);
    assert.equal(iter[Symbol.iterator], undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    assert.deepEqual(await toArray(iter), [1, 2, 3, 4]);
  });
});

describe('merge', () => {
  it('should merge two sync iterables into an async iterable', async () => {
    const i1 = [1, 2, 3];
    const i2 = (function* () {
      yield 4;
      yield 5;
      yield 6;
    })();

    const iter = merge(i1, i2);
    assert.ok(iter[Symbol.iterator] === undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    const arr = await toArray(iter);
    assert.deepEqual(arr.sort(), [1, 2, 3, 4, 5, 6]);
  });

  it('should merge two async iterables into an async iterable', async () => {
    const i1 = (async function* () {
      yield 1;
      yield 2;
      yield 3;
    })();
    const i2 = (async function* () {
      yield 4;
      yield 5;
      yield 6;
    })();

    const iter = merge(i1, i2);
    assert.ok(iter[Symbol.iterator] === undefined);
    assert.ok(iter[Symbol.asyncIterator]);
    const arr = await toArray(iter);
    assert.deepEqual(arr.sort(), [1, 2, 3, 4, 5, 6]);
  });

  it('should throw if a source stream emits an error in merge', async () => {
    const readable = new (class extends stream.Readable {
      constructor() {
        super({ objectMode: true });
        this.count = 0;
      }
      _read() {
        if (this.count > 2) {
          return this.emit('error', new Error('Test Error'));
        }
        this.push(this.count);
        this.count += 1;
      }
    })();

    const iter = merge(readable);
    await assert.rejects(toArray(iter), { message: 'Test Error' });
  });
});

describe('find', () => {
  it('should return a found value - array', () => {
    const value = find([1, 2, 3], x => x > 1);
    assert.equal(value, 2);
  });

  it('should return a found value - generator', () => {
    const i = (function* () {
      yield 1;
      yield 2;
      yield 3;
    })();
    const value = find(i, x => x > 1);
    assert.equal(value, 2);
  });

  it('should return undefined if value not found', () => {
    const value = find([1, 3, 5], x => x % 2 === 0);
    assert.equal(value, undefined);
  });

  it('should return the promise of a found value when async iterable', async () => {
    const i = (async function* () {
      yield 1;
      yield 2;
    })();
    const value = find(i, x => x > 1);
    assert.ok(value instanceof Promise);
    assert.equal(await value, 2);
  });

  it('should return the promise of undefined when async iterable and value not found', async () => {
    const i = (async function* () {
      yield 1;
      yield 3;
      yield 5;
    })();
    const value = find(i, x => x % 2 === 0);
    assert.ok(value instanceof Promise);
    assert.equal(await value, undefined);
  });
});

describe('reduce', () => {
  it('should reduce an iterable - array', () => {
    const result = reduce([1, 2, 3], (acc, val) => acc + val, 0);
    assert.equal(result, 6);
  });

  it('should use the first item as initial acc if none provided', () => {
    const result = reduce([1, 2, 3], (acc, val) => acc + val);
    assert.equal(result, 6);
  });

  it('should reduce an iterable - generator', () => {
    const iter = (function* () {
      yield 1;
      yield 2;
      yield 3;
    })();
    const result = reduce(iter, (acc, val) => acc + val, 0);
    assert.equal(result, 6);
  });

  it('should reduce an async iterable - readable stream', async () => {
    const r = new stream.Readable({ objectMode: true });
    r.push(1);
    r.push(2);
    r.push(3);
    r.push(null);

    const result = reduce(r, (acc, value) => acc + value, 0);
    assert.ok(result instanceof Promise);
    assert.equal(await result, 6);
  });

  it('should reduce an async iterable and use first element as initial acc - readable stream', async () => {
    const r = new stream.Readable({ objectMode: true });
    r.push(1);
    r.push(2);
    r.push(3);
    r.push(null);

    const result = reduce(r, (acc, value) => acc + value);
    assert.ok(result instanceof Promise);
    assert.equal(await result, 6);
  });
});
