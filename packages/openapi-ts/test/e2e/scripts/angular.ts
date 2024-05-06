import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url';

import { sync } from 'cross-spawn'

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const createAngularProject = (dir: string, name: string) => {
  const cwd = path.resolve(__dirname, `../generated/${dir}/`)
  mkdirSync(cwd, {
    recursive: true
  })
  sync(
    'ng',
    [
      'new',
      name,
      '--minimal',
      'true',
      '--style',
      'css',
      '--inline-style',
      'true',
      '--inline-template',
      'true',
      '--routing',
      'false',
      '--ssr',
      'false',
      '--skip-tests',
      'true',
      '--skip-git',
      'true',
      '--commit',
      'false',
      '--force'
    ],
    {
      cwd,
      stdio: 'inherit'
    }
  )
  rmSync(`${cwd}/${name}/src/app/`, {
    force: true,
    recursive: true,
  })
}

export const buildAngularProject = (
  dir: string,
  name: string,
  output: string
) => {
  const cwd = path.resolve(__dirname, `../generated/${dir}/${name}/`)
  sync(
    'ng',
    [
      'build',
      '--output-path',
      output,
      '--optimization',
      'false',
      '--configuration',
      'development',
      '--source-map',
      'false'
    ],
    {
      cwd,
      stdio: 'inherit'
    }
  )
}
