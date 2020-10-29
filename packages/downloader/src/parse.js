const axios = require(`axios`)
const get = require(`lodash/get`)

module.exports = async function parse(url){
	console.log(`Parsing "${url}"`)

	// Fetch URL
	let head
	try{ head = await axios.head(url) } catch(err){ return }
	const contentType = get(head, `headers.content-type`)

	// Parse XML
	if(contentType.indexOf(`application/rss`) === 0 || contentType.indexOf(`application/xml`) === 0){
		let result
		try{ result = await axios.get(url) } catch(err){ return }
		const newContents = await this.parseXml(result.data)
		await this.writeFile(url, newContents, `xml`)
	}
	// Parse HTML
	else if(contentType.indexOf(`text/html`) === 0){
		let result
		try{ result = await axios.get(url) } catch(err){ return }
		const newContents = await this.parseHtml(result.data, url)
		await this.writeFile(url, newContents, `html`)
	}
	// Parse CSS
	else if(contentType.indexOf(`text/css`) === 0){
		let result
		try{ result = await axios.get(url) } catch(err){ return }
		const newContents = await this.parseCss(result.data, url)
		await this.writeFile(url, newContents, `css`)
	}
	// Download as is
	else{
		await this.writeFile(url)
	}

}