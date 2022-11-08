import os from 'os'
import fs from 'fs'
import pu from 'path'
import crypto from 'crypto'


export function createTemp(seed){
	let xid = crypto.createHash('md5')
		.update(seed)
		.digest('hex')
		.slice(0, 8)

	let dir = pu.join(os.tmpdir(), 'architekt-' + xid)

	if(!fs.existsSync(dir)){
		fs.mkdirSync(dir)
	}

	return dir
}

export function ensureDist(root, distDir){
	let dir = pu.join(root, distDir)

	if(!fs.existsSync(dir)){
		fs.mkdirSync(dir)
	}

	return dir
}

export function clean(dir){
	for(let f of fs.readdirSync(dir)){
		fs.rmSync(pu.join(dir, f), {recursive: true})
	}
}