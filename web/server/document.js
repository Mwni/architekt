import beautify from 'js-beautify'


const httpCodes = {
	ok: 200,
	notFound: 404
}

export function writeDocument({ ctx, dom, page, imports, bootstrapCode }){
	let { document } = dom.window
	
	writeDefaultMeta({ document })
	writeImports({ document, imports })
	writeBootstrapCode({ document, bootstrapCode })

	ctx.status = httpCodes[page.status] || 400
	ctx.body = beautify.html(
		dom.serialize(), 
		{
			indent_with_tabs: true,
			indent_scripts: true,
			indent_inner_html: true,
			inline: [],
			extra_liners: [],
			content_unformatted: ['script', 'style'],
		}
	)
}

function writeDefaultMeta({ document }){
	let charsetTag = document.createElement('meta')
	let viewportTag = document.createElement('meta')

	charsetTag.setAttribute('charset', 'utf-8')

	viewportTag.setAttribute('name', 'viewport')
	viewportTag.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no')

	document.head.appendChild(charsetTag)
	document.head.appendChild(viewportTag)
}

function writeImports({ document, imports }){
	let tags = []

	for(let bundleName of ['main', ...imports]){
		let manifest = global.assetManifest[bundleName]

		if(!manifest)
			continue

		if(manifest.stylesheet){
			let tag = document.createElement('link')

			tag.setAttribute('rel', 'stylesheet')
			tag.setAttribute('href', manifest.stylesheet)

			tags.push(tag)
		}
	}

	if(tags.length > 0){
		let noscript = document.createElement('noscript')

		for(let tag of tags){
			noscript.appendChild(tag)
		}

		document.head.appendChild(noscript)
	}
}

function writeBootstrapCode({ document, bootstrapCode }){
	let bootstrapScript = document.createElement('script')

	bootstrapScript.textContent = bootstrapCode

	document.head.appendChild(bootstrapScript)
}