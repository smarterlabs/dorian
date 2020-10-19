const { outputFile } = require(`fs-extra`)
const axios = require(`axios`)
const { join, extname } = require(`path`)
const { parse } = require(`url`)
const parseContent = require(`./parse-content`)

const defaultOptions = {
    entry: [],
    dist: `dist`,
    domains: [],
}

async function download(userOptions){
    console.log(`download()`)
    const options = { ...defaultOptions, ...userOptions }
    const state = {
        toCrawl: [...options.entry],
        knownUrls: [...options.entry],
    }
    crawlNextUrl(state, options)
}

async function crawlNextUrl(state, options){
    console.log(`crawlNextUrl()`)
    const url = state.toCrawl[0]
    if(!url){
        console.log(`Done!`)
        return
    }

    // Crawl URL
    console.log(`Fetching`, url)
    const result = await axios.get(url)
    let { links, contents, filetype } = await parseContent(result)
    if(links){
        links.forEach(link => {
            if(state.knownUrls.indexOf(link) === -1){
                state.toCrawl.push(link)
                state.knownUrls.push(link)
            }
        })
    }
    
    // Do something with contents
    // console.log(`contents`, contents)

    // Download file
    const urlPath = parse(url).pathname
    let distPath = join(options.dist, urlPath)
    if(!extname(urlPath)){
        distPath = `${distPath}.${filetype}`
    }
    await outputFile(distPath, contents)

    // Remove from to crawl list and continue
    state.toCrawl.shift()
    crawlNextUrl(state, options)
}


module.exports = download