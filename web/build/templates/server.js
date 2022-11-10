import clientApp from '{{{clientEntry}}}'
import { startServer } from '@architekt/web'

const config = {{{serverConfig}}}

startServer({ ...config, clientApp })