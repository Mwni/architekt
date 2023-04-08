import path from 'path'
import template from '../lib/template.js'
import bundleAssets from '../assets/index.js'


const nameGuesses = {
	'favicon-32x32.png': {
		rel: 'icon',
		type: 'image/png',
		sizes: '32x32'
	},
	'favicon-16x16.png': {
		rel: 'icon',
		type: 'image/png',
		sizes: '16x16'
	},
	'site.webmanifest': {
		rel: 'manifest',
		files: [
			'android-chrome-192x192.png',
			'android-chrome-512x512.png'
		]
	},
	'apple-touch-icon.png': {
		rel: 'apple-touch-icon',
		sizes: '180x180'
	},
	'safari-pinned-tab.svg': {
		rel: 'apple-touch-icon',
		sizes: '180x180'
	},
}


export default async ({ config, plugins, procedure, watch }) => {
	let { includes } = config

	if(!includes || includes.length === 0)
		return

	let files = await procedure({
		id: `includes`,
		description: `applying includes`,
		execute: async () => {
			
		}
	})


	return {
		
	}
}
