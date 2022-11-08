import { prebundle } from '@architekt/builder'


export default async ({ config, procedure }) => {
	await procedure(
		{
			id: `test`,
			description: `testing`
		},
		async () => {
			let bundle = await prebundle({
				entry: {
					file: config.clientEntry
				},
				platform: config.platform,
				rootPath: config.rootPath
			})

			console.log(bundle)
		}
	)
}
