import fs from 'fs'
import pu from 'path'
import Handlebars from 'handlebars'
import { libPath } from './paths.js'

export default function({ file, fields }){
	let src = fs.readFileSync(pu.join(libPath, 'templates', file), 'utf-8')
	return Handlebars.compile(src)(fields)
}