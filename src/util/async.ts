export function mapAsync<I, O>(
  array: I[],
  callback: (value: I, index: number, array: I[]) => Promise<O>
): Promise<O[]> {
  return Promise.all(array.map(callback));
}

export async function filterAsync<T>(
  array: T[],
  callback: (value: T, index: number, array: T[]) => Promise<boolean>
): Promise<T[]> {
  const filterMap = await mapAsync(array, callback);
  return array.filter((_, index) => filterMap[index]);
}

/**
 * Given an async iterable of string chunks (that may not end at separator boundaries), split the stream into an iterable
 * of separated parts, between the separator (and excluding it)
 *
 * @see https://github.com/rauschma/stringio/blob/0617012942e9731aafd9e0eb70a2e3aed1ff4398/ts/src/index.ts
 */
export async function* splitAsyncIterator(chunks: AsyncIterable<string>, separator = '\n'): AsyncIterable<string> {
  let previous = '';

  for await (const chunk of chunks) {
    previous += chunk;

    let eolIndex;

    // eslint-disable-next-line no-cond-assign
    while ((eolIndex = previous.indexOf(separator)) >= 0) {
      const line = previous.slice(0, eolIndex);
      yield line;
      previous = previous.slice(eolIndex);
    }
  }

  if (previous.length > 0) {
    yield previous;
  }
}
