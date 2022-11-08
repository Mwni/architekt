export function transform({ code }){
    return {
        code: `import $X from '@xjs/core'\n\n${code}`
    }
}

export function skip({ path }){
	return !path.endsWith('.xjs')
}