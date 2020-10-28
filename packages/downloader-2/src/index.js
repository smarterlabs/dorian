const { URL, resolve } = require(`url`)
const { join } = require(`path`)
const addToQueue = require(`./add-to-queue`)
const parseXml = require(`./parse-xml`)
const parseHtml = require(`./parse-html`)
const parse = require(`./parse`)
const writeFile = require(`./write-file`)

const defaultOptions = {
    entry: [],
    dist: `dist`,
    domains: [],
}

function Downloader(userOptions){
    const options = {
        ...defaultOptions,
        ...userOptions,
    }
    for(let i in options){
        this[i] = options[i]
    }
    this.queue = [ ...options.entry ]
    this.knownUrls = [ ...options.entry ]
}
Downloader.prototype = {
    convertUrl,
    convertAbsoluteUrl,
    parse,
    parseNext,
    addToQueue,
    parseXml,
    parseHtml,
    writeFile,
    findDomainPath,
}

async function parseNext(){
    if(this.queue.length){
        const url = this.queue.shift()
        await this.parse(url)
        this.parseNext()
    }
    else{
        console.log(`Done!`)
    }
}


function convertUrl(url){
    if(url.indexOf(`//`) === 0 || url.indexOf(`http://`) === 0 || url.indexOf(`https://`) === 0){
        return this.convertAbsoluteUrl(url)
    }
}
function convertAbsoluteUrl(url){
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
    if(this.replaceOrigin){
        const path = url.replace(obj.origin, ``)
        url = resolve(this.replaceOrigin, path)
    }

    return url
}

function findDomainPath(url){
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