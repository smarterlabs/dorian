const download = require(`./src`)

download({
	entry: [ `https://www.playcornhole.org/sitemap.xml` ],
	domains: [
		{ domain: `www.playcornhole.org`, path: `/` },
		{ domain: `i.shgcdn.com`, path: `/assets` },
	],
	replaceOrigin: `https://playcornhole.netlify.app/`,
})