import type { Id, SpanMeta, TimeData, Trace } from "@ayroblu/tracer-lib";
import { defaultObjectGet } from "./utils/index.ts";

export function traceView(traces: Trace[]): TraceView {
  const spanMap = new Map<Id, Span>();
  const spans: Span[] = [];
  for (const trace of traces) {
    const span: Span =
      spanMap.get(trace.spanId) ??
      (() => {
        const span: Span = {
          id: trace.spanId,
          startTime: trace.ts,
          timeMeta: [],
          chartData: {},
        };
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
    } else if ("gauge" in trace) {
      Object.entries(trace.gauge).forEach(([key, value]) => {
        const list = defaultObjectGet(span.chartData, key, () => []);
        list.push({ ts: trace.ts, value });
      });
    } else {
      isNever(trace);
    }
  }
  return { spans };
}

function isNever(_value: never): void {}

export type TimeMeta = {
  ts: number;
} & TimeData;
export type Span = {
  id: Id;
  parentSpanId?: Id;
  name?: string;
  meta?: SpanMeta;
  timeMeta: TimeMeta[];
  chartData: { [key: string]: { ts: number; value: number }[] };
  startTime: number;
  endTime?: number;
  processId?: string;
};
export type TraceView = {
  spans: Span[];
};
