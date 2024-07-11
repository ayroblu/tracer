import type { Id, Trace } from "@ayroblu/tracer-lib";
import { lazy } from "../utils/index.ts";

export const getFixture = lazy(() => {
  const traces: Trace[] = [];
  const startTime = Date.now();
  const endTime = startTime + 5000;
  const spanId = crypto.randomUUID();
  const traceId = crypto.randomUUID();
  traces.push({
    ts: startTime,
    spanId,
    traceId,
    trace: "start",
    name: "Example trace",
    processId: "browser",
  });
  const topInc = 500;
  for (let ts = startTime; ts < endTime; ts += topInc) {
    traces.push({
      ts,
      spanId,
      traceId,
      counter: "run",
    });
    traces.push(
      ...generateNestedTasks({
        parentSpanId: spanId,
        ts: ts + Math.round(topInc / 10),
        traceId,
        width: Math.round((topInc * 8) / 10),
        depth: 0,
      }),
    );
  }
  traces.push({
    ts: endTime,
    spanId,
    traceId,
    trace: "end",
  });
  return traces;
});

type NestParams = {
  parentSpanId: Id;
  ts: number;
  traceId: Id;
  width: number;
  depth: number;
};
function generateNestedTasks(params: NestParams): Trace[] {
  const { parentSpanId, traceId, ts, width, depth } = params;
  if (depth > 10) {
    return [];
  }
  const spanId = crypto.randomUUID();
  return [
    {
      ts,
      traceId,
      trace: "start",
      processId: "browser",
      spanId,
      parentSpanId,
      name: `https://example.com/api/level-${depth}`,
    },
    {
      ts: ts + 1,
      spanId,
      traceId,
      counter: "child-run",
    },
    ...generateNestedTasks({
      ...params,
      ts: ts + Math.round(width / 10),
      width: Math.round((width * 8) / 10),
      depth: depth + 1,
    }),
    {
      ts: ts + width,
      traceId,
      trace: "end",
      spanId,
    },
  ];
}
