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
    function counter(counter: string, count?: number): void {
      addTrace({ counter, count });
    }
    function gauge(gauge: Gauge): void {
      addTrace({ gauge });
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
      gauge,
      traceStart,
      traceEnd,
      spanId,
    };
  }

  /** canonical export, we return a ndjson format string */
  function exportTrace(): string {
    return traces.map((trace) => JSON.stringify(trace)).join("\n");
  }

  /** useful for testing mainly */
  function exportRaw(): Trace[] {
    return traces;
  }

  return {
    tracer: scopedTracer(newSpanParams),
    exportTrace,
    exportRaw,
  };
}
function generateRandomId(): Id {
  return crypto.randomUUID();
}

export type Tracer = {
  tracer: ScopedTracer;
  exportTrace: () => string;
  exportRaw: () => Trace[];
};
type NewSpanParams = {
  readonly name: string;
  readonly meta?: SpanMeta;
};
export type ScopedTracer = {
  counter: (counter: string, count?: number) => void;
  log: (message: string | StructLogMessage) => void;
  gauge: (gauge: Gauge) => void;
  traceStart: (newSpanParams: NewSpanParams) => ScopedTracer;
  traceEnd: () => void;
  spanId: Id;
};
export type SpanMeta = Readonly<Record<string, number | string>>;
type StructLogMessage = Readonly<Record<string, string | number | boolean>>;
export type TimeData =
  | {
      readonly message: string | StructLogMessage;
    }
  | {
      readonly counter: string;
      readonly count?: number;
    };
export type Gauge = { readonly [key: string]: number };
export type GaugeData = { readonly gauge: { readonly [key: string]: number } };
type TraceContent =
  | TimeData
  | GaugeData
  | ({
      readonly trace: "start";
      readonly parentSpanId?: Id;
      readonly processId: string;
    } & NewSpanParams)
  | {
      readonly trace: "end";
    };
export type Id = string;
export type Trace = {
  readonly ts: number;
  readonly traceId: Id;
  readonly spanId: Id;
} & TraceContent;
