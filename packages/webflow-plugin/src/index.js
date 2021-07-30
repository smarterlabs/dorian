const { join } = require(`path`)
const globby = require(`globby`)
const cheerio = require(`cheerio`)
const { readFile, outputFile } = require(`fs-extra`)
const posthtml = require(`posthtml`)
const posthtmlWebp = require(`posthtml-webp`)
const webp = require(`webp-converter`)
const get = require(`lodash/get`)
const postcss = require('postcss')
const postcssWebp = require(`webp-in-css/plugin`)
const axios = require(`axios`)
const { exists } = require('fs-extra')

webp.grant_permission()

module.exports = function webflowPlugin(){
	let excludeFromSitemap = []
	return function(){
		
		this.on(`parseCss`, async ({ data }) => {
			const result = await postcss([postcssWebp({
				rename: oldName => {
					// Extracts url from CSS string background image
					const oldUrl = oldName.match(/url\(['"]?([^'"]+)['"]?\)/)[1]
					const newUrl = `${oldUrl}.webp`
					const newName = oldName.replace(oldUrl, newUrl)
					return newName
				}
			})])
    			.process(data, { from: undefined })
			return result.css
		})

		this.on(`parseHtml`, ({ $, url }) => {
			const $body = $(`body`)
			const $head = $(`head`)
			const $html = $(`html`)

			// Polyfill for webp
			$body.append(`<script>document.body.classList.remove('no-js');var i=new Image;i.onload=i.onerror=function(){document.body.classList.add(i.height==1?"webp":"no-webp")};i.src="data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";</script>`)

			// Removes the "Powered by Webflow" link for paid accounts
			$html.removeAttr(`data-wf-domain`)

			// Make webfonts.js async
			// let webfontsJs = `{}`
			// let webfontsSrc = ``
			// $(`script`).each((i, el) => {
			// 	const $el = $(el)
			// 	const src = $el.attr(`src`)
			// 	const contents = get(el, `children.0.data`, ``)
			// 	if (
			// 		src &&
			// 		src.indexOf(`googleapis.com`) > -1 &&
			// 		src.indexOf(`webfont.js`) > -1
			// 	) {
			// 		webfontsSrc = src
			// 		$el.remove()
			// 	}
			// 	if(contents && contents.indexOf(`WebFont.load({`) === 0){
			// 		webfontsJs = contents.replace(`WebFont.load(`, ``).replace(`);`, ``)
			// 		$el.remove()
			// 	}
			// })
			// $head.append(`<script>WebFontConfig=${webfontsJs},function(e){var o=e.createElement("script"),t=e.scripts[0];o.src="${webfontsSrc}",o.async=!0,t.parentNode.insertBefore(o,t)}(document);</script>`)

			// Fix cross-origin links
			$(`a`).each((i, el) => {
				const $el = $(el)
				const href = $el.attr(`href`)
				if (href && href.indexOf(`://`) > -1) {
					$el.attr(`rel`, `noopener noreferrer`)
				}
			})

			// Find links to remove from sitemap
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

			// Create robots.txt if it doesn't exist
			const robotsExists = await exists(join(dist, `robots.txt`))
			if (!robotsExists) {
				console.log(`Creating robots.txt...`)
				await outputFile(join(dist, `robots.txt`), ``)
			}

			// Add webp support to HTML files
			console.log(`Adding webp support...`)
			const htmlFiles = await globby(`${dist}/**/*.html`)
			for(let file of htmlFiles){
				let html = await readFile(file, `utf8`)

				// Add webp support to image tags
				const result = await posthtml()
					.use(posthtmlWebp({
						extensionIgnore: [`svg`],
					}))
					.process(html)
				html = result.html

				await outputFile(file, html)
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

