const download = require(`./src`)

download({
	entry: [
		`https://smarterlabs.webflow.io/sitemap.xml`,
	],
	domains: [
		{ domain: `smarterlabs.webflow.io`, path: `/` },
		{ domain: `assets.website-files.com`, path: `/assets` },
	],
	replaceOrigin: `https://smarterlabs/`,
})