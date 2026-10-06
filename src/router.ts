import { useEffect, useState, type MouseEvent } from "react";

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function navigate(to: string) {
  window.history.pushState({}, "", to);
  notify();
}

export function replace(to: string) {
  window.history.replaceState({}, "", to);
  notify();
}

export function usePath() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const sync = () => setPath(window.location.pathname);
    listeners.add(sync);
    window.addEventListener("popstate", sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  return path;
}

export function followLink(event: MouseEvent<HTMLAnchorElement>, to: string) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  navigate(to);
}
