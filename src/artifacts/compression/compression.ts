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
   * deflate either takes a tar, or creates one on the fly, and passes this to a compression algorithm, outputting the
   * desired artifact
   */
  deflate(options: { output: Artifact; tarInputArgs: TarInputArgs }): Promise<unknown>;
}
