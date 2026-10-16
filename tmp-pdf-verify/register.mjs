// TEMP: register the `@/` + extensionless-import resolver for the verification run.
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

register('./loader.mjs', pathToFileURL('./tmp-pdf-verify/'))
