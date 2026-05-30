/**
 * Performance Testing Helper - Monitor and log data loading performance
 * Giúp track thời gian load dữ liệu và so sánh tuần tự vs song song
 */

interface PerformanceMetric {
  timestamp: string;
  pageName: string;
  duration: number;
  method: 'sequential' | 'parallel';
  dataCount?: Record<string, number>;
}

const performanceMetrics: PerformanceMetric[] = [];

/**
 * Log performance metric to browser console and storage
 */
export const logPerformanceMetric = (
  pageName: string,
  duration: number,
  method: 'sequential' | 'parallel' = 'parallel',
  dataCount?: Record<string, number>
) => {
  const metric: PerformanceMetric = {
    timestamp: new Date().toISOString(),
    pageName,
    duration,
    method,
    dataCount,
  };

  performanceMetrics.push(metric);

  // Log to console
  const methodEmoji = method === 'sequential' ? '⏳' : '⚡';
  if (import.meta.env.DEV) {
    console.log(
      `${methodEmoji} [Performance] ${pageName}: ${duration.toFixed(2)}ms (${method})`
    );
  }

  // Log to localStorage for later analysis
  try {
    const existing = localStorage.getItem('performanceMetrics');
    const parsed = existing ? JSON.parse(existing) : [];
    parsed.push(metric);
    // Keep only last 100 metrics
    localStorage.setItem('performanceMetrics', JSON.stringify(parsed.slice(-100)));
  } catch (e) {
    // ignore localStorage errors
  }
};

/**
 * Get all collected metrics
 */
export const getPerformanceMetrics = (): PerformanceMetric[] => {
  try {
    const stored = localStorage.getItem('performanceMetrics');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return performanceMetrics;
  }
};

/**
 * Get performance summary
 */
export const getPerformanceSummary = () => {
  const metrics = getPerformanceMetrics();
  if (metrics.length === 0) return null;

  const pageMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.pageName]) {
      acc[metric.pageName] = {
        sequential: [],
        parallel: [],
      };
    }
    acc[metric.pageName][metric.method].push(metric.duration);
    return acc;
  }, {} as Record<string, { sequential: number[]; parallel: number[] }>);

  const summary = Object.entries(pageMetrics).map(([pageName, durations]) => {
    const seqAvg = durations.sequential.length > 0
      ? durations.sequential.reduce((a, b) => a + b, 0) / durations.sequential.length
      : 0;
    const parAvg = durations.parallel.length > 0
      ? durations.parallel.reduce((a, b) => a + b, 0) / durations.parallel.length
      : 0;
    const improvement = seqAvg > 0 ? ((seqAvg - parAvg) / seqAvg * 100) : 0;

    return {
      pageName,
      sequentialAvg: seqAvg,
      parallelAvg: parAvg,
      improvementPercent: improvement,
      sequentialCount: durations.sequential.length,
      parallelCount: durations.parallel.length,
    };
  });

  return summary;
};

/**
 * Print performance report to console
 */
export const printPerformanceReport = () => {
  const summary = getPerformanceSummary();
  if (!summary || summary.length === 0) {
    if (import.meta.env.DEV) console.log('❌ No performance metrics collected yet');
    return;
  }

  if (import.meta.env.DEV) {
    console.log('\n📊 ========== PERFORMANCE REPORT ==========');
    console.log(`📈 Total pages monitored: ${summary.length}`);
  }

  let totalImprovement = 0;
  let pagesImproved = 0;

  summary.forEach((item) => {
    const icon = item.improvementPercent > 0 ? '✅' : '⚠️';
    if (import.meta.env.DEV) {
      console.log(
        `${icon} ${item.pageName}:`
      );
      console.log(
        `   📊 Sequential avg: ${item.sequentialAvg.toFixed(2)}ms (${item.sequentialCount} samples)`
      );
      console.log(
        `   ⚡ Parallel avg: ${item.parallelAvg.toFixed(2)}ms (${item.parallelCount} samples)`
      );
      console.log(
        `   📈 Improvement: ${item.improvementPercent.toFixed(1)}%`
      );
    }

    if (item.improvementPercent > 0) {
      totalImprovement += item.improvementPercent;
      pagesImproved++;
    }
  });

  if (pagesImproved > 0 && import.meta.env.DEV) {
    const avgImprovement = totalImprovement / pagesImproved;
    console.log(`\n🎉 Average improvement: ${avgImprovement.toFixed(1)}%`);
  }

  if (import.meta.env.DEV) console.log('========================================\n');
};

/**
 * Clear collected metrics
 */
export const clearPerformanceMetrics = () => {
  performanceMetrics.length = 0;
  try {
    localStorage.removeItem('performanceMetrics');
  } catch (e) {
    // ignore
  }
  if (import.meta.env.DEV) console.log('🧹 Performance metrics cleared');
};

/**
 * Export metrics as CSV for analysis
 */
export const exportMetricsAsCSV = () => {
  const metrics = getPerformanceMetrics();
  if (metrics.length === 0) {
    if (import.meta.env.DEV) console.log('❌ No metrics to export');
    return;
  }

  let csv = 'Timestamp,Page Name,Duration (ms),Method\n';
  metrics.forEach((metric) => {
    csv += `${metric.timestamp},${metric.pageName},${metric.duration.toFixed(2)},${metric.method}\n`;
  });

  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `performance-metrics-${Date.now()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);

  if (import.meta.env.DEV) console.log(`📥 Exported ${metrics.length} metrics to CSV`);
};
