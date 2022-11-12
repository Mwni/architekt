import clientEntry from '{{{clientEntry}}}'
import { Component, getContext } from '@architekt/ui'
import { startServer } from '@architekt/web'

const config = {{{serverConfig}}}
const clientApp = Component(({ page }) => {
	let { downstream } = getContext()

	downstream.page = page

	return () => clientEntry()
})

startServer({ ...config, clientApp })