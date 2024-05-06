import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { buildAngularProject, createAngularProject } from './scripts/angular'
import browser from './scripts/browser'
import { cleanup } from './scripts/cleanup'
import { copyAsset } from './scripts/copyAsset'
import { generateClient } from './scripts/generateClient'
import server from './scripts/server'

describe('client.angular', () => {
  beforeAll(async () => {
    cleanup('client/angular')
    createAngularProject('client/angular', 'app')
    await generateClient(
      'client/angular/app/src/client',
      'v3',
      'angular',
      false,
      'ApiModule'
    )
    copyAsset('main-angular-module.ts', 'client/angular/app/src/main.ts')
    buildAngularProject('client/angular', 'app', 'dist')
    await server.start('client/angular/app/dist/browser')
    await browser.start()
  }, 100000)

  afterAll(async () => {
    await browser.stop()
    await server.stop()
  })

  it('requests token', async () => {
    await browser.exposeFunction(
      'tokenRequest',
      vi.fn().mockResolvedValue('MY_TOKEN')
    )
    const result = await browser.evaluate(
      async () =>
        await new Promise(resolve => {
          // @ts-ignore
          const { SimpleService } = window.api
          // @ts-ignore
          SimpleService.httpRequest.config.TOKEN = window.tokenRequest
          SimpleService.httpRequest.config.USERNAME = undefined
          SimpleService.httpRequest.config.PASSWORD = undefined
          SimpleService.getCallWithoutParametersAndResponse().subscribe(resolve)
        })
    )
    // @ts-ignore
    expect(result.headers.authorization).toBe('Bearer MY_TOKEN')
  })

  it('uses credentials', async () => {
    const result = await browser.evaluate(
      async () =>
        await new Promise(resolve => {
          // @ts-ignore
          const { SimpleService } = window.api
          SimpleService.httpRequest.config.TOKEN = undefined
          SimpleService.httpRequest.config.USERNAME = 'username'
          SimpleService.httpRequest.config.PASSWORD = 'password'
          SimpleService.getCallWithoutParametersAndResponse().subscribe(resolve)
        })
    )
    // @ts-ignore
    expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=')
  })

  it('supports complex params', async () => {
    const result = await browser.evaluate(
      async () =>
        await new Promise(resolve => {
          // @ts-ignore
          const { ComplexService } = window.api
          ComplexService.complexTypes({
            first: {
              second: {
                third: 'Hello World!'
              }
            }
          }).subscribe(resolve)
        })
    )
    expect(result).toBeDefined()
  })

  it('support form data', async () => {
    const result = await browser.evaluate(
      async () =>
        await new Promise(resolve => {
          // @ts-ignore
          const { ParametersService } = window.api
          ParametersService.callWithParameters(
            'valueHeader',
            'valueQuery',
            'valueForm',
            'valueCookie',
            'valuePath',
            {
              prop: 'valueBody'
            }
          ).subscribe(resolve)
        })
    )
    expect(result).toBeDefined()
  })

  it('should throw known error (500)', async () => {
    const error = await browser.evaluate(
      async () =>
        await new Promise(resolve => {
          // @ts-ignore
          const { ErrorService } = window.api
          ErrorService.testErrorCode(500).subscribe({
            error: (e: unknown) => {
              resolve(
                JSON.stringify({
                  // @ts-ignore
                  body: e.body,

                  // @ts-ignore
                  message: e.message,

                  // @ts-ignore
                  name: e.name,

                  // @ts-ignore
                  status: e.status,

                  // @ts-ignore
                  statusText: e.statusText,

                  // @ts-ignore
                  url: e.url
                })
              )
            }
          })
        })
    )
    expect(error).toBe(
      JSON.stringify({
        body: {
          message: 'hello world',
          status: 500
        },
        message: 'Custom message: Internal Server Error',
        name: 'ApiError',
        status: 500,
        statusText: 'Internal Server Error',
        url: 'http://localhost:3000/base/api/v1.0/error?status=500'
      })
    )
  })

  it('should throw unknown error (599)', async () => {
    const error = await browser.evaluate(
      async () =>
        await new Promise(resolve => {
          // @ts-ignore
          const { ErrorService } = window.api
          ErrorService.testErrorCode(599).subscribe({
            error: (e: unknown) => {
              resolve(
                JSON.stringify({
                  // @ts-ignore
                  body: e.body,

                  // @ts-ignore
                  message: e.message,

                  // @ts-ignore
                  name: e.name,

                  // @ts-ignore
                  status: e.status,

                  // @ts-ignore
                  statusText: e.statusText,

                  // @ts-ignore
                  url: e.url
                })
              )
            }
          })
        })
    )

    expect(error).toBe(
      JSON.stringify({
        body: {
          message: 'hello world',
          status: 599
        },
        message:
          'Generic Error: status: 599; status text: unknown; body: {\n  "message": "hello world",\n  "status": 599\n}',
        name: 'ApiError',
        status: 599,
        statusText: 'unknown',
        url: 'http://localhost:3000/base/api/v1.0/error?status=599'
      })
    )
  })
})
