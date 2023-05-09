var appModule = 'main'
//{{#if splash}}
import showSplash from '{{splash}}'
//{{/if}}

window.document.documentElement.style.opacity = '0'

document.addEventListener('DOMContentLoaded', function(){
	document.body.innerHTML = ''
	window.document.documentElement.style.opacity = ''

	//{{#if alternatives}}
	var alts = [{{{alternatives}}}]

	for(var i=0; i<alts.length; i++){
		var alt = alts[i]

		if(!alt.test())
			continue

		if(alt.js){
			appModule += '.' + alt.suffix
		}
	}
	//{{/if}}

	//{{#if splash}}
	window.unloadSplash = showSplash()
	//{{/if}}


	var tag = document.createElement('script')

	tag.type = 'module'
	tag.src = `/app/${appModule}.js`

	document.body.appendChild(tag)
})