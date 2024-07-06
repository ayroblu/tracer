export function createTracer(
  newSpanParams: NewSpanParams,
  onTrace?: (trace: Trace) => void,
): Tracer {
  const traceId = generateRandomId();
  const traces: Trace[] = [];

  function scopedTracer(newSpanParams: NewSpanParams): ScopedTracer {
    const spanId = generateRandomId();

    addTrace({
      trace: "start",
      parentSpanId: spanId,
      processId: "browser",
      ...newSpanParams,
    });

    function addTrace(content: TraceContent): void {
      const trace: Trace = { ...content, ts: Date.now(), traceId, spanId };
      traces.push(trace);
      onTrace?.(trace);
    }
    function counter(counter: string, count: number = 1): void {
      addTrace({ counter, count });
    }
    function log(message: string | StructLogMessage): void {
      addTrace({ message });
    }
    function traceStart(newSpanParams: NewSpanParams): ScopedTracer {
      return scopedTracer(newSpanParams);
    }
    function traceEnd(): void {
      addTrace({ trace: "end" });
    }
    return {
      counter,
      log,
      traceStart,
      traceEnd,
      spanId,
    };
  }

  /** canonical export, we return a ndjson format string */
  function exportTrace(): string {
    return traces.map((trace) => JSON.stringify(trace)).join("\n");
  }

  return {
    tracer: scopedTracer(newSpanParams),
    exportTrace,
  };
}
function generateRandomId(): Id {
  return crypto.randomUUID();
}

type Tracer = {
  tracer: ScopedTracer;
  exportTrace: () => string;
};
type NewSpanParams = {
  readonly name: string;
  readonly meta?: SpanMeta;
};
type ScopedTracer = {
  counter: (counter: string, count?: number) => void;
  log: (message: string | StructLogMessage) => void;
  traceStart: (newSpanParams: NewSpanParams) => ScopedTracer;
  traceEnd: () => void;
  spanId: Id;
};
type SpanMeta = Readonly<Record<string, number | string>>;
type StructLogMessage = Readonly<Record<string, string | number | boolean>>;
type TraceContent =
  | {
      readonly message: string | StructLogMessage;
    }
  | {
      readonly counter: string;
      readonly count: number;
    }
  | ({
      readonly trace: "start";
      readonly parentSpanId: Id;
      readonly processId: string;
    } & NewSpanParams)
  | {
      readonly trace: "end";
    };
type Id = string;
type Trace = {
  readonly ts: number;
  readonly traceId: Id;
  readonly spanId: Id;
} & TraceContent;
