import fs from 'fs'
import pu from 'path'
import Handlebars from 'handlebars'
import { root } from '../paths.js'

export function get(file, fields){
	let src = fs.readFileSync(pu.join(root, 'templates', file), 'utf-8')

	return Handlebars.compile(src)(fields)
}