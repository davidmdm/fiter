'use strict';

const { Readable, PassThrough } = require('stream');

function* syncFilter(it, fn) {
  for (const value of it) {
    if (fn(value)) {
      yield value;
    }
  }
}

async function* asyncfilter(it, fn) {
  for await (const value of it) {
    if (fn(value)) {
      yield value;
    }
  }
}

function filter(it, fn) {
  if (it[Symbol.asyncIterator]) {
    return asyncfilter(it, fn);
  }
  return syncFilter(it, fn);
}

function* syncMap(it, fn) {
  for (const value of it) {
    yield fn(value);
  }
}

async function* asyncMap(it, fn) {
  for await (const value of it) {
    yield fn(value);
  }
}

function map(it, fn) {
  if (it[Symbol.asyncIterator]) {
    return asyncMap(it, fn);
  }
  return syncMap(it, fn);
}

async function* flat(it) {
  for await (const value of it) {
    if (value[Symbol.asyncIterator]) {
      yield* value[Symbol.asyncIterator]();
    } else if (value[Symbol.iterator]) {
      yield* value[Symbol.iterator]();
    } else {
      yield value;
    }
  }
}

function flatMap(it, fn) {
  return flat(map(it, fn));
}

function* syncConcat(...iterators) {
  for (const it of iterators) {
    yield* it;
  }
}

async function* asyncConcat(...iterators) {
  for (const it of iterators) {
    yield* it;
  }
}

function concat(...iterators) {
  if (iterators.some(it => !!it[Symbol.asyncIterator])) {
    return asyncConcat(...iterators);
  }
  return syncConcat(...iterators);
}

function merge(...iterators) {
  const readers = iterators.map(iterator => Readable.from(iterator, { objectMode: true }));
  const passthrough = new PassThrough({ objectMode: true });
  let activeSources = readers.length;
  for (const r of readers) {
    r.once('error', err => passthrough.emit('error', err));
    r.once('end', () => {
      activeSources = activeSources - 1;
      if (activeSources === 0) {
        passthrough.end();
      }
    });
    r.pipe(passthrough, { end: false });
  }
  return passthrough[Symbol.asyncIterator]();
}

function syncfind(it, fn) {
  for (const value of it) {
    if (fn(value)) {
      return value;
    }
  }
}

async function asyncfind(it, fn) {
  for await (const value of it) {
    if (fn(value)) {
      return value;
    }
  }
}

function find(it, fn) {
  if (it[Symbol.asyncIterator]) {
    return asyncfind(it, fn);
  }
  return syncfind(it, fn);
}

function syncReduce(iter, fn, acc) {
  if (acc === undefined) {
    const { value, done } = iter.next();
    if (done) {
      return value;
    }
    acc = value;
  }
  for (const value of iter) {
    acc = fn(acc, value);
  }
  return acc;
}

async function asyncReduce(iter, fn, acc) {
  if (acc === undefined) {
    const { value, done } = await iter.next();
    if (done) {
      return value;
    }
    acc = value;
  }
  for await (const value of iter) {
    acc = fn(acc, value);
  }
  return acc;
}

function reduce(iter, fn, acc) {
  if (iter[Symbol.asyncIterator]) {
    return asyncReduce(iter[Symbol.asyncIterator](), fn, acc);
  }
  return syncReduce(iter[Symbol.iterator](), fn, acc);
}

module.exports = {
  map,
  filter,
  concat,
  merge,
  find,
  reduce,
  flatMap,
  flat,
};
