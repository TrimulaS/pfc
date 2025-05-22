/**
 * 
 *      
 *      Dynamic shapes: has one real coordinates e.g. x and w
 *      The other one will be calculated autmatically with proportions to fill up all viewport space indepndatly of trasfer coefficient k 
 * 
 *      input data may be with negative sizes (width and height) the shape size will build in direction reversed to axis
 *      Shape: start coordinate: (left, top) and sizes: (w, h)  (!) Sizes could NOT  be negative  normalization shold be arranged when shape is created  
 * Dynamic ccordinates s.shift может быть любым целым числом (включая отрицательные), и Вам нужно:

Подсчитать, сколько позиций заключается между минимальным и максимальным s.shift,

coordinates -> whole borders
defineBoundaries -> init
 */



//-------------------------------------------------------------------------------------------------

class Shape{
    static num = 0
    constructor(type, color, left = 0, top = 0 , width = 10, height = 10,  id='', notes = ''){
        this.type = type

        this.left = left
        this.top = top
        this.width = width
        this.height =  height
        this.normalizeGeometry()

        this.color = (color === undefined) ? ShapeRandom.getColor() : color;
        Shape.num++
        this.id = id === '' ? Shape.num : id      //:Shape.num + '_' + id; // Используем Shape.num
        this.notes = notes

        // For dynamic coordinates (one axis size and location will be caculated during draw)
        this.shift = undefined
        this.dynamicCoordinate = undefined          // x or y
        
    }
    normalizeGeometry() {
        if (this.width < 0) {
            this.left = this.left + this.width; // Сдвигаем влево
            this.width = -this.width;
        }
        if (this.height < 0) {
            this.top = this.top + this.height; // Сдвигаем вверх
            this.height = -this.height;
        }
    }


        // Геттеры для вычисления при доступе
    get right() {
        return this.left + this.width;
    }

    get bottom() {
        return this.top + this.height;
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
        // return `${this.id}, ${this.type}: left: ${this.left}, top: ${this.top}   width: ${this.width} x height ${this.height}  ${this.color}`
        // Brief
                return `${this.id}, ${this.type}: l: ${Math.floor(this.left)}  t:  ${Math.floor(this.top)}   w: ${Math.floor(this.width)}  h: ${Math.floor(this.height)}`
        // return `${this.id}, ${this.type}: ( ${shortNum(this.left)} : ${shortNum(this.top)} ),    ${shortNum(this.width)} x ${shortNum(this.height)}`
        //return `${this.id}: ( ${shortNum(this.left)} : ${shortNum(this.top)} )    ${shortNum(this.width)} x ${shortNum(this.height)}`
        // return `${this.id}: ( ${formatNumber(this.left)} : ${formatNumber(this.top)} )    ${formatNumber(this.width)} x ${formatNumber(this.height)}`
    }
}





//-------------------------------------------------------------------------------------------------

class ShapeRandom extends Shape {                       // Random generated shape in boundaries
    constructor(Xmin_i, Xmax_i, Ymin_i, Ymax_i) {

        const shapeMaxW = ( Xmax_i - Xmin_i ) / 10          // Shape width is  /10 of alowed are width
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
        // return  `rgba(${Math.floor(255 * Math.random())}, ${Math.floor(255 * Math.random())}, ${Math.floor(255 * Math.random())}, ${Math.random().toFixed(2)})`;
        // half transparent
        return  `rgba(${Math.floor(255 * Math.random())}, ${Math.floor(255 * Math.random())}, ${Math.floor(255 * Math.random())}, 0.9)`;
    }
}




//-------------------------------------------------------------------------------------------------
// Class to fillup
class ShapeImporter{
    // Initial sizes to generate shapes
    Xmin_i = 0
    Xmax_i = 0
    Ymin_i = 0
    Ymax_i = 0
    constructor(shapes){                        // shapes - array of shapes
        this.shapes = shapes
    }

    fillRandomly(shapesNum, Xmin_i, Xmax_i, Ymin_i, Ymax_i){        // here coordinates

    this.Xmin_i = Xmin_i
    this.Xmax_i = Xmax_i
    this.Ymin_i = Ymin_i
    this.Ymax_i = Ymax_i

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

    getFrom1DJsonArray(data){

        data.forEach(item => {
            const { id, Start, End, Shift, Type, English } = item;
            let dynamicCoordinate = 'x'
            //shape constructor(          type,      color,   left = 0,    top = 0 ,   width = 10,     height = 10,     d='', notes = '')

            // const delta = End - Start       // common 
            //const delta = Math.abs(Start - End )      // chronoligical ages        

            if(    dynamicCoordinate === 'x'){
                const shape = new Shape('rect',  undefined,  undefined,         End,     undefined,     Start - End,     id,    Type);
                shape.shift = Shift
                shape.dynamicCoordinate = 'x'
                this.shapes.push(shape); 

            }
            else if(dynamicCoordinate === 'y'){
                const shape = new Shape('rect',  undefined,         End,   undefined,    Start - End,      undefined,      id,    Type);
                shape.shift = Shift
                shape.dynamicCoordinate = 'y'
                this.shapes.push(shape); 
            }

        });
    }


    getFrom2DJsonArray(data){

          const m=100000   // coefficient

            data.forEach(item => {
                const { id, Start, End, Type, Shift } = item;
                //constructor(type, color, left = 0, top = 0 , width = 10, height = 10,  id='', notes = '')
                const shape = new Shape('rect', undefined, Shift*m, End, m,  Math.abs(Start - End), id, Type);
                this.shapes.push(shape); // Добавляем каждую фигуру отдельно
            });

        
        // this.defineBoundaries()
    }
}

//При больших объёмах стоит рассмотреть использование структурированных массивов (Float32Array, ArrayBuffer, т.п.), если нужны предельные оптимизации.







