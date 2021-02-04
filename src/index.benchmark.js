const { describe, it } = require('benchmonkey');
const { map, pipe } = require('.');

describe('map', () => {
  const arr = Array.from({ length: 100 }, (_, i) => i);
  it('array baseline', () => {
    return () => {
      return arr
        .map(x => x)
        .map(x => x)
        .map(x => x);
    };
  });

  it('iterable map', () => {
    return () =>
      pipe(
        it => map(it, x => x),
        it => map(it, x => x),
        it => map(it, x => x)
      )(arr);
  });
});
