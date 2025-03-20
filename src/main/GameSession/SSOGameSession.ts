import { execFile, type ChildProcess, type ExecFileException } from "child_process";
import { v6 as uuidv6 } from "uuid";

import nodeLogger from "@src/logger/serverLogger";
import { NIPCSession, type NexusAuthInfo, type NexusContext } from "@src/main/NexIPC/NIPCSession";
import { genRandomString } from "@src/main/utils/crypto";

export interface SSOGameStartParams {
  codeChallenge: string;
  codeVerifier: string;
  code: string;
}
export class SSOGameSession {
  private sessionID: string;
  gameClientId: string;

  private filePath: string;
  private appDeeplink: string;
  private ipcSession: NIPCSession | null;
  private appProcess: ChildProcess | null;

  public onExecGame: () => void;
  public onTerminate: () => void;

  constructor({
    gameClientId,
    filePath,
    appDeeplink,
    onTerminate,
    onExecGame,
  }: {
    gameClientId: string;
    filePath: string;
    appDeeplink: string;
    onTerminate: () => void;
    onExecGame: () => void;
  }) {
    this.sessionID = genRandomString(32);

    this.gameClientId = gameClientId;
    this.filePath = filePath;
    this.appDeeplink = appDeeplink;
    this.ipcSession = null;
    this.appProcess = null;

    this.onTerminate = onTerminate;
    this.onExecGame = onExecGame;
  }

  start(params: SSOGameStartParams): Promise<void> | undefined {
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
    return this.ipcSession != null;
  }

  private async _start({ codeChallenge, codeVerifier, code }: SSOGameStartParams): Promise<void> {
    const grantType = "authorization_code";

    if (!code) return;

    const authInfo: NexusAuthInfo = {
      grantType: grantType,
      code: code,
      codeChallenge: codeChallenge,
      codeVerifier: codeVerifier,
      redirectUri: this.appDeeplink,
    };
    const nexusCtx: NexusContext = {
      nexusVersion: 1,
      authInfo: authInfo,
      clientContextID: generateUUID(),
    };
    this.ipcSession = new NIPCSession(this.sessionID, nexusCtx);

    this.onExecGame();

    try {
      this.ipcSession.start();
      nodeLogger.log(`ipc session started ${this.sessionID} code=${code}`);
    } catch (err) {
      nodeLogger.error(err, `error starting ipc session for game: ${this.gameClientId}`);
      this.cleanUp();
      throw new Error("failed to start ipc session");
    }

    try {
      const args = ["--sid", this.sessionID];
      this.appProcess = execFile(this.filePath, args, (err, stdout, stderr) => {
        this._onTerminate(err, stdout, stderr);
      });
    } catch (err) {
      nodeLogger.error(err, `error executing game: ${this.gameClientId}`);
      this.cleanUp();
      throw new Error("failed to execute file");
    }

    nodeLogger.log(`Session started ${this.sessionID}, pid ${this.appProcess.pid}`);
  }

  private cleanUp(killsProcess: boolean = false): void {
    if (this.ipcSession != null) {
      this.ipcSession.stop();
      this.ipcSession = null;
    }
    if (this.appProcess != null && killsProcess) {
      if (!this.appProcess.kill()) {
        nodeLogger.error(`Failed to kill pid=${this.appProcess.pid}`);
      }
    }
    this.appProcess = null;
  }

  private _onTerminate(error: ExecFileException | null, stdout: string, stderr: string): void {
    nodeLogger.log(
      `Game session terminated. Sid: ${this.sessionID}, err: ${error}, stdout: ${stdout}, stderr: ${stderr}`,
    );

    this.cleanUp();
    this.onTerminate();
  }
}

const generateUUID = (): string => {
  return uuidv6();
};
