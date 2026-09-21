export class BraidError extends Error {
  readonly line: number;

  constructor(message: string, line: number) {
    super(`line ${line}: ${message}`);
    this.name = "BraidError";
    this.line = line;
  }
}
