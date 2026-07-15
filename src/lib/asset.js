const BASE = import.meta.env.BASE_URL;

export function asset(path) {
  if (!path) return path;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  return BASE + path.replace(/^\/+/, "");
}
