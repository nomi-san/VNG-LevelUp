import { execFile, type ChildProcess, type ExecFileException } from "child_process";

import { genRandomString } from "@src/main/utils/crypto";

import { execAsAdmin } from "./utils";

export class DetachedGameSession {
  sessionID: string;

  private filePath: string;
  private appProcess: ChildProcess | null;

  public shouldExecAsAdmin: boolean;
  public onTerminate: () => void;

  constructor({
    filePath,
    onTerminate,
    shouldExecAsAdmin,
  }: {
    shouldExecAsAdmin: boolean;
    filePath: string;
    onTerminate: () => void;
  }) {
    this.sessionID = genRandomString(32);

    this.filePath = filePath;
    this.onTerminate = onTerminate;
    this.appProcess = null;
    this.shouldExecAsAdmin = shouldExecAsAdmin;
  }

  start(params: string[]): void {
    if (this.isStarted()) {
      return;
    }
    return this._start(params);
  }

  stop(): void {
    if (!this.isStarted()) {
      return;
    }
    this.cleanUp(true);
  }

  public isStarted(): boolean {
    return this.appProcess != null;
  }

  //powershell.exe -command 'Start-Process \"D:\\JXMax\\Vo Lam Truyen Ky MAX\\Game\\jxsj3_win\\jxsj3.exe\"'
  private _start(params: string[]): void {
    try {
      if (this.shouldExecAsAdmin) {
        this.appProcess = execAsAdmin(this.filePath, params, (err, stdout, stderr) => {
          this._onTerminate(err, stdout, stderr);
        });
      } else {
        this.appProcess = execFile(this.filePath, params, (err, stdout, stderr) => {
          this._onTerminate(err, stdout, stderr);
        });
      }
    } catch (err) {
      console.error(`error executing file ${err}`);
      this.cleanUp();
      throw new Error("failed to execute file");
    }

    console.info(`Session started pid ${this.appProcess.pid}`);
  }

  private _onTerminate(error: ExecFileException | null, stdout: string, stderr: string): void {
    this.onTerminate();
    console.info(
      `Game session terminated. Sid: ${this.sessionID}, err: ${error}, stdout: ${stdout}, stderr: ${stderr}`,
    );
    this.cleanUp();
  }

  private cleanUp(killsProcess: boolean = false): void {
    if (this.appProcess != null && killsProcess) {
      if (!this.appProcess.kill()) {
        console.error(`Failed to kill pid=${this.appProcess.pid}`);
      }
    }
    this.appProcess = null;
  }
}
