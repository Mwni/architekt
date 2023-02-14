import { Fragment } from '@architekt/render'
import { Text } from '@architekt/ui'
import { Element } from '../dom.js'


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
				'table',
				props,
				() => {
					if(headRows.length > 0){
						Element(
							'thead',
							{},
							() => headRows
						)
					}
			
					if(bodyRows.length > 0){
						Element(
							'tbody',
							{},
							() => bodyRows
						)
					}
				}
			)
		]
	}),
	{
		Row: Fragment(({ head, ...props }, content) => [
			Element(
				'tr',
				props,
				() => content().map(
					cell => Element(
						head ? 'th' : 'td',
						{},
						() => [cell]
					)
				)
			)
		])
	}
)
