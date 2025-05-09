// Classes to fillup shapes randomly

//undefined

/*

Shape
	Sizes
		Top
		Left
		Width
		Height
		Color

*/

class Shape{
    static num = 0
    constructor(type, color, left = 0, top = 0 , width = 10, height = 10,  id='', notes = ''){
        this.type = type
        this.left = left
        this.top = top
        this.width = width
        this.height =  height
        this.color = (color === undefined) ? ShapeRandom.getColor() : color;
        Shape.num++
        this.id = id === '' ? Shape.num : Shape.num + '_' + id; // Используем Shape.num
        this.notes = notes
        
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


//new Shape('rect', undefined,  left,   top,    width,   height, id                  , notes)


// new Shape('rect', undefined, 1000,   541000,    800,   541000,          'Фанерозой',     'Eon' )      //	от 541 млн лет назад до
// new Shape('rect', undefined, 1000,  2500000,    800,  1959000,         'Протерозой',     'Eon' )      //	от 2.5 млрд до 541 млн лет назад
// new Shape('rect', undefined, 1000,  4000000,    800,  1500000,              'Архей',     'Eon' )      //	от 4 до 2.5 млрд лет назад
// new Shape('rect', undefined, 1000,  4600000,    800,   600000,   'Катархей (Гадей)',     'Eon' )      //  от 4.6 до 4 млрд лет назад









class ShapeRandom extends Shape {
    constructor(Xmin_i, Xmax_i, Ymin_i, Ymax_i) {

        const shapeMaxW = ( Xmax_i - Xmin_i ) / 10          // Shape width is about 100 of alowed are width
        const shapeMaxH = ( Ymax_i - Ymin_i ) / 10

        const left = Xmin_i + Math.random() * (Xmax_i - Xmin_i);
        const top  = Ymin_i + Math.random() * (Ymax_i - Ymin_i);
        const width  = Math.floor(Math.random() * shapeMaxW )           //  Math.floor(Math.random() * (Xmax_i - Xmin_i) + 1);
        const height = Math.floor(Math.random() * shapeMaxH )           //Math.floor(Math.random() * (Ymax_i - Ymin_i) + 1);

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

        //this.fillRandomly(shapesNum)
        //this.fillWithSquares(shapesNum)
        this.fillExact()


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

                this.shapes.push( new Shape (type,undefined, this.Xmin_i + side * i, this.Ymin_i + side * j, side * 0.8 ,side * 0.8))
            }
		}
    }

