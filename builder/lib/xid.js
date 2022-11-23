export function generateXid(length){
	return Math.random()
		.toString(32)
		.slice(2, length + 2)
		.padStart(length, 'x')
		.replace(/^\d/, 'x')
		.toLowerCase()
}