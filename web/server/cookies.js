export default ctx => ({
	...Object.fromEntries(
		new URLSearchParams(
			(ctx.req.headers.cookie || '').replace(/; /g, "&")
		)
	),
	set: ({ key, value, maxAge, expires, httpOnly }) => {
		ctx.cookies.set(key, value, {
			maxAge,
			expires,
			httpOnly
		})
	}
})