const Crawler = require(`crawler`)
const getSitemapLinks = require(`sitemap-links`)
const { join, basename, extname } = require(`path`)
// const url = require(`url`)
const download = require(`download-file`)
const getUrls = require(`get-urls`)
const { pathExists, outputFile } = require(`fs-extra`)

const domain = process.env.WEBFLOW_DOMAIN || `https://smarterlabs.webflow.io`
const acceptedDomains = [
	domain,
	`https://assets.website-files.com`,
]
const distPath = `./dist`
const imagePath = `/images`

const imageUrls = []
const fullImagePath = join(distPath, imagePath)
function getLocalImagePath(src){
	return join(fullImagePath, basename(src))
}
function getWebImagePath(src) {
	return join(imagePath, basename(src))
}

function asyncDownload(src){
	return new Promise((resolve, reject) => {
		let filename = basename(src)
		download(src, {
			directory: fullImagePath,
			filename,
		}, function (err) {
			if (err) {
				console.log(err)
				console.error(`Image failed to download "${src}"`)
				process.exit(1)
				reject(err)
			}
			resolve()
		})
	})
}
async function downloadImage(src){
	imageUrls.push(src)
	const localPath = getLocalImagePath(src)
	const exists = await pathExists(localPath)
	if (exists){
		console.log(`File already exists: "${localPath}"`)
		return
	}
	console.log(`Downloading`, src)
	await asyncDownload(src)
}

async function go(){

	// Get initial list of links from sitemap
	const toCrawl = await getSitemapLinks(`${domain}/sitemap.xml`, 1000)
	if(!toCrawl.length){
		toCrawl.push(domain)
	}

	function onCrawl(error, res, done) {
		if (error) {
			console.log(error)
		}
		else {
			// TODO: Check headers here to make sure it's actually HTML
			// res.headers.content-type === `html`
			// console.log(`res`, res)
			// process.exit(0)

			const { uri } = res.options || {}
			console.log(`Parsing "${uri}"...`)

			const $ = res.$
			const head = $(`head`)

			// Remove generator tag
			$(`meta[name="generator"]`).remove()

			// Make sure lang is set
			const html = $(`html`)
			if(!html.attr(`lang`)){
				html.attr(`lang`, `en`)
			}


			// Look for images to download & replace
			const imgs = $(`img`)
			imgs.each(i => {
				const img = $(imgs[i])
				const src = img.attr(`src`)
				let path = getFileUrl(src)
				path = decodeURIComponent(path)
				if (path && imageUrls.indexOf(path) === -1){
					const newSrc = getWebImagePath(src)
					img.attr(`src`, newSrc)
					downloadImage(path)
				}
			})

			// Look for background images to download & replace
			const styleEls = $(`*[style]`)
			styleEls.each(i => {
				const el = $(styleEls[i])
				let style = el.attr(`style`)
				const origStyle = style
				const urlsSet = getUrls(style)
				const urls = Array.from(urlsSet)
				urls.forEach(path => {
					if (path && imageUrls.indexOf(path) === -1) {
						const newPath = getWebImagePath(path)
						while(style.indexOf(path) > -1){
							style = style.replace(path, newPath)
						}
						downloadImage(path)
					}
				})
				if(style !== origStyle){
					el.attr(`style`, style)
				}
			})

			// Look for links to add the the crawl list and download
			const links = $(`a`)
			links.each((i, el) => {
				const link = $(el)
				let href = link.attr(`href`)
				href = getFileUrl(href)
				if(href && toCrawl.indexOf(href) === -1){
					console.log(`Adding`, href)
					toCrawl.push(href)
					c.queue(href)
				}
			})

			//  Add rel="noopener noreferrer" to external links
			$(`a[target="_blank"]`).attr(`rel`, `noopener noreferrer`)

			// Use title as description if description doesn't exist
			if(!$(`meta[name="description"]`).length){
				const title = $(`title`).text()
				head.append(`<meta name="description" content="${title || `No description`}" />`)
			}

			// Hide Webflow badge
			head.append(`<style>.w-webflow-badge{display:none !important}</style>`)

			// Remove comments
			$.root()
				.contents()
				.filter(function() { return this.type === `comment` })
				.remove()

			// Download file
			// console.log(`res`, res)
			// process.exit(0)
			const urlObj = new URL(uri)
			let outputPath = join(distPath, urlObj.pathname)
			if (!extname(outputPath)){
				outputPath = `${outputPath}/index.html`
			}
			outputFile(outputPath, $.html())

		}



		done()
	}

	const c = new Crawler({
		maxConnections: 1,
		callback: onCrawl,
	})
	c.queue(toCrawl)
}
go()

function getFileUrl(href) {
	if (!href) return
	if (href === `#`) return
	if (href.indexOf(`:`) > -1) {
		const url = new URL(href)
		if (acceptedDomains.indexOf(url.origin) === -1) {
			return
		}
	}
	else if (href.indexOf(`/`) === 0) {
		href = `${domain}${href}`
	}
	else{
		href = `${domain}/${href}`
	}
	return href
}