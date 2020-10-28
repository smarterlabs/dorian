const { outputFile } = require(`fs-extra`)
const { join, extname } = require(`path`)

module.exports = async function writeFile(url, contents, ext){
    const domainPath = this.findDomainPath(url)
    let { pathname } = new URL(url)
    console.log(`pathname`, pathname, ext, `"${extname(pathname)}"`, typeof extname(pathname), `\n`)
    if(!extname(pathname) && ext == `html`){
        console.log(`Changing file path`)
        if(pathname[pathname.length - 1] !== `/`){
            pathname = `${pathname}/` 
        }
        pathname = `${pathname}index.html`
    }
    const outputPath = join(this.dist, domainPath, pathname)
    console.log(`Writing`, outputPath, `...`)
    await outputFile(outputPath, contents)
    console.log(`Wrote`, outputPath)
}