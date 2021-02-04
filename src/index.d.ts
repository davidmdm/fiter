export declare function range(start: number, end: number): Iterable<number>;

export declare function map<T, K>(it: Iterable<T>, fn: (value: T) => K): Iterable<K>;
export declare function map<T, K>(it: AsyncIterable<T>, fn: (value: T) => K): AsyncIterable<K>;

export declare function flat<T>(
  it: Iterable<T> | AsyncIterable<T>
): T extends Iterable<infer K>
  ? AsyncIterable<K>
  : T extends AsyncIterable<infer K>
  ? AsyncIterable<K>
  : AsyncIterable<T>;

export declare function flatMap<T, K>(
  it: Iterable<T> | AsyncIterable<T>,
  fn: (value: T) => K
): K extends Iterable<infer L>
  ? AsyncIterable<L>
  : K extends AsyncIterable<infer L>
  ? AsyncIterable<L>
  : AsyncIterable<K>;

export declare function filter<T>(it: Iterable<T>, fn: (value: T) => any): Iterable<T>;
export declare function filter<T>(it: AsyncIterable<T>, fn: (value: T) => any): AsyncIterable<T>;

export declare function find<T>(it: Iterable<T>, fn: (value: T) => any): T | undefined;
export declare function find<T>(it: AsyncIterable<T>, fn: (value: T) => any): Promise<T | undefined>;

export declare function reduce<T, K>(it: Iterable<T>, fn: (acc: T | undefined, value: T) => T): T | undefined;
export declare function reduce<T, K>(it: Iterable<T>, fn: (acc: K, value: T) => K, initialAcc: K): K;
export declare function reduce<T, K>(it: AsyncIterable<T>, fn: (acc: T, value: T) => T): Promise<T | undefined>;
export declare function reduce<T, K>(
  it: AsyncIterable<T>,
  fn: (acc: K, value: T) => K,
  initialAcc: K
): K extends Promise<any> ? K : Promise<K>;

type Iter = Iterable<any> | AsyncIterable<any>;
type IsAsyncIterResultType<T extends Iter[]> = {
  [key in keyof T]: T[key] extends { [Symbol.asyncIterator]: () => any } ? true : never;
}[number];
type ResultType<T extends Iter[]> = {
  [Key in keyof T]: T[Key] extends AsyncIterable<infer K> ? K : T[Key] extends Iterable<infer K> ? K : never;
}[number];

export declare function concat<T extends Iter[]>(
  ...args: T
): true extends IsAsyncIterResultType<T> ? AsyncIterable<ResultType<T>> : Iterable<ResultType<T>>;

export declare function merge<T extends Iter[]>(...args: T): AsyncIterable<ResultType<T>>;

export declare function pipe<T1, T2>(f1: (x: T1) => T2): (x: T1) => T2;
export declare function pipe<T1, T2, T3>(f1: (x: T1) => T2, f2: (x: T2) => T3): (x: T1) => T3;
export declare function pipe<T1, T2, T3, T4>(f1: (x: T1) => T2, f2: (x: T2) => T3, f3: (x: T3) => T4): (x: T1) => T4;
export declare function pipe<T1, T2, T3, T4, T5>(
  f1: (x: T1) => T2,
  f2: (x: T2) => T3,
  f3: (x: T3) => T4,
  f4: (x: T4) => T5
): (x: T1) => T5;
export declare function pipe<T1, T2, T3, T4, T5, T6>(
  f1: (x: T1) => T2,
  f2: (x: T2) => T3,
  f3: (x: T3) => T4,
  f4: (x: T4) => T5,
  f5: (x: T5) => T6
): (x: T1) => T6;
export declare function pipe<T1, T2, T3, T4, T5, T6, T7>(
  f1: (x: T1) => T2,
  f2: (x: T2) => T3,
  f3: (x: T3) => T4,
  f4: (x: T4) => T5,
  f5: (x: T5) => T6,
  f6: (x: T6) => T7
): (x: T1) => T7;
export declare function pipe<T1, T2, T3, T4, T5, T6, T7, T8>(
  f1: (x: T1) => T2,
  f2: (x: T2) => T3,
  f3: (x: T3) => T4,
  f4: (x: T4) => T5,
  f5: (x: T5) => T6,
  f6: (x: T6) => T7,
  f7: (x: T7) => T8
): (x: T1) => T8;
export declare function pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  f1: (x: T1) => T2,
  f2: (x: T2) => T3,
  f3: (x: T3) => T4,
  f4: (x: T4) => T5,
  f5: (x: T5) => T6,
  f6: (x: T6) => T7,
  f7: (x: T7) => T8,
  f8: (x: T8) => T9
): (x: T1) => T9;
export declare function pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  f1: (x: T1) => T2,
  f2: (x: T2) => T3,
  f3: (x: T3) => T4,
  f4: (x: T4) => T5,
  f5: (x: T5) => T6,
  f6: (x: T6) => T7,
  f7: (x: T7) => T8,
  f8: (x: T8) => T9,
  f9: (x: T9) => T10
): (x: T1) => T10;

export {};
