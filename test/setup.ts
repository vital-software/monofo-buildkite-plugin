import { resolve } from 'path';
import { setup } from 'jest-dynalite';
import { fakeProcess } from './fixtures';

setup(resolve(__dirname, '../'));
process.env = fakeProcess(process.env);
