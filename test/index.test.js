'use strict';

const assert = require('assert');
const stream = require('stream');
const { concat, filter, map, merge } = require('../src/index');

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
