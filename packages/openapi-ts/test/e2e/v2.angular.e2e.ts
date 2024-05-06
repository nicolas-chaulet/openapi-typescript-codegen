import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { buildAngularProject, createAngularProject } from './scripts/angular'
import browser from './scripts/browser'
import { cleanup } from './scripts/cleanup'
import { copyAsset } from './scripts/copyAsset'
import { generateClient } from './scripts/generateClient'
import server from './scripts/server'

describe('v2.angular', () => {
  beforeAll(async () => {
    cleanup('v2/angular')
    createAngularProject('v2/angular', 'app')
    await generateClient('v2/angular/app/src/client', 'v2', 'angular')
    copyAsset('main-angular.ts', 'v2/angular/app/src/main.ts')
    buildAngularProject('v2/angular', 'app', 'dist')
    await server.start('v2/angular/app/dist/browser')
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
          SimpleService.getCallWithoutParametersAndResponse().subscribe(resolve)
        })
    )
    // @ts-ignore
    expect(result.headers.authorization).toBe('Bearer MY_TOKEN')
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
})
