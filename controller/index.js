module.exports = {
	'/':function*(){
		yield this.render('index',{
			enter:'page/index.js',
			data:JSON.stringify({a:1})
		})
	}
}