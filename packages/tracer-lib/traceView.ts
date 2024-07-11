import type { Id, SpanMeta, TimeData, Trace } from "./createTracer.ts";

export function traceView(traces: Trace[]): TraceView {
  const spanMap = new Map<Id, Span>();
  const spans: Span[] = [];
  let id = "";
  for (const trace of traces) {
    id = trace.traceId;
    const span: Span =
      spanMap.get(trace.spanId) ??
      (() => {
        const span = { id: trace.spanId, startTime: trace.ts, timeMeta: [] };
        spanMap.set(trace.spanId, span);
        spans.push(span);
        return span;
      })();
    if ("trace" in trace && trace.trace === "start") {
      Object.assign(span, {
        parentSpanId: trace.parentSpanId,
        startTime: trace.ts,
        name: trace.name,
        meta: trace.meta,
        processId: trace.processId,
      });
    } else if ("trace" in trace && trace.trace === "end") {
      Object.assign(span, {
        endTime: trace.ts,
      });
    } else if ("message" in trace) {
      span.timeMeta.push({
        ts: trace.ts,
        message: trace.message,
      });
    } else if ("counter" in trace) {
      span.timeMeta.push({
        ts: trace.ts,
        counter: trace.counter,
        count: trace.count,
      });
    } else {
      isNever(trace);
    }
  }
  return { id, spans };
}

function isNever(_value: never): void {}

type TimeMeta = {
  ts: number;
} & TimeData;
type Span = {
  id: Id;
  parentSpanId?: Id;
  name?: string;
  meta?: SpanMeta;
  timeMeta: TimeMeta[];
  startTime: number;
  endTime?: number;
  processId?: string;
};
type TraceView = {
  id: Id;
  spans: Span[];
};
