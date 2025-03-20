import { exec, type ChildProcess, type ExecException } from "child_process";

// powershell.exe -command "Start-Process 'D:\Games\KiemTheOrigin\Kiếm Thế Origin.exe'"
export const execAsAdmin = (
  filePath: string,
  _args: string[],
  callback?: (error: ExecException | null, stdout: string, stderr: string) => void,
): ChildProcess => {
  const command = `powershell.exe -command "Start-Process '${filePath}'"`;
  const child = exec(command, {}, callback);

  return child;
};