    fillExact(){

        const data = [
            { "id": "Фанерозой", "Start": 541000, "End": 0, "Type": "Eon", "Shift": 1, "English": "Phanerozoic" },
            { "id": "Протерозой", "Start": 2500000, "End": 541000, "Type": "Eon", "Shift": 1, "English": "Proterozoic" },
            { "id": "Архей", "Start": 4000000, "End": 2500000, "Type": "Eon", "Shift": 1, "English": "Archean" },
            { "id": "Катархей (Гадей)", "Start": 4600000, "End": 4000000, "Type": "Eon", "Shift": 1, "English": "Hadean" },
          
            { "id": "Кайнозой", "Start": 66000, "End": 0, "Type": "Era", "Shift": 2, "English": "Cenozoic" },
            { "id": "Мезозой", "Start": 251902, "End": 66000, "Type": "Era", "Shift": 2, "English": "Mesozoic" },
            { "id": "Палеозой", "Start": 538800, "End": 251902, "Type": "Era", "Shift": 2, "English": "Paleozoic" },
            { "id": "Нео - протерозой", "Start": 1000000, "End": 538800, "Type": "Era", "Shift": 2, "English": "Neoproterozoic" },
            { "id": "Мезо - протерозой", "Start": 1600000, "End": 1000000, "Type": "Era", "Shift": 2, "English": "Mesoproterozoic" },
            { "id": "Палео - протерозой", "Start": 2500000, "End": 1600000, "Type": "Era", "Shift": 2, "English": "Paleoproterozoic" },
            { "id": "Неоархей", "Start": 2800000, "End": 2500000, "Type": "Era", "Shift": 2, "English": "Neoarchean" },
            { "id": "Мезоархей", "Start": 3200000, "End": 2800000, "Type": "Era", "Shift": 2, "English": "Mesoarchean" },
            { "id": "Палеоархей", "Start": 3600000, "End": 3200000, "Type": "Era", "Shift": 2, "English": "Paleoarchean" },
            { "id": "Эоархей", "Start": 4031000, "End": 3600000, "Type": "Era", "Shift": 2, "English": "Eoarchean" },
          
            { "id": "Четвертичный  Антропоген", "Start": 2580, "End": 0, "Type": "Period", "Shift": 3, "English": "Quaternary" },
            { "id": "Неоген", "Start": 23000, "End": 2580, "Type": "Period", "Shift": 3, "English": "Neogene" },
            { "id": "Палеоген", "Start": 66000, "End": 23000, "Type": "Period", "Shift": 3, "English": "Paleogene" },
            { "id": "Мел", "Start": 145000, "End": 66000, "Type": "Period", "Shift": 3, "English": "Cretaceous" },
            { "id": "Юра", "Start": 201000, "End": 145000, "Type": "Period", "Shift": 3, "English": "Jurassic" },
            { "id": "Триас", "Start": 252000, "End": 201000, "Type": "Period", "Shift": 3, "English": "Triassic" },
            { "id": "Пермь", "Start": 299000, "End": 252000, "Type": "Period", "Shift": 3, "English": "Permian" },
            { "id": "Карбон", "Start": 359000, "End": 299000, "Type": "Period", "Shift": 3, "English": "Carboniferous" },
            { "id": "Девон", "Start": 420000, "End": 359000, "Type": "Period", "Shift": 3, "English": "Devonian" },
            { "id": "Силур", "Start": 443000, "End": 420000, "Type": "Period", "Shift": 3, "English": "Silurian" },
            { "id": "Ордовик", "Start": 487000, "End": 443000, "Type": "Period", "Shift": 3, "English": "Ordovician" },
            { "id": "Кембрий", "Start": 539000, "End": 487000, "Type": "Period", "Shift": 3, "English": "Cambrian" },
            { "id": "Эдиакарий (Венд)", "Start": 635000, "End": 539000, "Type": "Period", "Shift": 3, "English": "Ediacaran" },
            { "id": "Криогений", "Start": 720000, "End": 635000, "Type": "Period", "Shift": 3, "English": "Cryogenian" },
            { "id": "Тоний", "Start": 1000000, "End": 720000, "Type": "Period", "Shift": 3, "English": "Tonian" },
            { "id": "Стений", "Start": 1200000, "End": 1000000, "Type": "Period", "Shift": 3, "English": "Stenian" },
            { "id": "Эктазий", "Start": 1400000, "End": 1200000, "Type": "Period", "Shift": 3, "English": "Ectasian" },
            { "id": "Калимий", "Start": 1600000, "End": 1400000, "Type": "Period", "Shift": 3, "English": "Calymmian" },
            { "id": "Статерий", "Start": 1800000, "End": 1600000, "Type": "Period", "Shift": 3, "English": "Statherian" },
            { "id": "Орозирий", "Start": 2050000, "End": 1800000, "Type": "Period", "Shift": 3, "English": "Orosirian" },
            { "id": "Риасий", "Start": 2300000, "End": 2050000, "Type": "Period", "Shift": 3, "English": "Rhyacian" },
            { "id": "Сидерий", "Start": 2500000, "End": 2300000, "Type": "Period", "Shift": 3, "English": "Siderian" }
          ]

          const m=100000

            data.forEach(item => {
                const { id, Start, End, Type, Shift } = item;
                //constructor(type, color, left = 0, top = 0 , width = 10, height = 10,  id='', notes = '')
                const shape = new Shape('rect', undefined, Shift*m, End, m, Start - End, id, Type);
                this.shapes.push(shape); // Добавляем каждую фигуру отдельно
            });


        //   this.shapes.push( data.map(item => {
        //     const { id, Start, End ,Type,Shift} = item;
        //     console.log(id)
        //     return new Shape('rect', undefined, Shift, End, 800, Start - End, id, Type);

        // }))





        // this.shapes.push( new Shape('rect', undefined, 1000, this.Ymin_i, 1000,1000))
        // this.shapes.push( new Shape('rect', undefined, 1000,   541000,    8000,   541000,          'Фанерозой',     'Eon' )  )    //	от 541 млн лет назад до
        // this.shapes.push( new Shape('rect', undefined, 1000,  2500000,    8000,  1959000,         'Протерозой',     'Eon' )  )    //	от 2.5 млрд до 541 млн лет назад
        // this.shapes.push( new Shape('rect', undefined, 1000,  4000000,    8000,  1500000,              'Архей',     'Eon' )  )    //	от 4 до 2.5 млрд лет назад
        // this.shapes.push( new Shape('rect', undefined, 1000,  4600000,    8000,   600000,   'Катархей (Гадей)',     'Eon' )  )    //  от 4.6 до 4 млрд лет назад
        
        
        

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