import stream from 'stream';
import execa from 'execa';
import { hasBin, stdinWritable } from '../../util/exec';

let hasDesync: Promise<boolean> | undefined;

export async function isDesyncEnabled(): Promise<boolean> {
  if (!hasDesync) {
    hasDesync = hasBin('desync');
  }

  return Boolean(process.env?.MONOFO_DESYNC_STORE) && (await hasDesync);
}

function getFlags({ cache = true, store = true } = {}): string[] {
  return [
    ...(cache && process.env?.MONOFO_DESYNC_CACHE ? ['-c', process.env.MONOFO_DESYNC_CACHE] : []),
    ...(store && process.env?.MONOFO_DESYNC_STORE ? ['-s', process.env.MONOFO_DESYNC_STORE] : []),
    ...(process.env?.MONOFO_DESYNC_FLAGS || '').split(' '),
  ];
}

/**
 * Untar an index file, inflating it at the output path
 *
 * - Expects the contents of a .caidx file to be piped into the returned writable stream
 * - Only outputs debugging information to stdout/stderr
 * - Directly inflates the extracted files and writes them to disk
 *
 * Returns:
 *  - The stream to write to
 */
export function inflateDesync(outputPath = '.'): [stream.Writable, Promise<void>] {
  const subprocess = execa('desync', ['untar', '--index', ...getFlags(), '-', outputPath], {
    buffer: false,
    stdio: ['pipe', 'inherit', 'inherit'],
  });

  return [stdinWritable(subprocess), subprocess.then(() => {})];
}

/**
 * Deflate a tar file, creating a content-addressed index file
 *
 * - Expects the contents of a tar archive to be piped into the returned writable stream
 * - Writes an index file to the given output path
 *
 * Send a .tar to the returned writable stream, and set `outputPath` to a .caidx file
 * Deflates the tar into storage, and outputs an index file at outputPath
 */
export function deflateDesync(outputPath: string): stream.Writable {
  return stdinWritable(
    execa('desync', ['tar', '--input-format', 'tar', '--index', ...getFlags({ cache: false }), outputPath, '-'], {
      buffer: false,
      stdio: ['pipe', 'pipe', 'inherit'],
    })
  );
  // TODO: after producing index: desync chop -s /some/local/store somefile.tar.caidx somefile.tar
}
