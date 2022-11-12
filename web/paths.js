import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const libPath = path.dirname(__filename)
const repoPath = path.resolve(path.join(libPath, '..'))

export { libPath, repoPath }