const cheerio = require(`cheerio`)
const srcset = require(`srcset`)

const linkEls = {
	link: `href`,
	script: `src`,
	img: `src`,
}
if(process.env.BCP){
	linkEls.a = `href`
} 

module.exports = async function parseHtml(data, from){
	const $ = cheerio.load(data, { decodeEntities: false })

	for(let tag in linkEls){
		const attr = linkEls[tag]

		$(tag).each((_, el) => {
			const node = $(el)
			const url = node.attr(attr)
			if(
				url &&
				!url.startsWith(`data:`) &&
				!url.startsWith(`mailto:`) &&
				!url.startsWith(`tel:`) &&
				!url.startsWith(`#`) &&
				!url.startsWith(`javascript:`)
			){
				this.addToQueue(url, from)
				const newUrl = this.convertUrl(url, true)
				node.attr(attr, newUrl)
			}
		})



		// Loop through inline styles
		const $styleEls = $(`[style]`)
		for(let i = 0; i < $styleEls.length; i++){
			const $el = $($styleEls[i])
			let style = $el.attr(`style`)
			if(style){
				style = style.replace(/"/g, `'`)
				const newStyle = await this.parseCss(style, from)
				// console.log(`newStyle`, newStyle)
				// process.exit(0)
				$el.attr(`style`, newStyle)
			}
		}
		// Loop through style tags
		const $styleTags = $(`style`)
		for(let i = 0; i < $styleTags.length; i++){
			const $el = $($styleTags[i])
			let style = $el.html()
			if(style){
				style = style.replace(/"/g, `'`)
				const newStyle = await this.parseCss(style, from)
				// console.log(`newStyle`, newStyle)
				// process.exit(0)
				$el.html(newStyle)
			}
		}

		// Parse srcset
		$(`img`).each((_, el) => {
			const node = $(el)
			const str = node.attr(`srcset`)
			if(str){
				const parsed = srcset.parse(str)
				parsed.forEach(obj => {
					this.addToQueue(obj.url, from)
					const newUrl = this.convertUrl(obj.url, true)
					obj.url = newUrl
				})
				const newStr = srcset.stringify(parsed)
				node.attr(`srcset`, newStr)
			}
		})

		// Parse data-src
		$(`[data-src]`).each((_, el) => {
			const node = $(el)
			const url = node.attr(`data-src`)
			if(url){
				this.addToQueue(url, from)
				const newUrl = this.convertUrl(url, true)
				node.attr(`data-src`, newUrl)
			}
		})

		// Parse og:image
		$(`meta[property="og:image"]`).each((_, el) => {
			const node = $(el)
			const url = node.attr(`content`)
			if(url){
				this.addToQueue(url, from)
				const newUrl = this.convertUrl(url, true)
				node.attr(`content`, newUrl)
			}
		})
	}

	await this.emit(`parseHtml`, { $, url: from })

	return $.html()
}