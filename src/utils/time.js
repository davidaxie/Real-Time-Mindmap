// Time utilities
export function now() {
  return performance.now();
}

export function nowMs() {
  return Date.now();
}

export function formatClock(ms) {
  return new Date(ms).toLocaleTimeString('en-US', { hour12: false });
}

export function formatISO(ms) {
  return new Date(ms).toISOString();
}

export function throttle(fn, ms) {
  let last = 0;
  return function (...args) {
    const now = nowMs();
    if (now - last >= ms) {
      last = now;
      return fn.apply(this, args);
    }
  };
}

export function debounce(fn, ms) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), ms);
  };
}

export function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    h = ((h << 5) - h) + char;
    h = h & h;
  }
  return h.toString(36);
}
