# Performance Engineering

## Model Before Scripts

Do not treat a load script as a performance test by itself. Build these models first:

- Business model: core journeys, transaction mix, peak periods, user groups, arrival pattern, concurrency, and SLA/SLO.
- Data model: account pool, data volume, distribution, uniqueness, cleanup, cache warmness, and production representativeness.
- Environment model: topology, hardware, network, middleware, database, third parties, feature flags, and differences from production.
- Monitoring model: client, gateway, service, database, cache, queue, OS, JVM/runtime, container, network, and frontend metrics.
- Strategy model: smoke, baseline, load, stress, spike, soak, capacity, failover, degradation, or full-link test.
- Risk model: likely bottlenecks, safety limits, rollback plan, data safety, and production blast radius.
- Execution model: ramp-up, steady state, ramp-down, duration, think time, pacing, assertions, error thresholds, and retry policy.

## Metrics

Capture both user-facing and system-facing metrics:

- Response time: average, median, p90, p95, p99, max, and Apdex where useful.
- Throughput: TPS, QPS, requests/sec, jobs/sec, messages/sec, or business transactions/sec.
- Reliability: error rate, timeout rate, retry rate, HTTP status distribution, and failed business assertions.
- Resource: CPU, memory, GC, disk IO, network IO, connection pool, thread pool, queue depth, and lock wait.
- Database: slow SQL, execution time, QPS/TPS, cache hit rate, lock wait, connection count, and replication lag.
- Frontend: first visible signal, load timing, network waterfalls, JS errors, and long tasks where relevant.

## Execution Rules

- Validate scripts at low load before scaling.
- Use non-GUI or distributed mode for heavy JMeter-style load runs.
- Keep generators sized and monitored; generator saturation invalidates results.
- Separate script error from system error with assertions and logs.
- Keep test data realistic and isolated from production-sensitive records.
- Warm up caches when the test objective is steady-state capacity; keep cold-start tests separate.
- Change one major variable at a time during tuning.
- Record every run with config, build, dataset, environment, load shape, and monitoring window.

## Bottleneck Analysis

Use a narrowing loop:

1. Confirm the symptom with user-facing metrics.
2. Correlate time window with service, database, cache, queue, and infrastructure metrics.
3. Find the saturated resource or slow dependency.
4. Propose a single change or experiment.
5. Rerun the same workload to compare before/after.
6. Document tradeoffs and new limits.

## Report Audiences

For engineers, include traces, bottleneck evidence, logs, dashboards, and reproduction commands.

For managers, include capacity, risk, release recommendation, trend, and cost or scalability implication.

For business stakeholders, include user impact, SLA/SLO status, and operational readiness.
