const download = require(`@app/downloader`)
const webflowPlugin = require(`@app/webflow-plugin`)

// Exit if environment variables are missing
let siteUrl = process.env.WEBFLOW_URL
let destinationOrigin = process.env.URL || process.env.DEPLOY_URL
if(!siteUrl){
	console.error(`No "WEBFLOW_URL" environment variable set.`)
	process.exit(1)
}
if(!destinationOrigin){
	console.error(`No "URL" or "DEPLOY_URL" environment variable set.`)
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
		`${siteUrl}/robots.txt`,
		`${siteUrl}/sitemap.xml`,
	],
	domains: [
		{ domain: siteUrl.split(`://`)[1], path: `/` },
		{ domain: `assets.website-files.com`, path: `/assets` },
		{ domain: `uploads-ssl.webflow.com`, path: `/assets` },
	],
	replaceOrigin: destinationOrigin,
	concurrency: 10,
	dist: `../../public`,
	plugins: [
		webflowPlugin(),
	],
})