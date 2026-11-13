import process from "node:process";

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function optionalFiniteNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function classifyMetrics(input = {}) {
  const metrics = {
    diskFreeGB: finiteNumber(input.diskFreeGB),
    diskFreePercent: optionalFiniteNumber(input.diskFreePercent),
    ramAvailableGB: finiteNumber(input.ramAvailableGB),
    ramAvailablePercent: finiteNumber(input.ramAvailablePercent),
    cpuPercent: finiteNumber(input.cpuPercent),
    pageFileUsagePercent: optionalFiniteNumber(input.pageFileUsagePercent),
    heavyProcessCount: finiteNumber(input.heavyProcessCount),
    heavyWorkingSetGB: optionalFiniteNumber(input.heavyWorkingSetGB),
    processCount: optionalFiniteNumber(input.processCount),
    uptimeHours: optionalFiniteNumber(input.uptimeHours),
    largestGeneratedFolderGB: finiteNumber(input.largestGeneratedFolderGB),
  };

  const critical = [];
  const warnings = [];

  if (metrics.diskFreeGB < 10 || (metrics.diskFreePercent !== null && metrics.diskFreePercent < 5)) {
    critical.push(
      `Free disk is critically low (${metrics.diskFreeGB} GB${metrics.diskFreePercent === null ? "" : ` / ${metrics.diskFreePercent}%`}).`,
    );
  } else if (
    metrics.diskFreeGB < 20 ||
    (metrics.diskFreePercent !== null && metrics.diskFreePercent < 10)
  ) {
    warnings.push(
      `Free disk is low (${metrics.diskFreeGB} GB${metrics.diskFreePercent === null ? "" : ` / ${metrics.diskFreePercent}%`}).`,
    );
  }

  if (metrics.ramAvailableGB < 1 || metrics.ramAvailablePercent < 5) {
    critical.push(
      `Available RAM is critically low (${metrics.ramAvailableGB} GB / ${metrics.ramAvailablePercent}%).`,
    );
  } else if (metrics.ramAvailableGB < 3 || metrics.ramAvailablePercent < 20) {
    warnings.push(
      `Available RAM is low (${metrics.ramAvailableGB} GB / ${metrics.ramAvailablePercent}%).`,
    );
  }

  if (metrics.cpuPercent >= 90) {
    warnings.push(`CPU load is high (${metrics.cpuPercent}%).`);
  }

  if (
    metrics.pageFileUsagePercent !== null &&
    metrics.pageFileUsagePercent >= 95 &&
    metrics.ramAvailablePercent < 10
  ) {
    critical.push(
      `Virtual-memory pressure is critical (${metrics.pageFileUsagePercent}% page file used).`,
    );
  } else if (metrics.pageFileUsagePercent !== null && metrics.pageFileUsagePercent >= 80) {
    warnings.push(`Page file usage is high (${metrics.pageFileUsagePercent}%).`);
  }

  if (metrics.heavyProcessCount >= 5) {
    warnings.push(`${metrics.heavyProcessCount} heavy/dev/browser processes are active.`);
  }

  if (metrics.largestGeneratedFolderGB >= 2) {
    warnings.push(
      `A regenerable/generated folder is large (${metrics.largestGeneratedFolderGB} GB).`,
    );
  }

  const state =
    critical.length > 0 ? "STOP_HEAVY_WORK" : warnings.length > 0 ? "CAUTION" : "HEALTHY";
  const reasons = [...critical, ...warnings];
  const recommendation =
    state === "STOP_HEAVY_WORK"
      ? "Use connector/cloud work only and resolve local disk/RAM pressure before heavy builds or indexing."
      : state === "CAUTION"
        ? "Reduce concurrency and close unnecessary agent-owned dev/browser sessions before heavy local work."
        : "Local headroom looks reasonable for one controlled heavy task at a time.";

  return { state, reasons, recommendation, metrics };
}

async function runCli() {
  if (!process.argv.includes("--classify-stdin")) {
    process.stderr.write("Use --classify-stdin with JSON metrics on stdin.\n");
    process.exitCode = 2;
    return;
  }

  let input = "";
  for await (const chunk of process.stdin) input += chunk;

  let metrics;
  try {
    metrics = JSON.parse(input || "{}");
  } catch {
    process.stderr.write("Invalid JSON metrics.\n");
    process.exitCode = 2;
    return;
  }

  process.stdout.write(`${JSON.stringify(classifyMetrics(metrics))}\n`);
}

if (process.argv[1]?.endsWith("pc-health-classifier.mjs")) {
  await runCli();
}
