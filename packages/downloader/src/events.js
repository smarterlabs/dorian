exports.emit = async function(label, ...args){
	if(this.events[label]){
		for(let fn of this.events[label]){
			await fn(...args)
		}
	}
}
exports.on = async function(label, fn){
	if(!(label in this.events)){
		this.events[label] = []
	}
	this.events[label].push(fn)
}