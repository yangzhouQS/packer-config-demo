type Cleaner = () => Promise<unknown> | unknown;

const cleaners: Cleaner[] = [];

/**
 * Add a cleaner to handle side effects
 */
export function onBeforeRestartServer(cleaner: Cleaner): void {
  cleaners.push(cleaner);
}
