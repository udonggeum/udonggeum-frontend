/**
 * Vitest Type Definitions
 * Adds jest-dom matcher types to Vitest's expect
 */

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import 'vitest';

type VitestMatchers<T = unknown> = TestingLibraryMatchers<T, void>;

declare module 'vitest' {
  interface Assertion<T = unknown> extends VitestMatchers<T> {
    readonly _vitestMatchersBrand?: never;
  }
  interface AsymmetricMatchersContaining extends VitestMatchers<unknown> {
    readonly _vitestMatchersBrand?: never;
  }
}
