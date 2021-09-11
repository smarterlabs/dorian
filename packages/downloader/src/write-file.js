const download = require(`download`)
const { outputFile } = require(`fs-extra`)
const { join, extname } = require(`path`)

module.exports = async function writeFile(url, contents, ext){
	console.log(`Writing URL:`, url)
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
		// Convert search parameters to static path
		if(obj.search){
			let search = obj.search
				.replace(/\?/g, ``)
				.replace(/[&=]/g, `/`)
			pathname = `${pathname}${search}/`
		}
		pathname = `${pathname}index.html`
	}
	let outputPath = join(this.dist, domainPath, decodeURIComponent(pathname))

	// Allow plugins to modify paths
	const pluginObj = { url, outputPath }
	await this.emit(`writeFile`, pluginObj)
	outputPath = pluginObj.outputPath



	if(!contents){
		let data = await download(url)
		await outputFile(outputPath, data)
	}
	else{
		await outputFile(outputPath, contents)
	}
}