module.exports = function addToQueue(url){
	if(!url) return
	const { queue, knownUrls } = this
	if(url.indexOf(`//`) === 0){
		url = `${this.protocol}:${url}`
	}
	if(knownUrls.indexOf(url) === -1 && url.charAt(0) !== `#`){
		knownUrls.push(url)
		queue.push(url)
	}
}