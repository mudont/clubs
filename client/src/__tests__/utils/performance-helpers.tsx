/**
 * Performance testing utilities for measuring component render times and memory usage
 */

import { RenderResult } from '@testing-library/react';

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: {
    before: number;
    after: number;
    delta: number;
  };
  reRenderTime?: number;
  mountTime?: number;
  unmountTime?: number;
}

export interface PerformanceTestOptions {
  measureMemory?: boolean;
  iterations?: number;
  warmupRuns?: number;
  threshold?: {
    renderTime?: number;
    memoryDelta?: number;
  };
}

/**
 * Measures the performance of a component render
 */
export const measureRenderPerformance = async (
  renderFn: () => RenderResult,
  options: PerformanceTestOptions = {}
): Promise<PerformanceMetrics> => {
  const {
    measureMemory = false,
    iterations = 1,
    warmupRuns = 0,
    threshold = {},
  } = options;

  // Warmup runs to stabilize performance
  for (let i = 0; i < warmupRuns; i++) {
    const result = renderFn();
    result.unmount();
  }

  const metrics: PerformanceMetrics = {
    renderTime: 0,
  };

  let totalRenderTime = 0;
  let memoryBefore = 0;
  let memoryAfter = 0;

  for (let i = 0; i < iterations; i++) {
    // Measure memory before render
    if (measureMemory && performance.memory) {
      memoryBefore += performance.memory.usedJSHeapSize;
    }

    // Measure render time
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();

    totalRenderTime += (endTime - startTime);

    // Measure memory after render
    if (measureMemory && performance.memory) {
      memoryAfter += performance.memory.usedJSHeapSize;
    }

    result.unmount();
  }

  metrics.renderTime = totalRenderTime / iterations;

  if (measureMemory && performance.memory) {
    metrics.memoryUsage = {
      before: memoryBefore / iterations,
      after: memoryAfter / iterations,
      delta: (memoryAfter - memoryBefore) / iterations,
    };
  }

  // Check thresholds
  if (threshold.renderTime && metrics.renderTime > threshold.renderTime) {
    console.warn(`Render time ${metrics.renderTime}ms exceeds threshold ${threshold.renderTime}ms`);
  }

  if (threshold.memoryDelta && metrics.memoryUsage && metrics.memoryUsage.delta > threshold.memoryDelta) {
    console.warn(`Memory delta ${metrics.memoryUsage.delta} bytes exceeds threshold ${threshold.memoryDelta} bytes`);
  }

  return metrics;
};

/**
 * Measures re-render performance
 */
export const measureReRenderPerformance = async (
  renderFn: () => RenderResult,
  reRenderFn: (result: RenderResult) => void,
  options: PerformanceTestOptions = {}
): Promise<PerformanceMetrics> => {
  const { iterations = 1, warmupRuns = 0 } = options;

  // Warmup
  for (let i = 0; i < warmupRuns; i++) {
    const result = renderFn();
    reRenderFn(result);
    result.unmount();
  }

  let totalReRenderTime = 0;

  for (let i = 0; i < iterations; i++) {
    const result = renderFn();

    const startTime = performance.now();
    reRenderFn(result);
    const endTime = performance.now();

    totalReRenderTime += (endTime - startTime);
    result.unmount();
  }

  return {
    renderTime: 0,
    reRenderTime: totalReRenderTime / iterations,
  };
};

/**
 * Measures component mount and unmount performance
 */
export const measureMountUnmountPerformance = async (
  renderFn: () => RenderResult,
  options: PerformanceTestOptions = {}
): Promise<PerformanceMetrics> => {
  const { iterations = 1, warmupRuns = 0 } = options;

  // Warmup
  for (let i = 0; i < warmupRuns; i++) {
    const result = renderFn();
    result.unmount();
  }

  let totalMountTime = 0;
  let totalUnmountTime = 0;

  for (let i = 0; i < iterations; i++) {
    // Measure mount time
    const mountStartTime = performance.now();
    const result = renderFn();
    const mountEndTime = performance.now();

    totalMountTime += (mountEndTime - mountStartTime);

    // Measure unmount time
    const unmountStartTime = performance.now();
    result.unmount();
    const unmountEndTime = performance.now();

    totalUnmountTime += (unmountEndTime - unmountStartTime);
  }

  return {
    renderTime: 0,
    mountTime: totalMountTime / iterations,
    unmountTime: totalUnmountTime / iterations,
  };
};

/**
 * Creates a performance benchmark for comparing different implementations
 */
