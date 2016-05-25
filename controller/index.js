module.exports = {
	'/':function*(){
		yield this.render('index',{
			enter:'page/index.js',
			css:['css/page/index.css']
		})
	}
}