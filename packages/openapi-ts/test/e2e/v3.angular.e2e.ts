import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { buildAngularProject, createAngularProject } from './scripts/angular'
import browser from './scripts/browser'
import { cleanup } from './scripts/cleanup'
import { copyAsset } from './scripts/copyAsset'
import { generateClient } from './scripts/generateClient'
import server from './scripts/server'

describe('v3.angular', () => {
  beforeAll(async () => {
    cleanup('v3/angular')
    createAngularProject('v3/angular', 'app')
    await generateClient('v3/angular/app/src/client', 'v3', 'angular')
    copyAsset('main-angular.ts', 'v3/angular/app/src/main.ts')
    buildAngularProject('v3/angular', 'app', 'dist')
    await server.start('v3/angular/app/dist/browser')
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
          const { OpenAPI, SimpleService } = window.api
          // @ts-ignore
          OpenAPI.TOKEN = window.tokenRequest
          OpenAPI.USERNAME = undefined
          OpenAPI.PASSWORD = undefined
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
          const { OpenAPI, SimpleService } = window.api
          OpenAPI.TOKEN = undefined
          OpenAPI.USERNAME = 'username'
          OpenAPI.PASSWORD = 'password'
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
    const error = await browser.evaluate(async () => {
      try {
        await new Promise((resolve, reject) => {
          // @ts-ignore
          const { ErrorService } = window.api
          ErrorService.testErrorCode(500).subscribe(resolve, reject)
        })
      } catch (error) {
        return JSON.stringify({
          body: error.body,
          message: error.message,
          name: error.name,
          status: error.status,
          statusText: error.statusText,
          url: error.url
        })
      }
      return
    })
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
    const error = await browser.evaluate(async () => {
      // @ts-ignore
      const { ErrorService } = window.api
      try {
        await new Promise((resolve, reject) => {
          // const { ErrorService } = window.api;
          ErrorService.testErrorCode(599).subscribe(resolve, reject)
        })
      } catch (error) {
        return JSON.stringify({
          body: error.body,
          message: error.message,
          name: error.name,
          status: error.status,
          statusText: error.statusText,
          url: error.url
        })
      }
      return
    })
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
