import fs from 'fs'
import Handlebars from 'handlebars'

export function template({file, fields}){
	return Handlebars.compile(fs.readFileSync(file, 'utf-8'))(fields)
}