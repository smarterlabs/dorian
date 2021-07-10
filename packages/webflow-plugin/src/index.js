const { join } = require(`path`)
const globby = require(`globby`)
const cheerio = require(`cheerio`)
const { readFile, outputFile } = require(`fs-extra`)
const posthtml = require(`posthtml`)
const posthtmlWebp = require(`posthtml-webp`)
const webp = require(`webp-converter`)

webp.grant_permission()

module.exports = function webflowPlugin(){
	let excludeFromSitemap = []
	return function(){
		this.on(`parseHtml`, ({ $, url }) => {
			// Removes the "Powered by Webflow" link for paid accounts
			$(`html`).removeAttr(`data-wf-domain`)

			// Find links to remove from sitemap
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
			const dist = this.dist

			// Add webp support to HTML files
			console.log(`Adding webp support...`)
			const htmlFiles = await globby(`${dist}/**/*.html`)
			for(let file of htmlFiles){
				const html = await readFile(file, `utf8`)
				const result = await posthtml()
					.use(posthtmlWebp({
						extensionIgnore: [`svg`],
					}))
					.process(html)
				if(result){
					await outputFile(file, result.html)
				}
			}

			// Create webp images
			console.log(`Creating webp images...`)
			const images = await globby(`${dist}/**/*.{jpg,jpeg,png,gif}`)
			for(let file of images){
				const newPath = file + `.webp`
				await webp.cwebp(file, newPath, `-q 90`)
			}

			// Remove excluded pages from sitemap
			excludeFromSitemap = excludeFromSitemap.map(url => {
				url = this.convertUrl(url)
				return url
			})
			const xmlFiles = await globby(join(dist, `**/*.xml`))

			for(let xmlPath of xmlFiles){
				const xmlStr = await readFile(xmlPath, `utf8`)
				const $ = cheerio.load(xmlStr, {
					decodeEntities: false,
					xmlMode: true,
				})
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


			// Write redirects file
			const template = await readFile(join(__dirname, `_redirects.template`), `utf8`)
			let origin = process.env.WEBFLOW_URL
			while(origin[origin.length - 1] === `/`){
				origin = origin.substring(0, origin.length - 1)
			}
			let redirectsData = template.replace(/{{domain}}/g, origin)
			await outputFile(join(dist, `_redirects`), redirectsData)

		})
	}
}

