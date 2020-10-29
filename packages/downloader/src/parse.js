const axios = require(`axios`)
const get = require(`lodash/get`)

module.exports = async function parse(url){
	console.log(`parseUrl`, url)

	// Fetch URL
	const head = await axios.head(url)
	const contentType = get(head, `headers.content-type`)

	// Parse XML
	if(contentType.indexOf(`application/rss`) === 0 || contentType.indexOf(`application/xml`) === 0){
		console.log(`Parsing "${url}" as XML`)
		const result = await axios.get(url)
		const newContents = await this.parseXml(result.data)
		await this.writeFile(url, newContents, `xml`)
	}
	// Parse HTML
	else if(contentType.indexOf(`text/html`) === 0){
		console.log(`Parsing "${url}" as HTML`)
		const result = await axios.get(url)
		const newContents = await this.parseHtml(result.data, url)
		await this.writeFile(url, newContents, `html`)
	}
	// Download
	else{
		console.log(`Not parsing "${url}"`)
		await this.writeFile(url)
	}

}