import stream from 'stream';
import { Artifact } from '../model';

export type TarInputArgs = { argv: string[]; input: string } | { file: string };

export interface Compression {
  /**
   * inflate decompresses an input stream (usually an in-progress artifact download), writing decompressed files to disk
   * at the given outputPath (usually the working dir)
   */
  inflate(options: { input: stream.Readable; outputPath?: string; verbose?: boolean }): Promise<unknown>;

  /**
   * deflate doesn't do anything, but rather returns a shell script, split into arguments
   *
   * The script receives a tar on stdin, and deflates it into a compressed artifact
   */
  deflate(output: Artifact): Promise<string[]>;
}
