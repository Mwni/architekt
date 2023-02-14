import { ctx } from '@architekt/render'

export const Root = (...args) => ctx.runtime.components.Root(...args)
export const VStack = (...args) => ctx.runtime.components.VStack(...args)
export const HStack = (...args) => ctx.runtime.components.HStack(...args)
export const Absolute = (...args) => ctx.runtime.components.Absolute(...args)
export const Headline = (...args) => ctx.runtime.components.Headline(...args)
export const Text = (...args) => ctx.runtime.components.Text(...args)
export const Button = (...args) => ctx.runtime.components.Button(...args)
export const Image = (...args) => ctx.runtime.components.Image(...args)
export const Icon = (...args) => ctx.runtime.components.Icon(...args)
export const Interactive = (...args) => ctx.runtime.components.Interactive(...args)
export const WebLink = (...args) => ctx.runtime.components.WebLink(...args)
export const Radio = (...args) => ctx.runtime.components.Radio(...args)
export const TextInput = (...args) => ctx.runtime.components.TextInput(...args)
export const FileInput = (...args) => ctx.runtime.components.FileInput(...args)
export const Canvas = (...args) => ctx.runtime.components.Canvas(...args)
export const Group = (...args) => ctx.runtime.components.Group(...args)
export const Table = Object.defineProperty(
	(...args) => ctx.runtime.components.Table(...args),
	'Row',
	{
		get: () => ctx.runtime.components.Table.Row
	}
)

export { default as Select } from './select.js'