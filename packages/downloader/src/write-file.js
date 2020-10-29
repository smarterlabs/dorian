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
	const outputPath = join(this.dist, domainPath, pathname)
	console.log(`Writing`, outputPath, `...`)
	if(!contents){
		console.error(`No contents in "${url}"`)
		process.exit(1)
	}
	if(ext === `jpg`){
		console.log(`jpg contents`, contents)
		contents = Buffer.from(contents.replace(/^data:image\/\w+;base64,/, ``), `base64`)
	}
	await outputFile(outputPath, contents)
	console.log(`Wrote`, outputPath)
}