export function lazy<T>(f: () => T): () => T {
  let value: T = null as T;
  let run = false;
  return () => {
    if (!run) {
      run = true;
      value = f();
      return value;
    }
    return value;
  };
}
