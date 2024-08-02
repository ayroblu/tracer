# Tracer lib

A basic "tracing" implementation which produces a stream of events for common observability concerns.

This is designed as a catch all for all observability concerns, i.e. this data could be aggregated for metrics and logging concerns too.

The result can be thought of as a jsonl format file, a stream of newline delimited structs

### Basic idea for the structure of data

```
log - message
  {"ts": 123, "spanId": 234, "message": "log message"}
  {"ts": 123, "spanId": 234, "message": {"url": "http"}}
metric - counter, gauge (cpu), histogram (p99 request duration)
  You don't need histogram for traces cause they're opposite use cases
  {"ts": 123, "spanId": 234, "counter": "key/name"}
  {"ts": 123, "spanId": 234, "gauges": {"key/name": 123}}
trace - name, start, end (duration)
  {"ts": 123, "spanId": 345, "parentSpanId": 234, "processId": "browser", "trace": "start", "name": "/fetchData", "meta": {"userId": 748}}
  {"ts": 123, "spanId": 345, "trace": "end"}
```

