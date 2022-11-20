import clientApp from '{{{clientEntry}}}'
import { Component, getContext } from '@architekt/ui'
import { startServer } from '@architekt/web'

const config = {{{serverConfig}}}
startServer({ ...config, clientApp })