const cheerio = require(`cheerio`)
const srcset = require(`srcset`)

const linkEls = {
	a: `href`,
	link: `href`,
	script: `src`,
	img: `src`,
}

module.exports = async function parseHtml(data, from){
	const $ = cheerio.load(data, { decodeEntities: false })

	for(let tag in linkEls){
		const attr = linkEls[tag]

		$(tag).each((_, el) => {
			const node = $(el)
			const url = node.attr(attr)
			if(url){
				this.addToQueue(url, from)
				const newUrl = this.convertUrl(url, true)
				node.attr(attr, newUrl)
			}
		})

		// Loop through styles
		const $styleEls = $(`[style]`)
		for(let i = 0; i < $styleEls.length; i++){
			const $el = $($styleEls[i])
			let style = $el.attr(`style`)
			if(style){
				style = style.replace(/"/g, `'`)
				const newStyle = await this.parseCss(style, from)
				$el.attr(`style`, newStyle)
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