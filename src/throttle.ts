export function throttle(fn: any, delay: number) {
  let wait = false;

  return (...args: any[]) => {
    if (!wait) {
      wait = true;
      setTimeout(() => {
        // @ts-ignore
        fn(...args);
        wait = false;
      }, delay);
    }
  };
}

export function debounce(fn: any, delay: number) {
  let timer: number | null = null;

  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    // @ts-ignore
    timer = setTimeout(() => fn(...args), delay);
  };
}
