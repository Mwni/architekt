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
import start from '@architekt/web/server'

const config = {{{serverConfig}}}
start({ ...config, clientApp })