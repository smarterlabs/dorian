const axios = require(`axios`)
const get = require(`lodash/get`)

module.exports = async function parse(url){
	console.log(`parseUrl`, url)

	// Fetch URL
	const result = await axios.get(url)
	const contentType = get(result, `headers.content-type`, ``).toLowerCase()
	let ext
	console.log(`contentType`, contentType)
	const data = result.data
	let newContents = data

	// Parse XML
	if(contentType.indexOf(`application/rss`) === 0 || contentType.indexOf(`application/xml`) === 0){
		console.log(`Parsing "${url}" as XML`)
		newContents = await this.parseXml(data)
		ext = `xml`
	}
	else if(contentType.indexOf(`text/html`) === 0){
		console.log(`Parsing "${url}" as HTML`)
		newContents = await this.parseHtml(data)
		ext = `html`
	}
	else if(contentType.indexOf(`image/jpeg`) === 0){
		ext = `jpg`
	}
	else{
		console.log(`Not parsing "${url}"`)
	}

	await this.writeFile(url, newContents, ext)

	this.parseNext()
}