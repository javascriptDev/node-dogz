

class Alert{
	constructor(txt){
		this.txt = txt || 'alert';
	}

	show(){
		console.log(this.txt);
	}
}

export default Alert;
