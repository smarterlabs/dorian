exports.emit = async function(label, obj){
	if(this.events[label]){
		for(let fn of this.events[label]){
			const newData = await fn(obj)
			if(newData !== undefined){
				obj.data = newData
			}
		}
		if(obj && obj.data){
			return obj.data
		}
	}
}
exports.on = async function(label, fn){
	if(!(label in this.events)){
		this.events[label] = []
	}
	this.events[label].push(fn)
}