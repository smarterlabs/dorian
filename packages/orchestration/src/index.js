const download = require(`@app/downloader`)
const { join } = require(`path`)
const globby = require(`globby`)
const cheerio = require(`cheerio`)
const { readFile, outputFile } = require(`fs-extra`)

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

function webflowPlugin(){
	let excludeFromSitemap = []
	return function(){
		this.on(`parseHtml`, ({ $, url }) => {
			// Removes the "Powered by Webflow" link for paid accounts
			$(`html`).removeAttr(`data-wf-domain`)

			const $body = $(`body`)
			let includeInSitemap = $body.attr(`sitemap`)
			if(includeInSitemap){
				$body.removeAttr(`sitemap`)
			}
			if(includeInSitemap === `false` || includeInSitemap === `0` || includeInSitemap === `no`){
				includeInSitemap = false
			}
			else{
				includeInSitemap = true
			}
			if(!includeInSitemap){
				excludeFromSitemap.push(url)
			}
		})

		this.on(`complete`, async () => {
			excludeFromSitemap = excludeFromSitemap.map(url => {
				url = this.convertUrl(url)
				return url
			})
			const dist = this.dist
			const xmlFiles = await globby(join(dist, `**/*.xml`))

			for(let xmlPath of xmlFiles){
				const xmlStr = await readFile(xmlPath, `utf8`)
				const $ = cheerio.load(xmlStr, { decodeEntities: false })
				$(`url`).each((_, el) => {
					const $url = $(el)
					const loc = $url.find(`loc`)
					const url = loc.text().trim()
					if(excludeFromSitemap.indexOf(url) > -1){
						$url.remove()
					}
				})
				const newXml = $.xml()
				console.log(`Writing new Sitemap...`)
				await outputFile(xmlPath, newXml)
			}


		})
	}
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