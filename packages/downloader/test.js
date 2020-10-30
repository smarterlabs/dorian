const download = require(`./src`)

// download({
// 	entry: [ `https://www.playcornhole.org/sitemap.xml` ],
// 	domains: [
// 		{ domain: `www.playcornhole.org`, path: `/` },
// 		{ domain: `i.shgcdn.com`, path: `/assets` },
// 	],
// 	replaceOrigin: `https://playcornhole.netlify.app/`,
// })

download({
	entry: [ `https://smarterlabs.webflow.io/sitemap.xml` ],
	domains: [
		{ domain: `smarterlabs.webflow.io`, path: `/` },
		{ domain: `assets.website-files.com`, path: `/assets` },
	],
	replaceOrigin: `https://smarterlabs.com/`,
	concurrency: 10,
})