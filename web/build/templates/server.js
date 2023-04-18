{{#if envFile}}
import dotenv from 'dotenv'
dotenv.config({ path: '{{{envFile}}}' })
{{/if}}

import clientApp from '{{{clientEntry}}}'
import startServer from '@architekt/web/server'

const config = {{{serverConfig}}}

{{#if serverEntry}}
import serverEntry from '{{{serverEntry}}}'
serverEntry({
	config,
	startServer: (overrides = {}) => {
		startServer({ 
			clientApp,
			...config, 
			...overrides,
		})
	}
})
{{else}}
startServer({ ...config, clientApp })
{{/if}}