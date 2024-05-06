import { rmSync } from 'node:fs'
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const cleanup = (dir: string) => {
  rmSync(path.resolve(__dirname, `../generated/${dir}/`), {
    force: true,
    recursive: true
  })
}
