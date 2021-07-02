const download = require(`@app/downloader`)

// Eventually make these env variables
const siteUrl = `https://business-starter-template.webflow.io`
const destinationOrigin = `https://smarterlabs.com/`

download({
	entry: [
		siteUrl,
		`${siteUrl}/sitemap.xml`,
	],
	domains: [
		{ domain: siteUrl.split(`://`)[1], path: `/` },
		{ domain: `assets.website-files.com`, path: `/assets` },
	],
	replaceOrigin: destinationOrigin,
	concurrency: 10,
})