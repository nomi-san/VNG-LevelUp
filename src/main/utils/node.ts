export const getArgv = (key: string, sourceArgv: string[] = process.argv): string | null | true => {
  // Return true if the key exists and a value is undefined
  if (sourceArgv.includes(`--${key}`)) return true;

  const value = sourceArgv.find((element) => element.startsWith(`--${key}=`));

  // Return null if the key does not exist and a value is undefined
  if (!value) return null;

  return value.replace(`--${key}=`, "");
};
