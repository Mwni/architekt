{{#each modules}}
import {{{this.name}}} from '{{{this.path}}}'
{{/each}}

export default router => {
	{{#each modules}}
	{{{this.name}}}(router)
	{{/each}}
}