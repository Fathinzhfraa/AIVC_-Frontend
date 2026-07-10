const BASE = import.meta.env.PROD ? '/AIVC_-Frontend/' : '/';

export function asset(path) {
  if (!path) return path;
  return BASE + path.replace(/^\/+/, '');
}
