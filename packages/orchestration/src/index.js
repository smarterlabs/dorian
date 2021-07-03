const download = require(`@app/downloader`)

// let siteUrl = `https://business-starter-template.webflow.io`
// let destinationOrigin = `https://smarterlabs.com/`
let siteUrl = process.env.SOURCE_URL
let destinationOrigin = process.env.DESTINATION_URL

// Exit if environment variables are missing
if(!siteUrl){
	console.error(`No "SOURCE_URL" environment variable set.`)
	process.exit(1)
}
if(!destinationOrigin){
	console.error(`No "DESTINATION_URL" environment variable set.`)
	process.exit(1)
}

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
})