const getSitemapLinks = require(`sitemap-links`)
const get = require(`lodash/get`)
const find = require(`lodash/find`)
const { parse } = require(`url`)
const { join } = require(`path`)

const reg = {
    //Mime types
    REGEX_MIME_HTML:/^text\/html\b/i,
    REGEX_MIME_CSS:/^text\/css\b/i,
    REGEX_MIME_XML: /^application\/rss\+xml\b/i,

    //Source parsing
    REGEX_LINK: /<a[^>]+?href=['"]([^'"{}]*?)['"]/ig,
    REGEX_STYLE: /<link[^>]+?href=['"]([^'"{}]*?)['"]/ig,
    REGEX_SCRIPT: /<script[^>]+?src=['"]([^'"{}]*?)['"]/ig,
    REGEX_IMG: /<img[^>]+?src=['"]((?!data:)[^'"{}]*?)['"]/ig,
    REGEX_SOURCE_SET: /<source[^>]+?srcset=['"]((?!data:)[^'"{}]*?)['"]/ig,
    REGEX_CSS_IMPORT: /@import[\s\S]+?['"]([^'"{}]*?)['"]/ig,
    REGEX_CSS_RESOURCE: /url\((?!data:)['"]?([^'"{}]*?)['"]?\)/ig,

    // URLs
    REGEX_URL_BASE: /^(([a-z0-9]+)?\:?\/\/)?([^\/\s]+\.[^\/\s]+).*$/i,
    REGEX_URL_CURRENT: /^[a-z0-9]+\:\/\/(([^\/\s]+)(.+\/)?)/i, //Requires absolute URL
    REGEX_URL_EXTENSION: /^[a-z0-9]+\:\/\/.+\/.+\.([^\.]+?)([?#].*)?$/i, //Requires absolute URL
    REGEX_URL_IS_ABSOLUTE: /^(([a-z0-9]+)?\:\/\/).+$/i,
    REGEX_URL_ACTION: /^([a-z0-9]+\:)(?!\/\/)([^'"\s]+)$/i, //mailto:test@test.com, tel:5555555555
    REGEX_URL_BASIC_AUTH: /^(([a-z0-9]+)?\:?\/\/)?(.+\:.+@)/i, //username:password@example.com
    REGEX_URL_FULL: /^(([a-z0-9]+)\:\/\/)([^\/\s]+\.[^\/\s]+)(.+\/)?([^\.\s]*?(\..+?)?)([?#].*)?$/i, //Requires absolute URL
}

async function parseContent(result, options, state){
    // console.log(`result`, result)
    const contentType = get(result, `headers.content-type`)
    let contents = result.data || ``
    let links = []
    let filetype

    // Parse links from sitemap file
    if(reg.REGEX_MIME_XML.test(contentType)){
        links = await getSitemapLinks(result.config.url, 1000)
        filetype = `xml`
    }


    // This will recrawl, but it's cleaner since the sitemap could be multiple files
    // if(reg.REGEX_MIME_XML.test(contentType)){
    //     links = await getSitemapLinks(result.config.url, 1000)
    //     filetype = `xml`
    // }

    // Parse links from HTML file
    if(reg.REGEX_MIME_HTML.test(contentType)){
        filetype = `html`
        contents = contents.replace(reg.REGEX_LINK, (str, link) => {
            // Exit early if unwanted link
            if(link.indexOf(`#`) === 0) return str
            if(reg.REGEX_URL_ACTION.test(link)) return str

            if(!reg.REGEX_URL_IS_ABSOLUTE.test(link)){
                // Not sure if this second argument is correct, might need to get base URL from "link"?
                link = makeUrlAbsolute(link, getUrlBase(result.config.url), result.config.url)
            }

            const parsed = parse(link)
            const domain = parsed.hostname
            const domainOptions = find(options.domains, { domain })
            if(!domainOptions) return str

            links.push(link)
            return str
        })
    }

    return { links, contents, filetype }
    
}

function makeUrlAbsolute(relativeUrl, baseUrl, currentUrl){
    var path = getUrlPath(relativeUrl)
    switch (true){
        //Starts with "." or ".." or "test"
        case /^\./.test(path):
            var currentPathMatch = reg.REGEX_URL_CURRENT.exec(currentUrl)
            if (currentPathMatch){
                currentUrl = currentPathMatch[0]
            }
            return concatUrl(currentUrl, path)

        //Starts with /
        case /^\//.test(path):
        default:
            //Use baseUrl from relativeUrl if we can. Otherwise use passed in baseUrl
            if (!baseUrl){
                throw new Error("baseURL undefined")
            }
            try {
                var relativeBaseUrl = getUrlBase(relativeUrl)
                if (relativeBaseUrl != baseUrl){
                    baseUrl = relativeBaseUrl
                }
            } catch (error){}
            return concatUrl(baseUrl, path)
    }
}

function getUrlPath(url){
    return url.replace(getUrlBase(url, true), "")
}

function getUrlBase(url, raw){
    raw = raw === true;

    var match = reg.REGEX_URL_BASE.exec(url);
    if (match && match.length >= 4){
        if (raw){
            return `${match[1]}${match[3]}`
        } else {
            var protocol = match[2] || `https`
            return `${protocol}://${match[3]}`;
        }
    } else if (!raw){
        throw new Error("Base URL could not be determined");
    }
}

function concatUrl(host, path){
    var lastChar = host[host.length - 1];
    var firstChar = path[0];
    if (lastChar != "/" && firstChar != "/"){
        return host + "/" + path;
    } else if (lastChar == "/" && firstChar == "/"){
        return host.substr(0, host.length - 1) + path;
    } else {
        return host + path;
    }
}

module.exports = parseContent