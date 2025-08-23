/**
 * Snapshot testing utilities for UI consistency
 */

import { RenderResult } from '@testing-library/react';

export interface SnapshotOptions {
  name?: string;
  props?: Record<string, any>;
  state?: Record<string, any>;
  excludeProps?: string[];
  includeProps?: string[];
  serializer?: (tree: any) => any;
}

/**
 * Creates a snapshot test for a component
 */
export const createSnapshot = (renderResult: RenderResult, options: SnapshotOptions = {}) => {
  const { name = 'default', serializer } = options;

  let snapshot = renderResult.container.firstChild;

  if (serializer) {
    snapshot = serializer(snapshot);
  }

  expect(snapshot).toMatchSnapshot(name);
};

/**
 * Creates multiple snapshots for different component states
 */
export const createStateSnapshots = (
  renderFn: (state: any) => RenderResult,
  states: Record<string, any>,
  options: SnapshotOptions = {}
) => {
  Object.entries(states).forEach(([stateName, stateValue]) => {
    const result = renderFn(stateValue);
    createSnapshot(result, {
      ...options,
      name: `${options.name || 'component'}-${stateName}`,
    });
    result.unmount();
  });
};

/**
 * Creates snapshots for different prop combinations
 */
export const createPropSnapshots = (
  renderFn: (props: any) => RenderResult,
  propCombinations: Record<string, any>,
  options: SnapshotOptions = {}
) => {
  Object.entries(propCombinations).forEach(([combinationName, props]) => {
    const result = renderFn(props);
    createSnapshot(result, {
      ...options,
      name: `${options.name || 'component'}-${combinationName}`,
    });
    result.unmount();
  });
};

/**
 * Creates responsive snapshots for different screen sizes
 */
export const createResponsiveSnapshots = (
  renderFn: () => RenderResult,
  breakpoints: Record<string, { width: number; height: number }> = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
  },
  options: SnapshotOptions = {}
) => {
  Object.entries(breakpoints).forEach(([breakpointName, dimensions]) => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: dimensions.width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: dimensions.height,
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));

    const result = renderFn();
    createSnapshot(result, {
      ...options,
      name: `${options.name || 'component'}-${breakpointName}`,
    });
    result.unmount();
  });
};

/**
 * Creates theme-based snapshots
 */
export const createThemeSnapshots = (
  renderFn: (theme: string) => RenderResult,
  themes: string[] = ['light', 'dark'],
  options: SnapshotOptions = {}
) => {
  themes.forEach(theme => {
    const result = renderFn(theme);
    createSnapshot(result, {
      ...options,
      name: `${options.name || 'component'}-${theme}-theme`,
    });
    result.unmount();
  });
};

/**
 * Snapshot serializer for removing dynamic content
 */
export const createCleanSerializer = (
  excludeAttributes: string[] = ['data-testid', 'class'],
  excludeContent: RegExp[] = [/^\d{4}-\d{2}-\d{2}/, /\d+ms$/] // dates, durations
) => {
  return (tree: any): any => {
    if (!tree || typeof tree !== 'object') {
      return tree;
    }

    if (tree.props) {
      const cleanProps = { ...tree.props };
      excludeAttributes.forEach(attr => {
        delete cleanProps[attr];
      });
      tree = { ...tree, props: cleanProps };
    }

    if (tree.children) {
      tree.children = tree.children.map((child: any) => {
        if (typeof child === 'string') {
          // Remove dynamic content based on patterns
          let cleanChild = child;
          excludeContent.forEach(pattern => {
            cleanChild = cleanChild.replace(pattern, '[DYNAMIC_CONTENT]');
          });
          return cleanChild;
        }
        return createCleanSerializer(excludeAttributes, excludeContent)(child);
      });
    }

    return tree;
  };
};

/**
 * Compares snapshots and provides detailed diff information
 */
export const compareSnapshots = (
  snapshot1: any,
  snapshot2: any,
  options: { ignoreWhitespace?: boolean; ignoreAttributes?: string[] } = {}
) => {
  const { ignoreWhitespace = true, ignoreAttributes = [] } = options;

  const normalize = (snapshot: any): any => {
    if (typeof snapshot === 'string') {
      return ignoreWhitespace ? snapshot.replace(/\s+/g, ' ').trim() : snapshot;
    }

    if (snapshot && typeof snapshot === 'object') {
      const normalized = { ...snapshot };

      if (normalized.props) {
        const cleanProps = { ...normalized.props };
        ignoreAttributes.forEach(attr => {
          delete cleanProps[attr];
        });
        normalized.props = cleanProps;
      }

      if (normalized.children) {
        normalized.children = normalized.children.map(normalize);
      }

      return normalized;
    }

    return snapshot;
  };

  const norm1 = normalize(snapshot1);
  const norm2 = normalize(snapshot2);

  return {
    areEqual: JSON.stringify(norm1) === JSON.stringify(norm2),
    snapshot1: norm1,
    snapshot2: norm2,
  };
};

