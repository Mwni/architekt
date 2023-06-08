import { Component } from '@architekt/render'
import { assets } from './assets.js'


export default Component(({ ctx, xid }) => {
	let { html } = assets[xid]

	ctx.runtime.document.head.innerHTML += html

	return () => {}
})