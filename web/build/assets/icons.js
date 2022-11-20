export default async ({ icons }) => {
	let outputIcons = {}

	for(let { xid, variants } of icons){
		outputIcons[xid] = {
			variants: variants.map(({ xid, ...variant }) => variant)
		}
	}

	return outputIcons
}