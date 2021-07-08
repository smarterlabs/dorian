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

		// Parse styles
		$(`[style]`).each((_, el) => {
			const node = $(el)
			let style = node.attr(`style`)
			style = style.replace(/"/g, `&quot;`)
			node.attr(`style`, style)
			// console.log(`style`, style)
		})

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
	}

	await this.emit(`parseHtml`, { $ })

	return $.html()
}