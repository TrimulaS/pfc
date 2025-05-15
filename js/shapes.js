
class Shape{
    static num = 0
    constructor(type, color, left = 0, top = 0 , width = 10, height = 10,  id='', notes = ''){
        this.type = type
        this.left = left
        this.top = top
        this.width = width
        this.height =  height
        // console.log(height + height)
        this.color = (color === undefined) ? ShapeRandom.getColor() : color;
        Shape.num++
        this.id = id === '' ? Shape.num : id      //:Shape.num + '_' + id; // Используем Shape.num
        this.notes = notes

        // For dynamic coordinates (one axis size and location will be caculated during draw)
        this.shift = undefined
        this.dynamicCoordinate = undefined          // x or y
        
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
        return `${this.id}, ${this.type}: left: ${this.left}, top: ${this.top}   width: ${this.width} x height ${this.height}  ${this.color}`
    }
}







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
        return  `rgba(${Math.floor(255 * Math.random())}, ${Math.floor(255 * Math.random())}, ${Math.floor(255 * Math.random())}, ${Math.random().toFixed(2)})`;

    }
}


//  1. fillup Shape Set
//  2. Set transform model

class ShapeSet{
    minSizeToDraw = 1
    offsetBeforeBorderToDraw = 0
    maxGridNumber = 20

    ctx = undefined
    
    // Settings:
    drawGrid = true
    adoptTextDirection = true
    

    shapes = []

    k_old = Infinity //previos coefficient src / viewport
    dynamicMaxShiftX = 0
    dynamicMaxShiftY = 0
    dynamicMaxWidth  = 0
    dynamicMaxHeight = 0

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
    constructor(){            // Canvas and method otrasforminf from source to viewport

			
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
        //this.defineBoundaries()
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
        //this.defineBoundaries()
    }

    getFrom1DJsonArray(data){

        data.forEach(item => {
            const { id, Start, End, Shift, Type, English } = item;
            let dynamicCoordinate = 'x'
            //shape constructor(          type,      color,   left = 0,    top = 0 ,   width = 10,     height = 10,     d='', notes = '')

            // const delta = End - Start       // common 
            const delta = Math.abs(Start - End )      // chronoligical ages        

            if(    dynamicCoordinate === 'x'){
                const shape = new Shape('rect',  undefined,  undefined,         End,     undefined,     delta,     id,    Type);
                shape.shift = Shift
                shape.dynamicCoordinate = 'x'
                this.shapes.push(shape); 
                const s =shape
            }
            else if(dynamicCoordinate === 'y'){
                const shape = new Shape('rect',  undefined,         End,   undefined,    delta,      undefined,      id,    Type);
                shape.shift = Shift
                shape.dynamicCoordinate = 'y'
                this.shapes.push(shape); 
            }




        });


        //this.defineBoundaries()
    }

    // calculateDynamicSizes() {

    // }

    getFrom2DJsonArray(data){

          const m=100000

            data.forEach(item => {
                const { id, Start, End, Type, Shift } = item;
                //constructor(type, color, left = 0, top = 0 , width = 10, height = 10,  id='', notes = '')
                const shape = new Shape('rect', undefined, Shift*m, End, m,  Math.abs(Start - End), id, Type);
                this.shapes.push(shape); // Добавляем каждую фигуру отдельно
            });

        
        // this.defineBoundaries()
    }

