import { copyFileSync } from 'node:fs'
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const copyAsset = (fileNameIn: string, fileNameOut: string) => {
  copyFileSync(
    path.resolve(__dirname, `../assets/${fileNameIn}`),
    path.resolve(__dirname, `../generated/${fileNameOut}`),
  )
}
