import { createTracer } from "@ayroblu/tracer-lib";

const { tracer } = createTracer(
  {
    name: "session",
  },
  // (trace: Trace) => void,
);
const pageTracer = tracer.traceStart({ name: "page" });
tracer.log({ name: "page" });
tracer.counter("todo");
pageTracer.traceEnd();
tracer.traceEnd();
