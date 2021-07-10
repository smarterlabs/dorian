const replaceCssUrls = require(`replace-css-url`)

module.exports = async function parseCss(data){
	data = replaceCssUrls(data, url => {
		if(!url) return url
		this.addToQueue(url)
		const newUrl = this.convertUrl(url, true)
		return newUrl
	})
	data = await this.emit(`parseCss`, { data })
	return data
}