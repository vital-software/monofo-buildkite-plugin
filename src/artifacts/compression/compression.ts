import stream from 'stream';
import execa from 'execa';
import { Artifact } from '../model';

export type TarInputArgs = { argv: string[]; input: string } | { file: string };

export interface Compression {
  /**
   * inflate decompresses an input stream (usually an in-progress artifact download), writing decompressed files to disk
   * at the given outputPath (usually the working dir)
   */
  inflate(input: stream.Readable, outputPath?: string): Promise<execa.ExecaReturnValue>;

  /**
   * deflate either takes a tar, or creates on on the fly, and passes this to a compression algorithm, outputting the
   * desired artifact
   */
  deflate(output: Artifact, tarInputArgs: TarInputArgs): Promise<execa.ExecaChildProcess>;
}
