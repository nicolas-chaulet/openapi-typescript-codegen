import { createClient } from '../../../'
import type { Config } from '../../../src/types/config'

export const generateClient = async (
  dir: string,
  version: string,
  client: Config['client'],
  useOptions: boolean = false,
  name?: string,
  addFileExtension?: boolean,
) => {
  await createClient({
    client,
    input: `./test/spec/${version}.json`,
    name,
    output: {
      addFileExtension,
      path: `./test/e2e/generated/${dir}/`,
    },
    services: {
      asClass: true,
    },
    useOptions,
  })
}
