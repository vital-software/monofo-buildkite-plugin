import stream from 'stream';
import { ExecaReturnValue } from 'execa';

export interface Compression {
  extension: string;

  enabled(): Promise<boolean>;

  /**
   * inflate just does the inflation, in place
   */
  inflate(input: stream.Readable, outputPath?: string): Promise<ExecaReturnValue>;

  /**
   * deflate returns a child process for awaiting
   *
   * the stdout of the child process is expected to contain the deflated stream
   */
  deflate(input: stream.Readable): Promise<stream.Readable>;
}
