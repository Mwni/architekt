{{#each modules}}
import {{{this}}} from '{{{this}}}'
{{/each}}

export default router => {
	{{#each modules}}
	{{{this}}}(router)
	{{/each}}
}