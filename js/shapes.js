
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
        return `shape:${this.type}: ${this.left} x ${this.top}  [ ${this.width} x ${this.height} ]`
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




class ShapeSet{
    minlSizeToDraw = 3
    offsetBeforeBorderToDraw = 0
    maxGridNumber = 20
    
    // Settings:
    drawGrid = true
    adoptTextDirection = true
    

    shapes = []

    k_old = 0 //previos coefficient src / viewport
    maxDynamicWidth = 0
    maxDynamicHeight = 0

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
    constructor(ctx, transform){            // Canvas and method otrasforminf from source to viewport
        this.ctx = ctx
        this.transform = transform

        this.xToPx = transform.xToPx.bind(transform)			// Binding methods for convinience
        this.yToPy = transform.yToPy.bind(transform)
			
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

    getFrom1DJsonArray(data){

          data.forEach(item => {
              const { id, Start, End, Shift, Type, English } = item;
              //constructor(type, color, left = 0, top = 0 , width = 10, height = 10,  id='', notes = '')
              const shape = new Shape('rect', undefined, undefined, End, undefined, Start - End, id, Type);
              shape.shift = Shift
              shape.dynamicCoordinate = 'x'
              this.shapes.push(shape); // Добавляем каждую фигуру отдельно
          });

      
      this.defineBoundaries(shapesNum)
  }

    getFrom2DJsonArray(data){

          const m=100000

            data.forEach(item => {
                const { id, Start, End, Type, Shift } = item;
                //constructor(type, color, left = 0, top = 0 , width = 10, height = 10,  id='', notes = '')
                const shape = new Shape('rect', undefined, Shift*m, End, m, Start - End, id, Type);
                this.shapes.push(shape); // Добавляем каждую фигуру отдельно
            });

        
        this.defineBoundaries(shapesNum)
    }

    // draw(canvas) {
    //     canvas.width  = canvas.clientWidth;
    //     canvas.height = canvas.clientHeight;
    
    //     if (cbUpdateList.checked) cTree.innerHTML = '';
    
    //     const ctx = canvas.getContext('2d');
    //     ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    //     const visibleShapes = this.shapes.filter(s => {
    //         if (s.width * t.k < this.minlSizeToDraw   &&   s.height * t.k < this.minlSizeToDraw) return false;
            
    //         return (
    //             s.left + s.width - this.offsetBeforeBorderToDraw    >= t.visibleLeft &&
    //             s.left           + this.offsetBeforeBorderToDraw    <= t.visibleRight &&
    //             s.top + s.height - this.offsetBeforeBorderToDraw    >= t.visibleTop &&
    //             s.top            + this.offsetBeforeBorderToDraw    <= t.visibleBottom
    //         );
    //     });
    
    //     // Отрисовка фигур
    //     visibleShapes.forEach(s => {
    //         if (cbUpdateList.checked) addListItem(cTree, s.type + ' ' + s.id);
    //         ctx.fillStyle = s.color;
    
    //         switch (s.type) {
    //             case 'rect':
    //                 ctx.fillRect(xToPx(s.left), yToPy(s.top), s.width * t.k, s.height * t.k);
    //                 break;
    //             case 'circle':
    //                 ctx.beginPath();
    //                 ctx.ellipse(
    //                     xToPx(s.left + s.width / 2),
    //                     yToPy(s.top + s.height / 2),
    //                     s.width * t.k / 2,
    //                     s.height * t.k / 2,
    //                     0, 0, Math.PI * 2
    //                 );
    //                 ctx.fill();
    //                 break;
    //             case 'line':
    //                 ctx.beginPath();
    //                 ctx.moveTo(xToPx(s.left), yToPy(s.top));
    //                 ctx.lineTo(xToPx(s.left + s.width), yToPy(s.top + s.height));
    //                 ctx.closePath();
    //                 ctx.strokeStyle = s.color;
    //                 ctx.stroke();
    //                 break;
    //             case 'point':
    //                 ctx.fillRect(xToPx(s.left), yToPy(s.top), 5, 5);
    //                 break;
    //             default:
    //                 console.log('(!) Wrong shape type');
    //                 ctx.fillRect(xToPx(s.left), yToPy(s.top), 5, 5);
    //         }
            
            
            
    //         // === Text фигуры по центру её видимой части ===


    //         // Видимая область фигуры
    //         const visibleLeft   = Math.max(s.left, t.visibleLeft);
    //         const visibleRight  = Math.min(s.left + s.width, t.visibleRight);
    //         const visibleTop    = Math.max(s.top, t.visibleTop);
    //         const visibleBottom = Math.min(s.top + s.height, t.visibleBottom);

    //         const visibleWidth  = visibleRight - visibleLeft;
    //         const visibleHeight = visibleBottom - visibleTop;

    //         const px = xToPx(visibleLeft + visibleWidth / 2);
    //         const py = yToPy(visibleTop + visibleHeight / 2);

    //         const text = s.id;
    //         ctx.textAlign = "center";
    //         ctx.textBaseline = "middle";
    //         ctx.fillStyle =  getColorfulContrastingTextColor(s.color); //invertColor(s.color || "#FFFFFF");

    //         // Настройки размеров шрифта
    //         const H_MIN = 6, H_MAX = 18;  // Горизонтально
    //         const V_MIN = 4, V_MAX = 14;  // Вертикально
    //         const STEP = 0.5;

    //         let found = false;

    //         // Сначала пробуем горизонтально
    //         for (let fontSize = H_MAX; fontSize >= H_MIN; fontSize -= STEP) {
    //             ctx.font = `${fontSize}px sans-serif`;
    //             const textWidth = ctx.measureText(text).width;
    //             const textHeight = fontSize;

    //             if (textWidth <= visibleWidth * t.k && textHeight <= visibleHeight * t.k   || !this.adoptTextDirection) {
    //                 ctx.fillText(text, px, py);
    //                 found = true;
    //                 break;
    //             }
    //         }

    //         // Если не влезло — пробуем вертикально
    //         if (!found) {
    //             for (let fontSize = V_MAX; fontSize >= V_MIN; fontSize -= STEP) {
    //                 ctx.font = `${fontSize}px sans-serif`;
    //                 const textWidth = ctx.measureText(text).width;
    //                 const textHeight = fontSize;

    //                 // В повороте местами ширина и высота
    //                 if (textHeight <= visibleWidth * t.k && textWidth <= visibleHeight * t.k) {
    //                     ctx.save();
    //                     ctx.translate(px, py);
    //                     ctx.rotate(-Math.PI / 2);
    //                     ctx.fillText(text, 0, 0);
    //                     ctx.restore();
    //                     found = true;
    //                     break;
    //                 }
    //             }
    //         }
    
            
            
            
    //     });
    




    //     if(this.drawGrid){
    //         // Сбор всех вертикальных и горизонтальных границ фигур
    //         const xEdges = new Map(); // {coord -> count}
    //         const yEdges = new Map();
        
    //         for (const s of visibleShapes) {
    //             const x1 = s.left;
    //             const x2 = s.left + s.width;
    //             const y1 = s.top;
    //             const y2 = s.top + s.height;
        
    //             if (x1 >= t.visibleLeft && x1 <= t.visibleRight) xEdges.set(x1, (xEdges.get(x1) || 0) + 1);
    //             if (x2 >= t.visibleLeft && x2 <= t.visibleRight) xEdges.set(x2, (xEdges.get(x2) || 0) + 1);
    //             if (y1 >= t.visibleTop && y1 <= t.visibleBottom) yEdges.set(y1, (yEdges.get(y1) || 0) + 1);
    //             if (y2 >= t.visibleTop && y2 <= t.visibleBottom) yEdges.set(y2, (yEdges.get(y2) || 0) + 1);
    //         }
        
    //         // Выбор до 10 наиболее частых границ
    //         const getTopEdges = (edgeMap, limit = this.maxGridNumber) =>
    //             [...edgeMap.entries()]
    //                 .sort((a, b) => b[1] - a[1]) // по убыванию частоты
    //                 .slice(0, limit)
    //                 .map(([coord]) => coord);
        
    //         const topX = getTopEdges(xEdges);
    //         const topY = getTopEdges(yEdges);
        
    //         // Настройки стиля делений
    //         ctx.strokeStyle = '#00aaff';
    //         ctx.fillStyle = '#00aaff';
    //         ctx.font = '12px sans-serif';
    //         ctx.textBaseline = 'middle';
        
    //         // Отступы, чтобы не рисовать до краев
    //         const margin = 20;
        
    //         // Рисуем вертикальные деления
    //         for (const xVal of topX) {
    //             const px = xToPx(xVal);
    //             if (px < margin || px > canvas.width - margin) continue;
        
    //             ctx.beginPath();
    //             ctx.moveTo(px, margin);
    //             ctx.lineTo(px, canvas.height - margin);
    //             ctx.stroke();
        
    //             // Подписи сверху и снизу
    //             const label = xVal.toFixed(2);
    //             ctx.fillText(label, px + 2, 10); // сверху
    //             ctx.fillText(label, px + 2, canvas.height - 10); // снизу
    //         }
        
    //         // Рисуем горизонтальные деления
    //         for (const yVal of topY) {
    //             const py = yToPy(yVal);
    //             if (py < margin || py > canvas.height - margin) continue;
        
    //             ctx.beginPath();
    //             ctx.moveTo(margin, py);
    //             ctx.lineTo(canvas.width - margin, py);
    //             ctx.stroke();
        
    //             const label = yVal.toFixed(2);
    //             ctx.fillText(label, 2, py - 1); // слева
    //             ctx.fillText(label, canvas.width - ctx.measureText(label).width - 2, py - 1); // справа
    //         }

    //     }

        
    // }
    



    formatNumber(value) {
        // Можно переключить этот режим через флаг 10e or SI mode
        const useSI = true;
    
        if (useSI) {
            const SI = [
                { value: 1e9, symbol: "G" },
                { value: 1e6, symbol: "M" },
                { value: 1e3, symbol: "k" },
                { value: 1, symbol: "" },
                { value: 1e-3, symbol: "m" },
                { value: 1e-6, symbol: "µ" },
                { value: 1e-9, symbol: "n" }
            ];
            for (let i = 0; i < SI.length; i++) {
                if (Math.abs(value) >= SI[i].value) {
                    return (value / SI[i].value).toFixed(2) + SI[i].symbol;
                }
            }
            return value.toExponential(2);
        } else {
            return value.toExponential(2);
        }
    }
    
    draw() {

        const{xToPx:xToPx , yToPy:yToPy} = this 
        const canvas = this.transform.canvas
    
        canvas.width  = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    
        if (cbUpdateList.checked) cTree.innerHTML = '';
    
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height); 

        // 1. Shapes 1D

        // Recalculate dynamic coordinates, if scale changed

        if(this.k_old != this.transform.k){

                if(s.dynamicCoordinate === 'x'){
    
                }
                if(s.dynamicCoordinate === 'y'){
    
                }
            
            this.k_old = this.transform.k
        }


    
        const visibleShapes = this.shapes.filter(s => {
            if (s.width * t.k < this.minlSizeToDraw   &&   s.height * t.k < this.minlSizeToDraw) return false;
            
            return (
                s.left + s.width - this.offsetBeforeBorderToDraw    >= t.visibleLeft &&
                s.left           + this.offsetBeforeBorderToDraw    <= t.visibleRight &&
                s.top + s.height - this.offsetBeforeBorderToDraw    >= t.visibleTop &&
                s.top            + this.offsetBeforeBorderToDraw    <= t.visibleBottom
            );
        });


    
        // 1. Отрисовка фигур
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
            
            
            
            // 2. Text фигуры по центру её видимой части ===


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
        });
    


    
        // 3. Прорисовка делений
        // Функция подсчета, сколько фигур "касается" координаты
        const countShapesTouching = (coord, axis) => {
            return visibleShapes.filter(s => {
                if (axis === 'x') {
                    return s.left <= coord && s.left + s.width >= coord;
                } else {
                    return s.top <= coord && s.top + s.height >= coord;
                }
            }).length;
        };


        if (this.drawGrid) {
            const xEdges = new Map(), yEdges = new Map();
            const xCounts = new Map(), yCounts = new Map();
    
            for (const s of visibleShapes) {
                const [x1, x2] = [s.left, s.left + s.width];
                const [y1, y2] = [s.top, s.top + s.height];
    
                for (const x of [x1, x2]) {
                    if (x >= t.visibleLeft && x <= t.visibleRight) {
                        xEdges.set(x, (xEdges.get(x) || 0) + 1);
                    }
                }
                for (const y of [y1, y2]) {
                    if (y >= t.visibleTop && y <= t.visibleBottom) {
                        yEdges.set(y, (yEdges.get(y) || 0) + 1);
                    }
                }
            }
    
            const getTopEdges = (edges, limit) =>
                [...edges.entries()]
                    .sort((a, b) => b[1] - a[1]) // по убыванию частоты
                    .filter(([coord], idx, arr) => arr.findIndex(([c]) => c === coord) === idx)
                    .slice(0, limit)
                    .map(([coord, count]) => ({ coord, count }));
    
            const topX = getTopEdges(xEdges, this.maxGridNumber);
            const topY = getTopEdges(yEdges, this.maxGridNumber);
    
            const margin = 20;
            ctx.font = '12px sans-serif';
            ctx.textBaseline = 'middle';
    
            const drawnLabels = [];
    
            const countShapesTouching = (coord, axis) => {
                return visibleShapes.filter(s => {
                    if (axis === 'x') {
                        return s.left <= coord && s.left + s.width  >= coord;
                    } else {
                        return s.top  <= coord && s.top  + s.height >= coord;
                    }
                }).length;
            };
            

            
            // Вертикальные линии
            for (const { coord } of topX) {
                const px = xToPx(coord);
                if (px < margin || px > canvas.width - margin) continue;
            
                const label = this.formatNumber(coord);
                const labelWidth = ctx.measureText(label).width;
            
                if (drawnLabels.some(pos => Math.abs(pos - px) < labelWidth + 4)) continue;
                drawnLabels.push(px);
            
                const isMajor = countShapesTouching(coord, 'x') === visibleShapes.length;
            
                ctx.beginPath();
                ctx.strokeStyle = isMajor ? '#003388' : '#00aaff';
                ctx.moveTo(px, margin);
                ctx.lineTo(px, canvas.height - margin);
                ctx.stroke();
            
                ctx.fillStyle = ctx.strokeStyle;
                ctx.fillText(label, px + 2, margin - 6); // сверху
                ctx.fillText(label, px + 2, canvas.height - margin + 6); // снизу
            }
            
            drawnLabels.length = 0;
            
            // Горизонтальные линии
            for (const { coord } of topY) {
                const py = yToPy(coord);
                if (py < margin || py > canvas.height - margin) continue;
            
                const label = this.formatNumber(coord);
                const labelWidth = ctx.measureText(label).width;
            
                if (drawnLabels.some(pos => Math.abs(pos - py) < 14)) continue;
                drawnLabels.push(py);
            
                const isMajor = countShapesTouching(coord, 'y') === visibleShapes.length;
            
                ctx.beginPath();
                ctx.strokeStyle = isMajor ? '#003388' : '#00aaff';
                ctx.moveTo(margin, py);
                ctx.lineTo(canvas.width - margin, py);
                ctx.stroke();
            
                ctx.fillStyle = ctx.strokeStyle;
                ctx.fillText(label, margin + 2, py - 6); // левее и выше линии
                ctx.fillText(label, canvas.width - margin - labelWidth - 2, py - 6); // правее и выше линии
            }
        }
    }




   
    defineBoundaries(){
        //Define whole shapes bounds:
		this.Xmin = this.shapes[0].left
		this.Xmax = this.shapes[0].left + this.shapes[0].width
		this.Ymin = this.shapes[0].top
		this.Ymax = this.shapes[0].top  + this.shapes[0].height

        let XdynMin = undefined
        let XdynMax = undefined
        let YdynMin = undefined
        let YdynMax = undefined
 

        // undefined > n       // false
        // undefined < n       // false
        // undefined >= n      // false
        // undefined <= n      // false
        
        // n > undefined       // false
        // n < undefined       // false
        // n >= undefined      // false
        // n <= undefined      // false
        
        // undefined == n      // false
        // undefined === n     // false
        // undefined != n      // true
        // undefined !== n     // true

		for(let i = 1; i< this.shapes.length; i++){
			const s = this.shapes[i]
			if( this.Xmin > s.left) this.Xmin = s.left
			if( this.Xmax < s.left + s.width ) this.Xmax = s.left + s.width
			if( this.Ymin > s.top) this.Ymin = s.top
			if( this.Ymax < s.top + s.height ) this.Ymax = s.top + s.height

            if(s.dynamicCoordinate =="x"){

            }
            else if(s.dynamicCoordinate =="y"){

            }
		}
		

    }

    settings(drawGrid, adoptTextDirection){
        if(drawGrid!==undefined)this.drawGrid = drawGrid
        if(adoptTextDirection!==undefined)this.adoptTextDirection = adoptTextDirection
    }


}






