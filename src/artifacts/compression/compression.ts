import stream from 'stream';
import { ExecaReturnValue } from 'execa';

export interface Compression {
  extension: string;

  /**
   * inflate just does the inflation, in place
   */
  inflate(input: stream.Readable, outputPath?: string): Promise<ExecaReturnValue>;

  /**
   * Returns a command (argv) that deflates from stdin to the given outputPath
   *
   * The return value is an argv that can be sent to a `sh -c`-style shell interpreter
   */
  deflateCmd(outputPath: string): Promise<string[]>;
}
