import stream from 'stream';
import { ExecaChildProcess } from 'execa';

export interface Compression {
  extensions: string[];
  enabled(): Promise<boolean>;
  inflate(input: stream.Readable, outputPath?: string): Promise<ExecaChildProcess>;
  deflate(input: stream.Readable): ExecaChildProcess;
}
