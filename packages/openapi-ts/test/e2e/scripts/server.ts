import { Server } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url';

import express, { Express } from 'express'

const __dirname = fileURLToPath(new URL('.', import.meta.url));

let _app: Express
let _server: Server

const start = async (dir: string) =>
  new Promise<void>(resolve => {
    _app = express()

    // Serve the JavaScript files from the specific folder, since we are using browser
    // based ES6 modules, this also means that we can just request the js/index.js file
    // and all other relative paths are resolved from that file.
    _app.use(
      '/js',
      express.static(path.resolve(__dirname, `../generated/${dir}/`), {
        extensions: ['', 'js'],
        index: 'index.js'
      })
    )

    _app.use(
      '/js',
      express.static(path.resolve(__dirname, `../generated/${dir}/`), {
        extensions: ['', 'js'],
        index: 'index.js'
      })
    )

    // Serve static assets
    _app.get('/runtime.js', (req, res) => {
      res.sendFile(path.resolve(__dirname, `../generated/${dir}/runtime.js`))
    })
    _app.get('/polyfills.js', (req, res) => {
      res.sendFile(path.resolve(__dirname, `../generated/${dir}/polyfills.js`))
    })
    _app.get('/vendor.js', (req, res) => {
      res.sendFile(path.resolve(__dirname, `../generated/${dir}/vendor.js`))
    })
    _app.get('/main.js', (req, res) => {
      res.sendFile(path.resolve(__dirname, `../generated/${dir}/main.js`))
    })
    _app.get('/styles.css', (req, res) => {
      res.sendFile(path.resolve(__dirname, `../generated/${dir}/styles.css`))
    })
    _app.get('/favicon.ico', (req, res) => {
      res.sendFile(path.resolve(__dirname, `../generated/${dir}/favicon.ico`))
    })
    _app.get('/', (req, res) => {
      res.sendFile(path.resolve(__dirname, `../generated/${dir}/index.html`))
    })

    // Register an 'echo' server for testing error codes. This will just grab the
    // status code from the query and return the default response (and text) from Express.
    // See the spec files for more information.
    _app.all('/base/api/v1.0/error', (req, res) => {
      const status = Number.parseInt(String(req.query.status), 10)
      res.status(status).json({
        message: 'hello world',
        status
      })
    })

    // Register an 'echo' server that just returns all data from the API calls.
    // Although this might not be a 'correct' response, we can use this to test
    // the majority of API calls.
    _app.all('/base/api/v1.0/*', (req, res) => {
      setTimeout(() => {
        res.json({
          body: req.body,
          headers: req.headers,
          hostname: req.hostname,
          method: req.method,
          path: req.path,
          protocol: req.protocol,
          query: req.query,
          url: req.url
        })
      }, 100)
    })
    _server = _app.listen(3000, () => {
      resolve()
    })
  })

const stop = async () =>
  new Promise<void>((resolve, reject) => {
    _server.close(err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })

export default {
  start,
  stop
}
