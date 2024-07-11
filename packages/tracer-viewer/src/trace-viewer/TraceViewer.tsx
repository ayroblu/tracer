import { traceView } from "@ayroblu/tracer-lib";
import { getFixture } from "../fixture/index.ts";
import styles from "./TraceViewer.module.css";

const traces = getFixture();
const { spans } = traceView(traces);
const maxTime = traces.reduce((max, next) => Math.max(max, next.ts), 0);
const minTime = traces.reduce(
  (min, next) => Math.min(min, next.ts),
  Number.POSITIVE_INFINITY,
);
const totalDuration = maxTime - minTime;

export function TraceViewer() {
  return (
    <div>
      {spans.map(({ id, startTime, name, endTime }) => {
        const width =
          (((endTime ?? maxTime) - startTime) / totalDuration) *
          window.innerWidth;
        const offsetStart =
          ((startTime - minTime) / totalDuration) * window.innerWidth;
        return (
          <div
            key={id}
            style={{ width, marginInlineStart: offsetStart }}
            className={styles.span}
          >
            {name ?? ""}
          </div>
        );
      })}
    </div>
  );
}
