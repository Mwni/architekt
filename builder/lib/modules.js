import fs from 'fs/promises'
import pu from 'path'


const fileExists = async path => !!(await fs.stat(path).catch(e => false))


export async function findParentPackageDescriptor(path){
	let dir = path

	while(true){
		let base = pu.basename(dir)
		let descriptor = pu.join(dir, 'package.json')

		if(base === 'node_modules')
			return

		if(await fileExists(descriptor))
			return pu.resolve(descriptor)

		dir = pu.dirname(dir)
	}
}

export async function shouldTreatAsExternal(path, rootPath){
	let descriptorPath = await findParentPackageDescriptor(path)

	if(!descriptorPath)
		return false

	if(pu.dirname(descriptorPath) === rootPath)
		return false

	try{
		let descriptor = JSON.parse(
			await fs.readFile(descriptorPath, 'utf-8')
		)

		if(descriptor.xjs?.compile){
			return false
		}
	}catch{}

	return true
}