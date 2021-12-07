import stream from 'stream';
import { ExecaChildProcess, ExecaReturnValue } from 'execa';

export interface Compression {
  extensions: string[];
  enabled(): Promise<boolean>;

  /**
   * inflate just does the inflation, in place
   */
  inflate(input: stream.Readable, outputPath?: string): Promise<ExecaReturnValue>;

  /**
   * deflate returns a child process for awaiting, because we probably want to redirect its stdout
   */
  deflate(input: stream.Readable): ExecaChildProcess;
}
