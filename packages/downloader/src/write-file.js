const download = require(`download`)
const { outputFile } = require(`fs-extra`)
const { join, extname } = require(`path`)

module.exports = async function writeFile(url, contents, ext){
	const domainPath = this.findDomainPath(url)
	if(!domainPath){
		return
	}
	let obj = new URL(url)
	let { pathname } = obj
	if(!extname(pathname) && ext == `html`){
		if(pathname[pathname.length - 1] !== `/`){
			pathname = `${pathname}/` 
		}
		pathname = `${pathname}index.html`
	}
	let outputPath = join(this.dist, domainPath, decodeURIComponent(pathname))

	// Allow plugins to modify paths
	const obj = { url, outputPath }
	await this.emit(`writeFile`, obj)
	outputPath = obj.outputPath


	if(!contents){
		let data = await download(url)
		await outputFile(outputPath, data)
	}
	else{
		await outputFile(outputPath, contents)
	}
}