const download = require(`download`)
const { outputFile } = require(`fs-extra`)
const { join, extname } = require(`path`)

module.exports = async function writeFile(url, contents, ext){
	const domainPath = this.findDomainPath(url)
	if(!domainPath){
		console.log(`Not crawling "${url}", domain not in allow list`)
		return
	}
	let obj = new URL(url)
	let { pathname } = obj
	if(!pathname){
		console.log(`pathname not found for "${url}"`)
	}
	if(!extname(pathname) && ext == `html`){
		console.log(`Changing file path`)
		if(pathname[pathname.length - 1] !== `/`){
			pathname = `${pathname}/` 
		}
		pathname = `${pathname}index.html`
	}
	const outputPath = join(this.dist, domainPath, decodeURIComponent(pathname))
	console.log(`Writing`, outputPath, `...`)
	if(!contents){
		const data = await download(url)
		await outputFile(outputPath, data)
	}
	else{
		await outputFile(outputPath, contents)
	}
	console.log(`Wrote`, outputPath)
}