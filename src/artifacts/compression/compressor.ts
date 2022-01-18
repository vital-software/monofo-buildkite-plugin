import stream from 'stream';
import { TarInput } from '../../util/tar';
import { Artifact } from '../model';

export interface Compressor {
  /**
   * inflate decompresses an input stream (usually an in-progress artifact download), writing decompressed files to disk
   * at the given outputPath (usually the working dir)
   */
  inflate(options: {
    input: stream.Readable;
    artifact: Artifact;
    outputPath?: string;
    verbose?: boolean;
  }): Promise<unknown>;

  /**
   * Runs tar and passes the uncompressed tarball to the compressor process
   *
   * Results in a file at artifact.filename, with the compressed contents of TarInput
   * (so, in this context, the artifact is the output)
   */
  deflate(options: { input: TarInput; artifact: Artifact }): Promise<unknown>;
}
