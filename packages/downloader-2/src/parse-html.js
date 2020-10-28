const cheerio = require(`cheerio`)

module.exports = async function parseHtml(data){
    const $ = cheerio.load(data, { decodeEntities: false })
    $(`a`).each((_, el) => {
        const a = $(el)
        const url = a.attr(`href`)
        if(url && url.charAt(0) !== `#`){
            this.addToQueue(url)
            const newUrl = this.convertUrl(url)
            a.attr(`href`, newUrl)
        }
    })
    return $.xml()
}