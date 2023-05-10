export default () => {
	let title = undefined

	return {
		status: 'ok',
		get title(){
			return title
		},
		set title(t){
			title = t
			document.title = t
		}
	}
}