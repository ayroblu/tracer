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

export function cn(
  ...args: (string | "" | 0 | false | null | undefined)[]
): string {
  return args.filter((a) => a).join(" ");
}

export function withSign(num: number): string {
  return num >= 0 ? `+${num}` : num.toString();
}

export function toPercent(v: number): string {
  return (v * 100).toFixed(2) + "%";
}

export function defaultObjectGet<T extends object, K extends keyof T>(
  o: T,
  k: K,
  def: () => T[K],
): T[K] {
  return (
    o[k] ??
    (() => {
      const item = def();
      o[k] = item;
      return item;
    })()
  );
}

export function collect<T, R>(
  list: ReadonlyArray<T>,
  f: (v: T) => R | null | undefined,
): R[] {
  const results: R[] = [];
  for (const item of list) {
    const result = f(item);
    if (result !== undefined && result !== null) {
      results.push(result);
    }
  }
  return results;
}
