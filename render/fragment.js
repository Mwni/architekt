export default render => {
	return (props, content) => {
		if(!props){
			props = {}
		}else if(typeof props === 'function' && !content){
			content = props
			props = {}
		}

		render(props, content)
	}
}