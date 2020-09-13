const { emit, on } = require(`./events`)
const build = require(`./build`)

const defaultConfig = {
	domain: ``,
	downloadAssets: [],
	transformHTML: [],
	copy: [],
	plugins: [],
	dist: `dist`,
	start: true,
}

function Dorian(userConfig){
	const config = this.config = {
		...defaultConfig,
		...userConfig,
	}
	if(!Array.isArray(config.transformHTML)){
		config.transformHTML = [ config.transformHTML ]
	}
	this.events = {}
	this.emit = emit.bind(this)
	this.on = on.bind(this)
	this.build = build.bind(this)

	if(config.start){
		this.build()
	}
}

module.exports = Dorian