    // Mandatory before any first operation 
    setTransformModel(transform){
        this.transform = transform

        this.ctx =  transform.canvas.getContext('2d');
        this.xToPx = transform.xToPx.bind(transform)			// Binding methods for convinience
        this.yToPy = transform.yToPy.bind(transform)
        this.PxToX = transform.PxToX.bind(transform)			// Binding methods for convinience
        this.PyToY = transform.PyToY.bind(transform)
    
    }


    
    draw() {

        const{ctx:ctx, xToPx:xToPx , yToPy:yToPy, PxToX:PxToX, PyToY:PyToY, br:boundingRect} = this 
        const canvas = this.transform.canvas
    
        // canvas.width  = canvas.clientWidth;
        // canvas.height = canvas.clientHeight;
        // // Обновляем размеры и масштаб — в случае ресайза
        // this.transform.Wv = this.transform.canvas.clientWidth;
        // this.transform.Hv = this.transform.canvas.clientHeight;
        // this.transform.calcVisibleRanges();
            
        if (cbUpdateList.checked) cTree.innerHTML = '';

        drawGrid(this.ctx, this.transform)


        this.shapes.forEach(s => {

            // Нормализация координат при отрицательных ширине или высоте
            const shapeLeft   = Math.min(s.left, s.left + s.width);
            const shapeRight  = Math.max(s.left, s.left + s.width);
            const shapeTop    = Math.min(s.top, s.top + s.height);
            const shapeBottom = Math.max(s.top, s.top + s.height);

            let isVisibleHorizontally =  
                shapeRight  - this.offsetBeforeBorderToDraw >= t.visibleLeft &&
                shapeLeft   + this.offsetBeforeBorderToDraw <= t.visibleRight;

            let isVisibleVertically =                 
                shapeBottom - this.offsetBeforeBorderToDraw >= t.visibleTop &&
                shapeTop    + this.offsetBeforeBorderToDraw <= t.visibleBottom;


            // If dynamic coordinate - recalculate
            if (
                (   s.dynamicCoordinate === 'x' && isVisibleVertically)         ||      // Shape with x dynamic sizing      
                (   s.dynamicCoordinate === 'y' && isVisibleHorizontally)               // Shape with y dynamic sizing    
            ){

                //----------------------------------------------------------Dynamic: Recalculate dynamic coordinates, if scale changed
                let applyDriftCompensationX = true
                let applyDriftCompensationY = true
                if(this.k_old != this.transform.k){

                    const logicalWidth  = canvas.width   * 0.9 / this.dynamicMaxShiftX
                    const logicalHeight = canvas.height  * 0.9 / this.dynamicMaxShiftY
                
                    for(const s of this.shapes){
                        if(s.dynamicCoordinate === 'x'){
                            s.width = logicalWidth / this.transform.k  
                            s.left =   s.shift * logicalWidth / this.transform.k  
                            applyDriftCompensationX = false
                        }
                        if(s.dynamicCoordinate === 'y'){
                            s.height = logicalHeight / this.transform.k    
                            s.left = s.shift * logicalHeight / this.transform.k
                            applyDriftCompensationY = false
                        }
                    }
                
                    this.k_old = this.transform.k

                    if( this.transform.applyDriftCompensationX !== applyDriftCompensationX  )   {
                        this.transform.applyDriftCompensationX = applyDriftCompensationX 
                    }
                    if( this.transform.applyDriftCompensationY !== applyDriftCompensationY  )   {
                        this.transform.applyDriftCompensationY = applyDriftCompensationY 
                    }
                    
                    
                    isVisibleHorizontally =  
                        s.left + s.width - this.offsetBeforeBorderToDraw    >= t.visibleLeft &&
                        s.left           + this.offsetBeforeBorderToDraw    <= t.visibleRight ;
                    isVisibleVertically =                 
                        s.top + s.height - this.offsetBeforeBorderToDraw    >= t.visibleTop &&
                        s.top            + this.offsetBeforeBorderToDraw    <= t.visibleBottom;
               }

            }







            // Drawing shape
            if (s.width * t.k < this.minSizeToDraw   &&   s.height * t.k < this.minSizeToDraw) return false;      // Skip tiny objects


            if (
                (   isVisibleHorizontally   && isVisibleVertically    )        // ||      // Common 2D shape
                // (   s.dynamicCoordinate === 'x' && isVisibleVertically)         ||      // Shape with x dynamic sizing      
                // (   s.dynamicCoordinate === 'y' && isVisibleHorizontally)               // Shape with y dynamic sizing    
            ){


                // log shapes
                if (cbUpdateList.checked) addListItem(cTree, s.toString());


                //----------------------------------------------------------Drawing shapes
                ctx.fillStyle = s.color;
                switch (s.type) {
                    case 'rect':
                        ctx.fillRect(xToPx(s.left), yToPy(s.top), s.width * t.k, s.height * t.k);
                        //console.log(xToPx(s.left) +','+yToPy(s.top)+','+s.width * t.k,+','+ s.height * t.k)
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


                //----------------------------------------------------------Draw Title text

                // Видимая часть фигуры (в пределах видимой области)
                const visibleLeft   = Math.max(shapeLeft, t.visibleLeft);
                const visibleRight  = Math.min(shapeRight, t.visibleRight);
                const visibleTop    = Math.max(shapeTop, t.visibleTop);
                const visibleBottom = Math.min(shapeBottom, t.visibleBottom);

                // Вычисление размеров видимой области
                const visibleWidth  = visibleRight - visibleLeft;
                const visibleHeight = visibleBottom - visibleTop;

                // Центр
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

                    if (textWidth <= visibleWidth * t.k && textHeight <= visibleHeight * t.k   || !this.adoptTextDirection) {
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

            }
        });



    
        // // 3. Прорисовка делений
        // // Функция подсчета, сколько фигур "касается" координаты
        // const countShapesTouching = (coord, axis) => {
        //     return visibleShapes.filter(s => {
        //         if (axis === 'x') {
        //             return s.left <= coord && s.left + s.width >= coord;
        //         } else {
        //             return s.top <= coord && s.top + s.height >= coord;
        //         }
        //     }).length;
        // };


        // if (this.drawGrid) {
        //     const xEdges = new Map(), yEdges = new Map();
        //     const xCounts = new Map(), yCounts = new Map();
    
        //     for (const s of visibleShapes) {
        //         const [x1, x2] = [s.left, s.left + s.width];
        //         const [y1, y2] = [s.top, s.top + s.height];
    
        //         for (const x of [x1, x2]) {
        //             if (x >= t.visibleLeft && x <= t.visibleRight) {
        //                 xEdges.set(x, (xEdges.get(x) || 0) + 1);
        //             }
        //         }
        //         for (const y of [y1, y2]) {
        //             if (y >= t.visibleTop && y <= t.visibleBottom) {
        //                 yEdges.set(y, (yEdges.get(y) || 0) + 1);
        //             }
        //         }
        //     }
    
        //     const getTopEdges = (edges, limit) =>
        //         [...edges.entries()]
        //             .sort((a, b) => b[1] - a[1]) // по убыванию частоты
        //             .filter(([coord], idx, arr) => arr.findIndex(([c]) => c === coord) === idx)
        //             .slice(0, limit)
        //             .map(([coord, count]) => ({ coord, count }));
    
        //     const topX = getTopEdges(xEdges, this.maxGridNumber);
        //     const topY = getTopEdges(yEdges, this.maxGridNumber);
    
        //     const margin = 20;
        //     ctx.font = '12px sans-serif';
        //     ctx.textBaseline = 'middle';
    
        //     const drawnLabels = [];
    
        //     const countShapesTouching = (coord, axis) => {
        //         return visibleShapes.filter(s => {
        //             if (axis === 'x') {
        //                 return s.left <= coord && s.left + s.width  >= coord;
        //             } else {
        //                 return s.top  <= coord && s.top  + s.height >= coord;
        //             }
        //         }).length;
        //     };
            

            
        //     // Вертикальные линии
        //     for (const { coord } of topX) {
        //         const px = xToPx(coord);
        //         if (px < margin || px > canvas.width - margin) continue;
            
        //         const label = formatNumber(coord);
        //         const labelWidth = ctx.measureText(label).width;
            
        //         if (drawnLabels.some(pos => Math.abs(pos - px) < labelWidth + 4)) continue;
        //         drawnLabels.push(px);
            
        //         const isMajor = countShapesTouching(coord, 'x') === visibleShapes.length;
            
        //         ctx.beginPath();
        //         ctx.strokeStyle = isMajor ? '#003388' : '#00aaff';
        //         ctx.moveTo(px, margin);
        //         ctx.lineTo(px, canvas.height - margin);
        //         ctx.stroke();
            
        //         ctx.fillStyle = ctx.strokeStyle;
        //         ctx.fillText(label, px + 2, margin - 6); // сверху
        //         ctx.fillText(label, px + 2, canvas.height - margin + 6); // снизу
        //     }
            
        //     drawnLabels.length = 0;
            
        //     // Горизонтальные линии
        //     for (const { coord } of topY) {
        //         const py = yToPy(coord);
        //         if (py < margin || py > canvas.height - margin) continue;
            
        //         const label = formatNumber(coord);
        //         const labelWidth = ctx.measureText(label).width;
            
        //         if (drawnLabels.some(pos => Math.abs(pos - py) < 14)) continue;
        //         drawnLabels.push(py);
            
        //         const isMajor = countShapesTouching(coord, 'y') === visibleShapes.length;
            
        //         ctx.beginPath();
        //         ctx.strokeStyle = isMajor ? '#003388' : '#00aaff';
        //         ctx.moveTo(margin, py);
        //         ctx.lineTo(canvas.width - margin, py);
        //         ctx.stroke();
            
        //         ctx.fillStyle = ctx.strokeStyle;
        //         ctx.fillText(label, margin + 2, py - 6); // левее и выше линии
        //         ctx.fillText(label, canvas.width - margin - labelWidth - 2, py - 6); // правее и выше линии
        //     }
        // }
    }





    defineBoundaries() {
        if (!this.shapes || this.shapes.length === 0) {
            this.boundingRect = null;
            return;
        }

        let xmin = Infinity;
        let xmax = -Infinity;
        let ymin = Infinity;
        let ymax = -Infinity;

        for (const s of this.shapes) {
            //console.log(`shape ${s.left} : ${s.width} .. ${s.top} : ${s.height}`);

            // Нормализуем координаты
            const left   = Math.min(s.left, s.left + s.width);
            const right  = Math.max(s.left, s.left + s.width);
            const top    = Math.min(s.top, s.top + s.height);
            const bottom = Math.max(s.top, s.top + s.height);

            xmin = Math.min(xmin, left);
            xmax = Math.max(xmax, right);
            ymin = Math.min(ymin, top);
            ymax = Math.max(ymax, bottom);

            //Dynamic coordinates
            // Ranges for dynamic shapes only
            if(s.dynamicCoordinate =="x"){
                this.dynamicMaxShiftX= Math.max(this.dynamicMaxShiftX, s.shift)
                // dynXmin = Math.min(dynXmin, s.left)
                // dynXmax = Math.max(dynXmax, s.left + s.width)

            }
            else if(s.dynamicCoordinate =="y"){
                this.dynamicMaxShiftY = Math.max(this.dynamicMaxShiftY, s.shift)
                // dynYmin = Math.min(dynYmin, s.top)
                // dynYmax = Math.max(dynYmax, s.top + s.height)
            }
        }

        if(this.dynamicMaxShiftX > 0) this.dynamicMaxShiftX++
        if(this.dynamicMaxShiftY > 0) this.dynamicMaxShiftY++

        // Запоминаем результат
        this.Xmin = xmin;
        this.Xmax = xmax;
        this.Ymin = ymin;
        this.Ymax = ymax;

        this.boundingRect = {
            left: xmin,
            top: ymin,
            width: xmax - xmin,
            height: ymax - ymin
        };

        //console.log(`Boundaries ${xmin} : ${ymin} .. ${xmax} : ${ymax} max Shift: ${this.dynamicMaxShiftX}`);
    }

    settings(drawGrid, adoptTextDirection){
        if(drawGrid!==undefined)this.drawGrid = drawGrid
        if(adoptTextDirection!==undefined)this.adoptTextDirection = adoptTextDirection
    }

    toString() {
        return `Boundaries ${this.Xmin} : ${this.Ymin} .. ${this.Xmax} : ${this.Ymax}` +
            (this.dynamicMaxWidth > 0 
                ? ` Dynamic horizontal object level: ${this.dynamicMaxShiftX}, width: ${this.dynamicMaxWidth}` 
                : '') +
            (this.dynamicMaxHeight > 0 
                ? ` Dynamic vertical object level: ${this.dynamicMaxShiftY}, width: ${this.dynamicMaxHeight}` 
                : '');
    }

}






