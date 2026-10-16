// TEMP: resolve the Vite `@/` alias and extensionless relative imports for the
// byte-level PDF verification run.
import { pathToFileURL } from 'node:url'
import { resolve as resolvePath } from 'node:path'
import { existsSync } from 'node:fs'

const root = process.cwd()

function withTs(base) {
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`]) {
    if (existsSync(candidate)) return candidate
  }
  return base
}

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const base = resolvePath(root, 'src', specifier.slice(2))
    return nextResolve(pathToFileURL(withTs(base)).href, context)
  }
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && !/\.[a-z]+$/i.test(specifier)) {
    const parentDir = context.parentURL
      ? resolvePath(decodeURIComponent(new URL(context.parentURL).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..')
      : root
    return nextResolve(pathToFileURL(withTs(resolvePath(parentDir, specifier))).href, context)
  }
  return nextResolve(specifier, context)
}
