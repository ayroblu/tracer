import { traceView } from "../traceView.ts";
import type { Span, TimeMeta } from "../traceView.ts";
import { getFixture } from "../fixture/index.ts";
import styles from "./TraceViewer.module.css";
import { cn, toPercent, withSign } from "../utils/index.ts";
import { atom, useAtomValue } from "jotai";
import { atomFamily } from "jotai/utils";
import { useSetAtom } from "jotai";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  XAxisProps,
  YAxis,
} from "recharts";
import { getXAxisArgs } from "./chart-utils.ts";

export function TraceViewer() {
  return (
    <div className={styles.container}>
      <SpanList />
      <MaybeFocusedSpanDetails />
    </div>
  );
}
function SpanList() {
  const spans = useAtomValue(spansAtom);
  return (
    <div className={styles.spanList}>
      {spans.map(({ id }, index) => (
        <Span index={index} key={id} />
      ))}
    </div>
  );
}
function Span({ index }: { index: number }) {
  const { name, endTime } = useAtomValue(spanAtom(index));
  const style = useAtomValue(spanStyleAtom(index));
  const noEnd = !endTime;
  const focusSpan = useSetAtom(focusSpanAtom(index));
  const isFocused = useAtomValue(isFocusedAtom(index));
  return (
    <div
      style={style}
      className={cn(
        styles.span,
        noEnd && styles.noEndSpan,
        isFocused && styles.focused,
      )}
      onClick={focusSpan}
    >
      <span>{name ?? ""}</span>
    </div>
  );
}

function MaybeFocusedSpanDetails() {
  const hasFocusedSpan = useAtomValue(hasFocusedSpanAtom);
  return hasFocusedSpan && <FocusedSpanDetails />;
}
function FocusedSpanDetails() {
  const { name, id, processId, parentSpanId, startTime, endTime } =
    useAtomValue(knownFocusedSpanAtom);
  const duration = endTime ? `${endTime - startTime}ms` : "unknown";
  // TODO: Only be sticky when doesn't have scrollable hidden content
  return (
    <div className={styles.details}>
      <div className={styles.sticky}>
        <div>Id: {id}</div>
        <div>ParentSpanId: {parentSpanId}</div>
        <div>ProcessId: {processId}</div>
        <div>Name: {name}</div>
        <div>
          Start Time:{" "}
          {new Date(startTime).toLocaleString(undefined, timestampOption)}
        </div>
        <div>Duration: {duration}</div>
        <FocusedChartData />
        <FocusedTimeMeta />
        <Meta />
      </div>
    </div>
  );
}

function FocusedTimeMeta() {
  const { startTime, timeMeta } = useAtomValue(knownFocusedSpanAtom);
  return (
    <div className={styles.focusedTimeMeta}>
      Counters and Logs:
      <div>
        {timeMeta.map((item, i) => (
          <TimeMetaItem key={i} item={item} startTime={startTime} />
        ))}
      </div>
    </div>
  );
}
function TimeMetaItem({
  item,
  startTime,
}: {
  item: TimeMeta;
  startTime: number;
}) {
  const logText =
    "counter" in item
      ? item.count !== undefined
        ? `${item.counter} ${withSign(item.count)}`
        : item.counter
      : typeof item.message === "string"
        ? item.message
        : JSON.stringify(item.message, null, 2);
  const title = new Date(item.ts).toLocaleString(undefined, timestampOption);
  return (
    <div className={styles.timeMetaItem}>
      <div>
        <span title={title}>{item.ts - startTime}ms</span>
      </div>
      <div>{logText}</div>
    </div>
  );
}
const timestampOption: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  fractionalSecondDigits: 3,
};
function Meta() {
  const { meta } = useAtomValue(knownFocusedSpanAtom);
  if (!meta) {
    return null;
  }
  const items = Object.entries(meta);
  return (
    <div className={styles.focusedTimeMeta}>
      Tags:
      <div>
        {items.map(([key, value]) => (
          <div>
            <div>{key}</div>
            <div>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function FocusedChartData() {
  const { chartData } = useAtomValue(knownFocusedSpanAtom);
  return Object.entries(chartData).map(([key, data]) => (
    <div className={styles.chart} key={key}>
      <div className={styles.title}>{key}</div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} title={key}>
          <XAxis dataKey="ts" {...getXAxisArgs(data)} />
          <YAxis />
          <Line dataKey="value" isAnimationActive={false} />
          <Tooltip
            isAnimationActive={false}
            contentStyle={getContentStyle()}
            labelFormatter={(label) =>
              new Date(label).toLocaleString(undefined, timestampOption)
            }
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  ));
}
const darkContentStyle = { backgroundColor: "Canvas", border: "none" };
const lightContentStyle = {};
function getContentStyle() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? darkContentStyle
    : lightContentStyle;
}

const tracesAtom = atom(() => {
  return getFixture();
});
const spansAtom = atom((get) => {
  const traces = get(tracesAtom);
  const { spans } = traceView(traces);
  return spans;
});
const maxTimeAtom = atom((get) =>
  get(tracesAtom).reduce((max, next) => Math.max(max, next.ts), 0),
);
const minTimeAtom = atom((get) =>
  get(tracesAtom).reduce(
    (min, next) => Math.min(min, next.ts),
    Number.POSITIVE_INFINITY,
  ),
);
const totalDurationAtom = atom((get) => get(maxTimeAtom) - get(minTimeAtom));
const spanAtom = atomFamily((index: number) =>
  atom((get) => get(spansAtom)[index]),
);
const widthAtom = atomFamily((index: number) =>
  atom((get) => {
    const { startTime, endTime } = get(spanAtom(index));
    const maxTime = get(maxTimeAtom);
    const totalDuration = get(totalDurationAtom);
    return toPercent(((endTime ?? maxTime) - startTime) / totalDuration);
  }),
);
const offsetStartAtom = atomFamily((index: number) =>
  atom((get) => {
    const { startTime } = get(spanAtom(index));
    const minTime = get(minTimeAtom);
    const totalDuration = get(totalDurationAtom);
    return toPercent((startTime - minTime) / totalDuration);
  }),
);
const spanStyleAtom = atomFamily((index: number) =>
  atom((get) => {
    const width = get(widthAtom(index));
    const offsetStart = get(offsetStartAtom(index));
    return { width, marginInlineStart: offsetStart };
  }),
);
const focusedSpanIndexAtom = atom<number>(0);
const hasFocusedSpanAtom = atom(
  (get) => get(focusedSpanIndexAtom) !== undefined,
);
const knownFocusedSpanAtom = atom((get) => {
  const index = get(focusedSpanIndexAtom);
  if (index === undefined) throw new Error("focusedSpanIndex not found");
  return get(spanAtom(index));
});
const focusSpanAtom = atomFamily((index: number) =>
  atom(null, (_get, set) => {
    set(focusedSpanIndexAtom, index);
  }),
);
const isFocusedAtom = atomFamily((index: number) =>
  atom((get) => get(focusedSpanIndexAtom) === index),
);

/*
 * 1. View span details, show meta
 * 2. Show metrics info for gauges, line chart
 * 3. Show vertical lines for log / counters on the span, show list in details with lines representing time
 */
