declare module 'lodash' {
  export interface DebouncedFunc<T extends (...args: any[]) => any> {
    (...args: Parameters<T>): ReturnType<T>;
    cancel(): void;
    flush(): ReturnType<T>;
  }

  export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait?: number,
    options?: {
      leading?: boolean;
      maxWait?: number;
      trailing?: boolean;
    }
  ): DebouncedFunc<T>;

  export function isEqual(value: any, other: any): boolean;

  // Add other lodash functions as needed
  export function throttle<T extends (...args: any[]) => any>(
    func: T,
    wait?: number,
    options?: {
      leading?: boolean;
      trailing?: boolean;
    }
  ): T;
} 