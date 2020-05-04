export declare function map<T, K>(it: Iterable<T>, fn: (value: T) => K): Iterable<K>;
export declare function map<T, K>(it: AsyncIterable<T>, fn: (value: T) => K): AsyncIterable<K>;

export declare function filter<T>(it: Iterable<T>, fn: (value: T) => any): Iterable<T>;
export declare function filter<T>(it: AsyncIterable<T>, fn: (value: T) => any): AsyncIterable<T>;

export declare function find<T>(it: Iterable<T>, fn: (value: T) => any): T | undefined;
export declare function find<T>(it: AsyncIterable<T>, fn: (value: T) => any): Promise<T | undefined>;

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

export {};