export const createPerformanceBenchmark = (
  name: string,
  implementations: Record<string, () => RenderResult>,
  options: PerformanceTestOptions = {}
) => {
  return async (): Promise<Record<string, PerformanceMetrics>> => {
    const results: Record<string, PerformanceMetrics> = {};

    console.log(`Running performance benchmark: ${name}`);

    for (const [implName, renderFn] of Object.entries(implementations)) {
      console.log(`  Testing implementation: ${implName}`);

      const metrics = await measureRenderPerformance(renderFn, options);
      results[implName] = metrics;

      console.log(`    Render time: ${metrics.renderTime.toFixed(2)}ms`);
      if (metrics.memoryUsage) {
        console.log(`    Memory delta: ${metrics.memoryUsage.delta} bytes`);
      }
    }

    return results;
  };
};

/**
 * Utility to measure performance of large dataset rendering
 */
export const measureLargeDatasetPerformance = async (
  renderFn: (dataSize: number) => RenderResult,
  dataSizes: number[],
  options: PerformanceTestOptions = {}
): Promise<Record<number, PerformanceMetrics>> => {
  const results: Record<number, PerformanceMetrics> = {};

  for (const size of dataSizes) {
    console.log(`Testing with dataset size: ${size}`);

    const metrics = await measureRenderPerformance(
      () => renderFn(size),
      options
    );

    results[size] = metrics;
    console.log(`  Render time: ${metrics.renderTime.toFixed(2)}ms`);
  }

  return results;
};

/**
 * Performance assertion helpers
 */
export const expectPerformance = (metrics: PerformanceMetrics) => ({
  toBeUnder: (threshold: number) => {
    expect(metrics.renderTime).toBeLessThan(threshold);
  },

  toBeWithinRange: (min: number, max: number) => {
    expect(metrics.renderTime).toBeGreaterThanOrEqual(min);
    expect(metrics.renderTime).toBeLessThanOrEqual(max);
  },

  memoryUsageToBeUnder: (threshold: number) => {
    if (!metrics.memoryUsage) {
      throw new Error('Memory usage not measured');
    }
    expect(metrics.memoryUsage.delta).toBeLessThan(threshold);
  },

  reRenderToBeUnder: (threshold: number) => {
    if (metrics.reRenderTime === undefined) {
      throw new Error('Re-render time not measured');
    }
    expect(metrics.reRenderTime).toBeLessThan(threshold);
  },
});

/**
 * Utility to profile component with React DevTools Profiler
 */
export const profileComponent = (
  Component: React.ComponentType<any>,
  props: any = {},
  onRender?: (id: string, phase: string, actualDuration: number) => void
) => {
  const Profiler = React.Profiler;

  return (
    <Profiler id="test-profiler" onRender={onRender || (() => {})}>
      <Component {...props} />
    </Profiler>
  );
};

/**
 * Memory leak detection utility
 */
export const detectMemoryLeaks = async (
  renderFn: () => RenderResult,
  iterations: number = 100
): Promise<{ hasLeak: boolean; memoryGrowth: number }> => {
  if (!performance.memory) {
    console.warn('Memory measurement not available in this environment');
    return { hasLeak: false, memoryGrowth: 0 };
  }

  const initialMemory = performance.memory.usedJSHeapSize;
  const results: RenderResult[] = [];

  // Create many instances
  for (let i = 0; i < iterations; i++) {
    results.push(renderFn());
  }

  const midMemory = performance.memory.usedJSHeapSize;

  // Cleanup all instances
  results.forEach(result => result.unmount());

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  // Wait a bit for cleanup
  await new Promise(resolve => setTimeout(resolve, 100));

  const finalMemory = performance.memory.usedJSHeapSize;
  const memoryGrowth = finalMemory - initialMemory;

  // Consider it a leak if memory grew by more than 1MB after cleanup
  const hasLeak = memoryGrowth > 1024 * 1024;

  return { hasLeak, memoryGrowth };
};

/**
 * Performance test decorator for Jest tests
 */
export const performanceTest = (
  threshold: number,
  options: PerformanceTestOptions = {}
) => {
  return (testFn: () => Promise<void> | void) => {
    return async () => {
      const startTime = performance.now();
      await testFn();
      const endTime = performance.now();

      const duration = endTime - startTime;

      if (duration > threshold) {
        console.warn(`Test exceeded performance threshold: ${duration}ms > ${threshold}ms`);
      }

      expect(duration).toBeLessThan(threshold);
    };
  };
};

// React import for Profiler
import React from 'react';
