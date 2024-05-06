import path from 'path';
import { fileURLToPath } from 'url';

import { createClient } from '../../../'
import type { Config } from '../../../src/types/config'

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const generateClient = async (
  dir: string,
  version: string,
  client: Config['client'],
  useOptions: boolean = false,
  name?: string
) => {
  await createClient({
    client,
    input: path.resolve(__dirname, `../../spec/${version}.json`),
    name,
    output: path.resolve(__dirname, `../generated/${dir}/`),
    useOptions
  })
}
