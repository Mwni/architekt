import { renderState } from '@architekt/render'

export const Root = (...args) => renderState.runtime.components.Root(...args)
export const VScroll = (...args) => renderState.runtime.components.VScroll(...args)
export const HScroll = (...args) => renderState.runtime.components.HScroll(...args)
export const VStack = (...args) => renderState.runtime.components.VStack(...args)
export const HStack = (...args) => renderState.runtime.components.HStack(...args)
export const Absolute = (...args) => renderState.runtime.components.Absolute(...args)
export const Headline = (...args) => renderState.runtime.components.Headline(...args)
export const Text = (...args) => renderState.runtime.components.Text(...args)
export const Button = (...args) => renderState.runtime.components.Button(...args)
export const Image = (...args) => renderState.runtime.components.Image(...args)
export const Icon = (...args) => renderState.runtime.components.Icon(...args)
export const Interactive = (...args) => renderState.runtime.components.Interactive(...args)
export const WebLink = (...args) => renderState.runtime.components.WebLink(...args)
export const Radio = (...args) => renderState.runtime.components.Radio(...args)
export const TextInput = (...args) => renderState.runtime.components.TextInput(...args)
export const FileInput = (...args) => renderState.runtime.components.FileInput(...args)
export const Slider = (...args) => renderState.runtime.components.Slider(...args)
export const Dropdown = (...args) => renderState.runtime.components.Dropdown(...args)
export const Progress = (...args) => renderState.runtime.components.Progress(...args)
export const Canvas = (...args) => renderState.runtime.components.Canvas(...args)
export const Form = (...args) => renderState.runtime.components.Form(...args)
export const Group = (...args) => renderState.runtime.components.Group(...args)
export const Table = Object.defineProperty(
	(...args) => renderState.runtime.components.Table(...args),
	'Row',
	{
		get: () => renderState.runtime.components.Table.Row
	}
)

export { default as Select } from './select.js'