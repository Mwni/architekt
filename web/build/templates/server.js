{{#if envFile}}
import dotenv from 'dotenv'
dotenv.config({ path: '{{{envFile}}}' })
{{/if}}

{{#if serverInit}}
import serverInit from '{{{serverInit}}}'
serverInit()
{{/if}}

import clientApp from '{{{clientEntry}}}'
import { Component, getContext } from '@architekt/ui'
import { startServer } from '@architekt/web'

const config = {{{serverConfig}}}
startServer({ ...config, clientApp })