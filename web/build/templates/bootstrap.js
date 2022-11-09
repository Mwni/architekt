var appModule = 'app'
var appStyle = 'app'
//{{#if splash}}
import showSplash from '{{splash}}'
var splash
//{{/if}}

window.document.documentElement.style.opacity = '0'

window.loadCSS= function(name, resolve){
	var tag = document.getElementById(name)

	if(!tag){
		tag = document.createElement('link')

		tag.rel = 'stylesheet'
		tag.type = 'text/css'
		tag.href = `/css/${name}.css`

		document.head.appendChild(tag)
	}

	tag.addEventListener('load', resolve)
}

function launch(){
	//{{#if splash}}
	if(splash && splash.unload)
		splash.unload()
	//{{/if}}

	window.x.launch()
}

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

		if(alt.css){
			appStyle += '.' + alt.suffix
		}
	}
	//{{/if}}


	//{{#if splash}}
	splash = showSplash()
	//{{/if}}


	var tag = document.createElement('script')

	tag.type = 'module'
	tag.src = `/js/${appModule}.js`

	document.body.appendChild(tag)

	window.loadCSS(appStyle, function(){
		if(window.x){
			launch()
		}else{
			window.x = () => launch()
		}
	})
})