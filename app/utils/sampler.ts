/**
 * Creates a function that samples calls at regular intervals and captures trailing calls.
 * - Drops calls that occur between sampling intervals
 * - Takes one call per sampling interval if available
 * - Captures the last call if no call was made during the interval
 *
 * @param fn The function to sample
 * @param sampleInterval How often to sample calls (in ms)
 * @returns The sampled function
 */
export function createSampler<T extends (...args: any[]) => any>(fn: T, sampleInterval: number): T {
  let lastTime = 0;
  let lastArgs: any[] | null = null;
  let timeout: NodeJS.Timeout | null = null;

  return function (this: any, ...args: any[]) {
    const now = Date.now();
    lastArgs = args;

    // If we're within the sample interval, just store the args
    if (now - lastTime < sampleInterval) {
      // Set up trailing call if not already set
      if (!timeout) {
        const timeoutId = setTimeout(
          () => {
            timeout = null;
            lastTime = Date.now();

            if (lastArgs) {
              fn.apply(this, lastArgs);
              lastArgs = null;
            }
          },
          sampleInterval - (now - lastTime),
        );
        timeout = timeoutId as unknown as NodeJS.Timeout;
      }

      return;
    }

    // Outside sample interval, call immediately
    lastTime = now;
    lastArgs = null;
    fn.apply(this, args);
  } as T;
}
