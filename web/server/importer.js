export const imports = []

export async function importBundle(path){
	if(!imports.includes(path))
		imports.push(path)

	return import(`./server/${path}.js`)
}

export async function importAssets(path){
	imports.push(path)
}