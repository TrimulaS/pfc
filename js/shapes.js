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
    constructor(){

       

        //this.fillRandomly(shapesNum)
        //this.fillWithSquares(shapesNum)
        //this.fillExact()




			
    }
    fillRandomly(shapesNum, Xmin_i, Xmax_i, Ymin_i, Ymax_i){
        this.shapesNum = shapesNum
		this.Xmin_i = Xmin_i
		this.Xmax_i = Xmax_i
		this.Ymin_i = Ymin_i
		this.Ymax_i = Ymax_i

		for(let i = 0; i< shapesNum; i++){
			this.shapes.push( new ShapeRandom (this.Xmin_i, this.Xmax_i, this.Ymin_i, this.Ymax_i))
		}
        this.defineBoundaries(shapesNum)
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
        this.defineBoundaries(shapesNum)
    }

    getFromJsonArray(data){

          const m=100000

            data.forEach(item => {
                const { id, Start, End, Type, Shift } = item;
                //constructor(type, color, left = 0, top = 0 , width = 10, height = 10,  id='', notes = '')
                const shape = new Shape('rect', undefined, Shift*m, End, m, Start - End, id, Type);
                this.shapes.push(shape); // Добавляем каждую фигуру отдельно
            });

        
        this.defineBoundaries(shapesNum)
    }

    draw(cGraph) {
        cGraph.width  = cGraph.clientWidth;
        cGraph.height = cGraph.clientHeight;
    
        if (cbUpdateList.checked) cTree.innerHTML = '';
    
        const ctx = cGraph.getContext('2d');
        ctx.clearRect(0, 0, cGraph.width, cGraph.height); // Очистка canvas
    
        const visibleShapes = this.shapes.filter(s => {
            if (s.width * t.k < 5 && s.height * t.k < 5) return false;
            const delta = 0;
            return (
                s.left + s.width - delta >= t.visibleLeft &&
                s.left + delta <= t.visibleRight &&
                s.top + s.height - delta >= t.visibleTop &&
                s.top + delta <= t.visibleBottom
            );
        });
    
        // Отрисовка фигур
        visibleShapes.forEach(s => {
            if (cbUpdateList.checked) addListItem(cTree, s.type + ' ' + s.id);
            ctx.fillStyle = s.color;
    
            switch (s.type) {
                case 'rect':
                    ctx.fillRect(xToPx(s.left), yToPy(s.top), s.width * t.k, s.height * t.k);
                    break;
                case 'circle':
                    ctx.beginPath();
                    ctx.ellipse(
                        xToPx(s.left + s.width / 2),
                        yToPy(s.top + s.height / 2),
                        s.width * t.k / 2,
                        s.height * t.k / 2,
                        0, 0, Math.PI * 2
                    );
                    ctx.fill();
                    break;
                case 'line':
                    ctx.beginPath();
                    ctx.moveTo(xToPx(s.left), yToPy(s.top));
                    ctx.lineTo(xToPx(s.left + s.width), yToPy(s.top + s.height));
                    ctx.closePath();
                    ctx.strokeStyle = s.color;
                    ctx.stroke();
                    break;
                case 'point':
                    ctx.fillRect(xToPx(s.left), yToPy(s.top), 5, 5);
                    break;
                default:
                    console.log('(!) Wrong shape type');
                    ctx.fillRect(xToPx(s.left), yToPy(s.top), 5, 5);
            }
            
            
            
                  // === Рисуем ID фигуры по центру её видимой части ===
    
    
                        // Видимая область фигуры
                        const visibleLeft   = Math.max(s.left, t.visibleLeft);
                        const visibleRight  = Math.min(s.left + s.width, t.visibleRight);
                        const visibleTop    = Math.max(s.top, t.visibleTop);
                        const visibleBottom = Math.min(s.top + s.height, t.visibleBottom);
    
                        const visibleWidth  = visibleRight - visibleLeft;
                        const visibleHeight = visibleBottom - visibleTop;
    
                        const px = xToPx(visibleLeft + visibleWidth / 2);
                        const py = yToPy(visibleTop + visibleHeight / 2);
    
                        const text = s.id;
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillStyle =  getColorfulContrastingTextColor(s.color); //invertColor(s.color || "#FFFFFF");
    
                        // Настройки размеров шрифта
                        const H_MIN = 6, H_MAX = 18;  // Горизонтально
                        const V_MIN = 4, V_MAX = 14;  // Вертикально
                        const STEP = 0.5;
    
                        let found = false;
    
                        // Сначала пробуем горизонтально
                        for (let fontSize = H_MAX; fontSize >= H_MIN; fontSize -= STEP) {
                            ctx.font = `${fontSize}px sans-serif`;
                            const textWidth = ctx.measureText(text).width;
                            const textHeight = fontSize;
    
                            if (textWidth <= visibleWidth * t.k && textHeight <= visibleHeight * t.k) {
                                ctx.fillText(text, px, py);
                                found = true;
                                break;
                            }
                        }
    
                        // Если не влезло — пробуем вертикально
                        if (!found) {
                            for (let fontSize = V_MAX; fontSize >= V_MIN; fontSize -= STEP) {
                                ctx.font = `${fontSize}px sans-serif`;
                                const textWidth = ctx.measureText(text).width;
                                const textHeight = fontSize;
    
                                // В повороте местами ширина и высота
                                if (textHeight <= visibleWidth * t.k && textWidth <= visibleHeight * t.k) {
                                    ctx.save();
                                    ctx.translate(px, py);
                                    ctx.rotate(-Math.PI / 2);
                                    ctx.fillText(text, 0, 0);
                                    ctx.restore();
                                    found = true;
                                    break;
                                }
                            }
                        }
    
            
            
            
        });
    




        if(this.drawGrid){
            // Сбор всех вертикальных и горизонтальных границ фигур
            const xEdges = new Map(); // {coord -> count}
            const yEdges = new Map();
        
            for (const s of visibleShapes) {
                const x1 = s.left;
                const x2 = s.left + s.width;
                const y1 = s.top;
                const y2 = s.top + s.height;
        
                if (x1 >= t.visibleLeft && x1 <= t.visibleRight) xEdges.set(x1, (xEdges.get(x1) || 0) + 1);
                if (x2 >= t.visibleLeft && x2 <= t.visibleRight) xEdges.set(x2, (xEdges.get(x2) || 0) + 1);
                if (y1 >= t.visibleTop && y1 <= t.visibleBottom) yEdges.set(y1, (yEdges.get(y1) || 0) + 1);
                if (y2 >= t.visibleTop && y2 <= t.visibleBottom) yEdges.set(y2, (yEdges.get(y2) || 0) + 1);
            }
        
            // Выбор до 10 наиболее частых границ
            const getTopEdges = (edgeMap, limit = 10) =>
                [...edgeMap.entries()]
                    .sort((a, b) => b[1] - a[1]) // по убыванию частоты
                    .slice(0, limit)
                    .map(([coord]) => coord);
        
            const topX = getTopEdges(xEdges);
            const topY = getTopEdges(yEdges);
        
            // Настройки стиля делений
            ctx.strokeStyle = '#00aaff';
            ctx.fillStyle = '#00aaff';
            ctx.font = '12px sans-serif';
            ctx.textBaseline = 'middle';
        
            // Отступы, чтобы не рисовать до краев
            const margin = 20;
        
            // Рисуем вертикальные деления
            for (const xVal of topX) {
                const px = xToPx(xVal);
                if (px < margin || px > cGraph.width - margin) continue;
        
                ctx.beginPath();
                ctx.moveTo(px, margin);
                ctx.lineTo(px, cGraph.height - margin);
                ctx.stroke();
        
                // Подписи сверху и снизу
                const label = xVal.toFixed(2);
                ctx.fillText(label, px + 2, 10); // сверху
                ctx.fillText(label, px + 2, cGraph.height - 10); // снизу
            }
        
            // Рисуем горизонтальные деления
            for (const yVal of topY) {
                const py = yToPy(yVal);
                if (py < margin || py > cGraph.height - margin) continue;
        
                ctx.beginPath();
                ctx.moveTo(margin, py);
                ctx.lineTo(cGraph.width - margin, py);
                ctx.stroke();
        
                const label = yVal.toFixed(2);
                ctx.fillText(label, 2, py - 1); // слева
                ctx.fillText(label, cGraph.width - ctx.measureText(label).width - 2, py - 1); // справа
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

    settings(drawGrid=true){
        this.drawGrid = drawGrid
    }


}






