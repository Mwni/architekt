
export default async ctx => {
	await ctx.procedure(
		{
			id: `test`,
			description: `testing`
		},
		async () => {
			console.log(ctx)
			await new Promise(resolve => setTimeout(resolve, 3000))
		}
	)
}