/**
 * Utility for updating snapshots in bulk
 */
export const updateSnapshots = (testSuite: string, updateAll: boolean = false) => {
  if (updateAll) {
    console.log(`Updating all snapshots for test suite: ${testSuite}`);
    // This would typically integrate with Jest's snapshot update mechanism
  }
};

/**
 * Snapshot test helper for async components
 */
export const createAsyncSnapshot = async (
  renderFn: () => Promise<RenderResult>,
  options: SnapshotOptions = {}
) => {
  const result = await renderFn();
  createSnapshot(result, options);
  result.unmount();
};

/**
 * Creates snapshots for error states
 */
export const createErrorSnapshots = (
  renderFn: (shouldError: boolean, errorMessage?: string) => RenderResult,
  errorScenarios: Record<string, string> = {
    'network-error': 'Network request failed',
    'validation-error': 'Invalid input provided',
    'permission-error': 'Access denied',
  },
  options: SnapshotOptions = {}
) => {
  // Success state
  const successResult = renderFn(false);
  createSnapshot(successResult, {
    ...options,
    name: `${options.name || 'component'}-success`,
  });
  successResult.unmount();

  // Error states
  Object.entries(errorScenarios).forEach(([errorType, errorMessage]) => {
    const errorResult = renderFn(true, errorMessage);
    createSnapshot(errorResult, {
      ...options,
      name: `${options.name || 'component'}-${errorType}`,
    });
    errorResult.unmount();
  });
};

/**
 * Creates snapshots for loading states
 */
export const createLoadingSnapshots = (
  renderFn: (isLoading: boolean) => RenderResult,
  options: SnapshotOptions = {}
) => {
  // Loading state
  const loadingResult = renderFn(true);
  createSnapshot(loadingResult, {
    ...options,
    name: `${options.name || 'component'}-loading`,
  });
  loadingResult.unmount();

  // Loaded state
  const loadedResult = renderFn(false);
  createSnapshot(loadedResult, {
    ...options,
    name: `${options.name || 'component'}-loaded`,
  });
  loadedResult.unmount();
};

/**
 * Snapshot regression test utility
 */
export const createRegressionTest = (
  componentName: string,
  renderFn: () => RenderResult,
  baselineSnapshot?: any
) => {
  return () => {
    const result = renderFn();
    const currentSnapshot = result.container.firstChild;

    if (baselineSnapshot) {
      const comparison = compareSnapshots(currentSnapshot, baselineSnapshot);
      if (!comparison.areEqual) {
        console.warn(`Regression detected in ${componentName}`);
        console.log('Current:', comparison.snapshot1);
        console.log('Baseline:', comparison.snapshot2);
      }
      expect(comparison.areEqual).toBe(true);
    } else {
      // Create new baseline
      expect(currentSnapshot).toMatchSnapshot(`${componentName}-baseline`);
    }

    result.unmount();
  };
};

/**
 * Utility for visual regression testing integration
 */
export const createVisualRegressionTest = (
  componentName: string,
  renderFn: () => RenderResult,
  options: {
    threshold?: number;
    includeAA?: boolean;
    delay?: number;
  } = {}
) => {
  return async () => {
    const { threshold = 0.1, delay = 0 } = options;

    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const result = renderFn();

    // This would integrate with visual regression testing tools
    // like Percy, Chromatic, or custom screenshot comparison
    const screenshot = await takeScreenshot(result.container);

    expect(screenshot).toMatchVisualSnapshot(componentName, {
      threshold,
    });

    result.unmount();
  };
};

// Mock screenshot function (would be implemented with actual screenshot tool)
const takeScreenshot = async (element: Element): Promise<string> => {
  // This would use tools like Puppeteer, Playwright, or browser APIs
  return 'mock-screenshot-data';
};

// Mock visual snapshot matcher (would be implemented with actual tool)
declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchVisualSnapshot(name: string, options?: { threshold: number }): R;
    }
  }
}
