export interface GameSession {
  readonly sessionID: string;

  start(): void;
  stop(): void;
}
