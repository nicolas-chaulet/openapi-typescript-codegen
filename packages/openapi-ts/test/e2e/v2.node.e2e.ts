import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { cleanup } from './scripts/cleanup'
import { compileWithTypescript } from './scripts/compileWithTypescript'
import { generateClient } from './scripts/generateClient'
import server from './scripts/server'
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const __filename = path.resolve(__dirname, 'generated/v2/node/index.js')

describe('v2.node', () => {
  beforeAll(async () => {
    cleanup('v2/node')
    await generateClient('v2/node', 'v2', 'node')
    compileWithTypescript('v2/node')
    await server.start('v2/node')
  }, 40000)

  afterAll(async () => {
    await server.stop()
  })

  it('requests token', async () => {
    const { OpenAPI, SimpleService } = await import(__filename)
    const tokenRequest = vi.fn().mockResolvedValue('MY_TOKEN')
    OpenAPI.TOKEN = tokenRequest
    const result = await SimpleService.getCallWithoutParametersAndResponse()
    expect(tokenRequest.mock.calls.length).toBe(1)
    // @ts-ignore
    expect(result.headers.authorization).toBe('Bearer MY_TOKEN')
  })

  it('supports complex params', async () => {
    const { ComplexService } = await import(__filename)
    const result = await ComplexService.complexTypes({
      // @ts-ignore
      first: {
        second: {
          third: 'Hello World!'
        }
      }
    })
    expect(result).toBeDefined()
  })

  it('can abort the request', async () => {
    let error
    try {
      const { SimpleService } = await import(__filename)
      const promise = SimpleService.getCallWithoutParametersAndResponse()
      setTimeout(() => {
        promise.cancel()
      }, 10)
      await promise
    } catch (e) {
      error = (e as Error).message
    }
    expect(error).toContain('Request aborted')
  })
})

describe('v2.node useOptions', () => {
  beforeAll(async () => {
    cleanup('v2/node')
    await generateClient('v2/node', 'v2', 'node', true)
    compileWithTypescript('v2/node')
    await server.start('v2/node')
  }, 40000)

  afterAll(async () => {
    await server.stop()
  })

  it('returns result body by default', async () => {
    const { SimpleService } = await import(__filename)
    const result = await SimpleService.getCallWithoutParametersAndResponse()
    // @ts-ignore
    expect(result.body).toBeUndefined()
  })

  it('returns result body', async () => {
    const { SimpleService } = await import(__filename)
    // @ts-ignore
    const result = await SimpleService.getCallWithoutParametersAndResponse({
      _result: 'body'
    })
    // @ts-ignore
    expect(result.body).toBeUndefined()
  })

  it('returns raw result', async ({ skip }) => {
    skip()
    const { SimpleService } = await import(__filename)
    // @ts-ignore
    const result = await SimpleService.getCallWithoutParametersAndResponse({
      _result: 'raw'
    })
    // @ts-ignore
    expect(result.body).toBeDefined()
  })
})
