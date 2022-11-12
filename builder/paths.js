import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const libPath = path.resolve(__dirname)
const repoPath = path.resolve(path.join(libPath, '..'))

export { libPath, repoPath }