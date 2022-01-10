import stream from 'stream';
import { ExecaReturnValue } from 'execa';

export interface Compression {
  extension: string;

  /**
   * inflate just does the inflation, in place
   */
  inflate(input: stream.Readable, outputPath?: string): Promise<ExecaReturnValue>;

  /**
   * Returns a command (argv) that deflates from stdin to stdout
   */
  deflateCmd(): Promise<string[]>;
}
