export function isDevEnvironment(): boolean {
  return import.meta.env.MODE === "test";
}
