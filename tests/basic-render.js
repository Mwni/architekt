import { getContext, Component, VStack, Headline, Text } from '@architekt/ui'
import { mount } from '@architekt/web'


const Welcome = Component(({ name }) => {
	let { app, state, didCreate } = getContext()
	
	state.default({
		name,
		happy: undefined
	})
	

	didCreate(dom => {
		dom.style.opacity = 0.5
		app.notify()
	})

	return ({ name }) => {
		VStack(() => {
			Headline({ text: `Hi, ${name}` })
			Text({ text: 'How are you today?' })
			Button({
				action: event => getContext().state.apply({ happy: true })
			})
		})
	}
})

mount(document.body, Welcome, { name: 'Alice' })

/*
const Welcome2 = Component(({ app, props, state, didCreate }) => {
	state.default({
		name: props.name,
		happy: undefined
	})

	didCreate(dom => {
		dom.style.opacity = 0.5
		app.notify()
	})

	return ({ props }) => {
		VStack(ctx => {
			Headline({ text: `Hi, ${props.name}` })
			Text({ text: 'How are you today?' })
			Button({
				action: event => ctx.state.apply({ happy: true })
			})
		})
	}
})


const Headline = ({ text }) => {

	return ({ text }) => {

	}
}

class Welcome3 extends Component{
	view({ name }){
		VStack(() => {
			Headline({ text: `Hi, ${name}` })
			Text({ text: 'How are you today?' })
		})
	}
}*/