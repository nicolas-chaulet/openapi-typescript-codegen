import path from 'node:path'

import {EOL} from 'os'
import {
  createCompilerHost,
  createProgram,
  formatDiagnosticsWithColorAndContext,
  getPreEmitDiagnostics,
  parseConfigFileTextToJson,
  parseJsonConfigFileContent,
  sys
} from 'typescript'

export const compileWithTypescript = (dir: string, {overrides}: { overrides?: any } = {}) => {
  const cwd = `./test/e2e/generated/${dir}/`
  const tsconfig = {
    compilerOptions: {
      allowSyntheticDefaultImports: true,
      declaration: false,
      declarationMap: false,
      experimentalDecorators: true,
      lib: ['es2020', 'dom'],
      module: 'es2020',
      moduleResolution: 'node',
      noImplicitAny: true,
      noImplicitReturns: true,
      noImplicitThis: true,
      skipLibCheck: true,
      sourceMap: false,
      strict: true,
      target: 'es2020',
      ...(overrides?.compilerOptions || {})
    },
    include: ['**/*.ts'],
    ...overrides || {},
  }

  // Compile files to JavaScript (ES6 modules)
  const configFile = parseConfigFileTextToJson(
    'tsconfig.json',
    JSON.stringify(tsconfig)
  )
  const configFileResult = parseJsonConfigFileContent(
    configFile.config,
    sys,
    path.resolve(process.cwd(), cwd),
    undefined,
    'tsconfig.json'
  )
  const compilerHost = createCompilerHost(configFileResult.options)
  const compiler = createProgram(
    configFileResult.fileNames,
    configFileResult.options,
    compilerHost
  )
  const result = compiler.emit()

  // Show errors or warnings
  const diagnostics = getPreEmitDiagnostics(compiler).concat(result.diagnostics)
  if (diagnostics.length) {
    const message = formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: f => f,
      getCurrentDirectory: () => sys.getCurrentDirectory(),
      getNewLine: () => EOL
    })
    console.log(message)
  }
}
