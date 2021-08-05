const { URL, resolve } = require(`url`)
const { join } = require(`path`)
const addToQueue = require(`./add-to-queue`)
const parseXml = require(`./parse-xml`)
const parseHtml = require(`./parse-html`)
const parseCss = require(`./parse-css`)
const parse = require(`./parse`)
const writeFile = require(`./write-file`)
const { on, emit } = require(`./events`)


const defaultOptions = {
	entry: [],
	dist: `public`,
	domains: [],
	protocol: `https`,
	concurrency: 5,
	plugins: [],
}

function Downloader(userOptions){
	const options = {
		...defaultOptions,
		...userOptions,
	}
	for(let i in options){
		this[i] = options[i]
	}
	this.parsing = 0
	this.queue = [ ...options.entry ]
	this.knownUrls = [ ...options.entry ]
	this.events = {}
	options.plugins.forEach(plugin => {
		plugin.bind(this)()
	})
}
Downloader.prototype = {
	convertUrl,
	convertAbsoluteUrl,
	parse,
	parseNext,
	addToQueue,
	parseXml,
	parseHtml,
	parseCss,
	writeFile,
	findDomainPath,
	emit,
	on,
}

async function parseNext(){
	const queueLength = this.queue.length
	if(this.queue.length){
		this.parsing++
		const total = this.knownUrls.length
		const progress = total - queueLength
		console.log(`Progress: ${progress}/${total}`)
		const url = this.queue.shift()
		if(this.parsing < this.concurrency){
			this.parseNext()
		}
		await this.parse(url)
		this.parsing--
		this.parseNext()
	}
	else if(!this.parsing){
		await this.emit(`complete`)
		console.log(`Done!`)
	}
}


function convertUrl(url, makeRelative){
	if(url.indexOf(`//`) === 0 || url.indexOf(`http://`) === 0 || url.indexOf(`https://`) === 0){
		if(this.findDomainPath(url)){
			return this.convertAbsoluteUrl(url, makeRelative)
		}
	}
	return url
}
function convertAbsoluteUrl(url, makeRelative){
	if(url.indexOf(`//`) === 0){
		url = `${this.protocol}:${url}`
	}
	let obj = new URL(url)

	// If prepending a path locally
	let newPath
	this.domains.forEach(({ domain, path }) => {
		if(obj.host == domain){
			newPath = path
		}
	})
	if(newPath){
		url = resolve(obj.origin, join(newPath, obj.pathname)) + obj.search + obj.hash
		obj = new URL(url)
	}

	// If changing the origin
	if(this.replaceOrigin && !makeRelative){
		const path = url.replace(obj.origin, ``)
		url = resolve(this.replaceOrigin, path)
	}
	else{
		url = url.replace(obj.origin, ``)
	}

	return url
}

function findDomainPath(url){
	if(url.indexOf(`//`) === 0){
		url = `${this.protocol}:${url}`
	}
	let { host } = new URL(url)
	for(let i = this.domains.length; i--;){
		const { domain, path } = this.domains[i]
		if(domain == host){
			return path
		}
	}
}

module.exports = async function download(options){
	const downloader = new Downloader(options)
	await downloader.parseNext()
}