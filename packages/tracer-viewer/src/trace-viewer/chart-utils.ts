import { XAxisProps } from "recharts";
import { scaleTime } from "d3-scale";
import { timeFormat } from "d3-time-format";
import {
  timeDay,
  timeHour,
  timeMinute,
  timeMonth,
  timeSecond,
  timeWeek,
  timeYear,
} from "d3-time";

// https://github.com/d3/d3-time-format
const formatMillisecond = timeFormat(".%L"),
  formatSecond = timeFormat(":%S"),
  formatMinute = timeFormat("%I:%M"),
  formatHour = timeFormat("%I %p"),
  formatDay = timeFormat("%a %d"),
  formatWeek = timeFormat("%b %d"),
  formatMonth = timeFormat("%B"),
  formatYear = timeFormat("%Y");

function multiFormat(date: Date): string {
  if (timeSecond(date) < date) {
    return formatMillisecond(date);
  }
  if (timeMinute(date) < date) {
    return formatSecond(date);
  }
  if (timeHour(date) < date) {
    return formatMinute(date);
  }
  if (timeDay(date) < date) {
    return formatHour(date);
  }
  if (timeMonth(date) < date) {
    if (timeWeek(date) < date) {
      return formatDay(date);
    }
    return formatWeek(date);
  }
  if (timeYear(date) < date) {
    return formatMonth(date);
  }
  return formatYear(date);
}

export function getXAxisArgs(data: { ts: number; value: number }[]) {
  const timeValues = data.map((row) => row.ts);
  // With .nice() we extend the domain nicely.
  const timeScale = scaleTime()
    .domain([Math.min(...timeValues), Math.max(...timeValues)])
    .nice();

  const xAxisArgs: XAxisProps = {
    domain: timeScale.domain().map((date) => date.valueOf()),
    scale: timeScale,
    type: "number",
    ticks: timeScale.ticks(5).map((date) => date.valueOf()),
    tickFormatter: multiFormat,
  };
  return xAxisArgs;
}
