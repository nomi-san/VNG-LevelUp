import nxx from "nexus-cxx";

import nodeLogger from "@src/logger/serverLogger";

export type ContextID = string;

export interface NexusAuthInfo {
  grantType: string;
  code: string;
  codeChallenge: string;
  codeVerifier: string;
  redirectUri: string;
}

export interface NexusContext {
  clientContextID: ContextID;
  nexusVersion: number;
  authInfo: NexusAuthInfo;
}

export interface ClientContext {
  clientVersion: number;
}

export class NIPCSession {
  private nexusCtxID: ContextID;
  private nexusCtx: NexusContext;
  private nexusCtxFileHandle?: unknown;
  private isStarted: boolean = false;
  private clientCtx?: ClientContext | null;

  constructor(nexCtxID: ContextID, nexCtx: NexusContext) {
    this.nexusCtxID = nexCtxID;
    this.nexusCtx = nexCtx;
  }

  getNexusContextID(): ContextID {
    return this.nexusCtxID;
  }

  getNexusContext(): NexusContext {
    return this.nexusCtx;
  }

  getClientContext(ignoresCache: boolean = false): ClientContext | null {
    if (this.clientCtx != null && !ignoresCache) {
      return this.clientCtx;
    }
    this.clientCtx = this._getClientContext();
    return this.clientCtx;
  }

  start(): void {
    if (this.isStarted) {
      return;
    }
    this._start();
    this.isStarted = true;
  }

  stop(): void {
    this.cleanUp();
  }

  isConnected(): boolean {
    if (!this.isStarted) {
      return false;
    }
    try {
      const fileHandle = nxx.openFileMapping(this.nexusCtx.clientContextID);
      if (!nxx.closeHandle(fileHandle)) {
        logger.error(`Failed to close file handle ${fileHandle}`);
      }
      return true;
    } catch (err) {
      logger.error(`Error reading client context ${err}`);
      return false;
    }
  }

  private _start(): void {
    const lines: Record<string, string> = {};

    lines["NEXUS_VERSION"] = `${this.nexusCtx.nexusVersion}`;
    lines["CLIENT_CTX_ID"] = this.nexusCtx.clientContextID;
    lines["GRANT_TYPE"] = this.nexusCtx.authInfo.grantType;
    lines["CODE"] = this.nexusCtx.authInfo.code;
    lines["CODE_CHALLENGE"] = this.nexusCtx.authInfo.codeChallenge;
    lines["CODE_VERIFIER"] = this.nexusCtx.authInfo.codeVerifier;
    lines["REDIRECT_URI"] = this.nexusCtx.authInfo.redirectUri;

    const data = generateContextData(lines);
    const processHandle = nxx.openProcess(process.pid).handle;

    const fileHandle = nxx.createFileMappingA(this.nexusCtxID, data.length, nxx.PAGE_READWRITE);
    this.nexusCtxFileHandle = fileHandle;

    const baseAddress = nxx.mapViewOfFile2(processHandle, fileHandle, 0, 0, nxx.PAGE_READWRITE);
    const buffer = Buffer.from(data, "utf8");
    const success = nxx.writeBuffer(processHandle, baseAddress, buffer);

    logger.info(`write buffer: ${success}, baseAddress: ${baseAddress}`);

    if (!nxx.closeHandle(processHandle)) {
      logger.error(`Failed to close process handle ${processHandle}`);
      this.cleanUp();
      throw new Error("failed to close process handle");
    }
  }

  private _getClientContext(): ClientContext | null {
    if (!this.isStarted) {
      return null;
    }
    const fileHandle = nxx.openFileMapping(this.nexusCtx.clientContextID);
    const processHandle = nxx.openProcess(process.pid).handle;
    const baseAddress = nxx.mapViewOfFile2(processHandle, fileHandle, 0, 0, nxx.PAGE_READONLY);

    // Todo(Bao): knowing the exact buffer size to read is always better.
    // However the client ctx data shouldn't be too large,
    // so reading 1kb here should be okay in most cases.
    const buffer = nxx.readBuffer(processHandle, baseAddress, 1000 /*1kb*/);
    const errors: string[] = [];

    if (!nxx.closeHandle(fileHandle)) {
      logger.error(`Failed to close file handle ${fileHandle}`);
      errors.push("failed to close file handle");
    }

    if (!nxx.closeHandle(processHandle)) {
      logger.error(`Failed to close process handle ${processHandle}`);
      errors.push("failed to close process handle");
    }

    if (errors.length > 0) {
      throw new Error(errors[0]);
    }

    const records = parseContextData(buffer.toString());
    const clientVer = parseInt(records["CLIENT_VERSION"]);

    if (isNaN(clientVer)) {
      throw new Error(`invalid client version: ${clientVer}`);
    }

    return {
      clientVersion: clientVer,
    };
  }

  private cleanUp(): void {
    if (this.nexusCtxFileHandle != null) {
      if (!nxx.closeHandle(this.nexusCtxFileHandle)) {
        logger.error(`Failed to close file handle ${this.nexusCtxFileHandle}`);
      }
      this.nexusCtxFileHandle = null;
    }
  }
}

class logger {
  static info(msg: string): void {
    nodeLogger.log(msg);
  }

  static error(msg: string): void {
    nodeLogger.error(msg);
  }
}

function parseContextData(data: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = data.split("\n");

  lines.forEach((line) => {
    const idx = line.indexOf("=");
    if (idx !== -1) {
      const key = line.substring(0, idx).trim();
      const value = line.substring(idx + 1).trim();
      result[key] = value;
    }
  });

  return result;
}

function generateContextData(records: Record<string, string>): string {
  const lines: string[] = [];
  for (const key in records) {
    lines.push(key + "=" + records[key]);
  }
  return lines.join("\n");
}
