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