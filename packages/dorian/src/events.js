exports.emit = function emit(name, ...args){
	if(!this.events[name]) return
	this.events.forEach(fn => fn(...args))
}

exports.on = function on(name, fn){
	const { events } = this
	if(!events[name]){
		events[name] = []
	}
	events[name].push(fn)
}