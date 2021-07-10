const replaceCssUrls = require(`replace-css-url`)

module.exports = async function parseCss(data, from){
	data = replaceCssUrls(data, url => {
		if(!url) return url
		console.log(`url`, url)
		this.addToQueue(url, from)
		const newUrl = this.convertUrl(url, true)
		return newUrl
	})
	console.log(`css data`, data)
	// data = await this.emit(`parseCss`, { data })
	return data
}