import { JSDOM } from 'jsdom'

export function parseIncludeTags(html){
	let dom = new JSDOM(html)

	for(let tag of dom.window.document.head.children){
		console.log(tag)
	}
}

parseIncludeTags(
	`
	<link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="./favicon-16x16.png">
<link rel="manifest" href="./site.webmanifest">
<link rel="mask-icon" href="./safari-pinned-tab.svg" color="#ffe300">
<meta name="apple-mobile-web-app-title" content="True Bullion">
<meta name="application-name" content="True Bullion">
<meta name="msapplication-TileColor" content="#ffc40d">
<meta name="theme-color" content="#ffffff">
	`
)