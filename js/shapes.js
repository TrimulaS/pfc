// Classes to fillup shapes randomly

//undefined

class Shape{
    static num = 0
    constructor(type, color = 'blue', left = 0, top = 0 , width = 10, height = 10,  id=''){
        this.type = type
        this.left = left
        this.top = top
        this.width = width
        this.height =  height
        this.color = color
        Shape.num++
        this.id = id === '' ? Shape.num : Shape.num + '_' + id; // Используем Shape.num
        
    }
    getBoundingClientRect(){
        return         {
            left: this.left,
            top: this.top,
            right: this.left + this.width,
            bottom: this.top + this.height,
            width: this.width,
            height: this.height
        };
    }
    toString(){
        return `shape:${this.type}: ${this.left} x ${this.top}  [ ${this.width} x ${this.height} ]`
    }
}

class ShapeRandom extends Shape {
    constructor(Xmin_i, Xmax_i, Ymin_i, Ymax_i) {
        const left = Xmin_i + Math.random() * (Xmax_i - Xmin_i);
        const top = Ymin_i + Math.random() * (Ymax_i - Ymin_i);
        const width = Math.floor(Math.random() * (Xmax_i - Xmin_i) + 1);
        const height = Math.floor(Math.random() * (Ymax_i - Ymin_i) + 1);
        const color = ShapeRandom.getColor()
        let type;
        switch (Math.floor(Math.random() * 4)) {
            case 0: type = 'circle'; break;
            case 1: type = 'rect'; break;
            case 2: type = 'line'; break;
            case 3: type = 'point'; break;
            default: type = 'none';
        }

        super(type, color, left, top, width, height, '-rnd');
    }
    static getColor(){
        return  `rgba(${Math.floor(255 * Math.random())}, ${Math.floor(255 * Math.random())}, ${Math.floor(255 * Math.random())}, ${Math.random().toFixed(2)})`;

    }
}





class ShapeSet{
    shapes = []
    // Initial sizes to generate shapes
    Xmin_i = 0
    Xmax_i = 0
    Ymin_i = 0
    Ymax_i = 0
    // Result boundaries
    Xmin = 0
    Xmax = 0
    Ymin = 0
    Ymax = 0

    // Filling up shapes
    constructor(shapesNum, Xmin_i, Xmax_i, Ymin_i, Ymax_i){
		this.Xmin_i = Xmin_i
		this.Xmax_i = Xmax_i
		this.Ymin_i = Ymin_i
		this.Ymax_i = Ymax_i

        this.shapesNum = shapesNum

        this.fillRandomly(shapesNum)
        this.fillWithSquares(shapesNum)
        this.defineBoundaries(shapesNum)
			
    }
    fillRandomly(shapesNum){
		for(let i = 0; i< shapesNum; i++){
			
			this.shapes.push( new ShapeRandom (this.Xmin_i, this.Xmax_i, this.Ymin_i, this.Ymax_i))
		}
    }

    fillWithSquares(shapesNum){
		for(let i = 0; i < Math.sqrt(shapesNum); i++){
            for(let j = 0; j < Math.sqrt(shapesNum); j++){
			
                let type = 'rect';
                const w =  ( this.Xmax_i -  this.Xmin_i ) / Math.sqrt(shapesNum)
                const h =  ( this.Ymax_i -  this.Ymin_i ) / Math.sqrt(shapesNum)

                const side = Math.max(w,h)

                this.shapes.push( new Shape (type,ShapeRandom.getColor(), this.Xmin_i + side * i, this.Ymin_i + side * j, side * 0.8 ,side * 0.8))
            }
		}
    }

    defineBoundaries(){
        		//Define whole shapes bounds:
		this.Xmin = this.shapes[0].left
		this.Xmax = this.shapes[0].left + this.shapes[0].width
		this.Ymin = this.shapes[0].top
		this.Ymax = this.shapes[0].top  + this.shapes[0].height

		for(let i = 1; i< this.shapes.length; i++){
			const s = this.shapes[i]
			if( this.Xmin > s.left) this.Xmin = s.left
			if( this.Xmax < s.left + s.width ) this.Xmax = s.left + s.width
			if( this.Ymin > s.top) this.Ymin = s.top
			if( this.Ymax < s.top + s.height ) this.Ymax = s.top + s.height
		}
		

    }


}