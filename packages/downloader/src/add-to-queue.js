const { resolve } = require(`url`)
const isRelative = require(`is-relative-url`)

module.exports = function addToQueue(url, from){
	if(!url) return
	const { queue, knownUrls } = this
	if(url.indexOf(`//`) === 0){
		url = `${this.protocol}:${url}`
	}
	if(isRelative(url)){
		url = resolve(from, url)
	}
	if(knownUrls.indexOf(url) === -1 && url.charAt(0) != `#`){
		const domainPath = this.findDomainPath(url)
		if(domainPath){
			knownUrls.push(url)
			queue.push(url)
		}
	}
}