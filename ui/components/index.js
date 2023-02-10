import { ctx } from '@architekt/render'

export const Root = (...args) => ctx.components.Root(...args)
export const VStack = (...args) => ctx.components.VStack(...args)
export const HStack = (...args) => ctx.components.HStack(...args)
export const Absolute = (...args) => ctx.components.Absolute(...args)
export const Headline = (...args) => ctx.components.Headline(...args)
export const Text = (...args) => ctx.components.Text(...args)
export const Button = (...args) => ctx.components.Button(...args)
export const Image = (...args) => ctx.components.Image(...args)
export const Icon = (...args) => ctx.components.Icon(...args)
export const Interactive = (...args) => ctx.components.Interactive(...args)
export const WebLink = (...args) => ctx.components.WebLink(...args)
export const Radio = (...args) => ctx.components.Radio(...args)
export const TextInput = (...args) => ctx.components.TextInput(...args)
export const FileInput = (...args) => ctx.components.FileInput(...args)
export const Canvas = (...args) => ctx.components.Canvas(...args)
export const Group = (...args) => ctx.components.Group(...args)

export { default as Select } from './select.js'