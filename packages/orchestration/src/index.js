const download = require(`@app/downloader`)
const webflowPlugin = require(`@app/webflow-plugin`)

// Exit if environment variables are missing
if(!process.env.WEBFLOW_URL){
	console.error(`No "WEBFLOW_URL" environment variable set.`)
	process.exit(1)
}
if(!process.env.URL){
	console.error(`No "URL" environment variable set.`)
	process.exit(1)
}

let siteUrl = process.env.WEBFLOW_URL
let destinationOrigin = process.env.URL

// Normalize links
if(siteUrl.indexOf(`://`) === -1){
	siteUrl = `https://` + siteUrl
}
while(siteUrl[siteUrl.length - 1] === `/`){
	siteUrl = siteUrl.substring(0, siteUrl.length - 1)
}
if(destinationOrigin.indexOf(`://`) === -1){
	destinationOrigin = `https://` + destinationOrigin
}
if(destinationOrigin[destinationOrigin.length - 1] !== `/`){
	destinationOrigin = destinationOrigin + `/`
}

// Download site
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
	dist: `../../dist`,
	plugins: [
		webflowPlugin(),
	],
})