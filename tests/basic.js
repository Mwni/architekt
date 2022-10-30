import { getContext, Component, VStack, Headline, Text, Button } from '@architekt/ui'
import { mount } from '@architekt/web'


const Welcome = Component(({ name }) => {
	let clicks = 0

	return ({ name }) => {
		VStack(() => {
			Headline({ text: `Hi, ${name}` })
			Text({ text: `You clicked ${clicks} times!` })
			Button({
				text: 'Click',
				action: event => {
					console.log('clicked')
					clicks++
				}
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