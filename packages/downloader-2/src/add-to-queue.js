module.exports = async function addToQueue(url){
    const { queue, knownUrls } = this
    if(knownUrls.indexOf(url) === -1){
        knownUrls.push(url)
        queue.push(url)
    }
}