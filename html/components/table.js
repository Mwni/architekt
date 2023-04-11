import { Fragment } from '@architekt/render'
import Element from '../element.js'


export default Object.assign(
	Fragment((props, content) => {
		let rows = content()
		let headRows = []
		let bodyRows = []

		for(let row of rows){
			if(row.props.head)
				headRows.push({
					...row,
					props: {
						...row.props,
						head: true
					}
				})
			else
				bodyRows.push(row)
		}

		return [
			Element(
				{
					...props,
					tag: 'table'
				},
				() => {
					if(headRows.length > 0){
						Element(
							{ tag: 'thead' },
							headRows
						)
					}
			
					if(bodyRows.length > 0){
						Element(
							{ tag: 'tbody' },
							bodyRows
						)
					}
				}
			)
		]
	}),
	{
		Row: Fragment(({ head, ...props }, content) => Element(
				{
					...props,
					tag: 'tr'
				},
				() => {
					return content().map(
						cell => Element(
							{ tag: head ? 'th' : 'td' },
							[cell]
						)
					)
				}
			)
		)
	}
)
