import clientApp from '{{{appComponent}}}'
import createServer from '@architekt/web/server'

export default config => createServer({
	...config,
	clientApp
})