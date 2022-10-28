import { ctx } from './context.js'

export default factory => {

	return (props, content) => {
		ctx.stack.push()
	}
}