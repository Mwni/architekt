{{#if envFile}}
import dotenv from 'dotenv'
dotenv.config({ path: '{{{envFile}}}' })
{{/if}}

{{#if serverInit}}
import serverInit from '{{{serverInit}}}'
serverInit()
{{/if}}

import clientApp from '{{{clientEntry}}}'
import runServer from '@architekt/web/server'

const config = {{{serverConfig}}}
runServer({ ...config, clientApp })