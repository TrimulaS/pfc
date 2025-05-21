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
class ShapeSet{
    minSizeToDraw = 3
    offsetBeforeBorderToDraw = 0
    maxGridNumber = 20
    paddingInit = 0.1;		// 5% Padding for inintialcentring in parts from whole size  (same for dynamic shapes in ShapeSet)

    ctx = undefined
    
    // Settings:
    isDrawGrid_x10 = false
    isDrawAdoptedGrid = true
    adoptTextDirection = true

    shapes = []

    k_old = undefined                   // previos coefficient src / viewport  to decide if dyn coord should be recalculated while drawing
    k_dyn = undefined                    // in case of dynamic shapes define coefficient to conatain real size and cacaulate first dynamic coordinates

    hasDynamicShapes = false            // To exclude additional cofficient adoptation transform.init / transform centralize instead
    dynX_count = 0
    dynY_count = 0



    // Initial sizes to generate shapes
    Xmin_i = 0
    Xmax_i = 0
    Ymin_i = 0
    Ymax_i = 0
    // Result boundaries (! shoild be updated to transform)
    Xmin = 0
    Xmax = 0
    Ymin = 0
    Ymax = 0

    constructor(canvas){
        this.canvas = canvas    //for initial dynamic ccordinates processing while 2D transform  not defined
        this.ctx = canvas.getContext('2d');

        //  Buffer canvas for changing drawing from calculating order
        this.canvasBuffer = document.createElement('canvas');
        this.ctxBuffer = this.canvasBuffer.getContext('2d');
        
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
                const s =shape
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
   
        this.updateCoeffToTransform()

        // this.ctx   = this.transform.canvas.getContext('2d');
        this.xToPx = this.transform.xToPx.bind(transform)			// Binding methods for convinience
        this.yToPy = this.transform.yToPy.bind(transform)
        this.PxToX = this.transform.PxToX.bind(transform)			// Binding methods for convinience
        this.PyToY = this.transform.PyToY.bind(transform)
    
    }
    updateCoeffToTransform(){
        const {k_dyn} = this
        // If dynamic shapes present and initial k coefficient is calculated
        console.log(`update k to transfer? k_dyn  ${k_dyn}`)
        if (typeof k_dyn === 'number' && isFinite(k_dyn)) { 
            this.transform.k = k_dyn
            this.transform.k_old = k_dyn
            console.log(`update done k_dyn  ${k_dyn}`)
        }
    }


    
    draw() {

        const{ ctx:ctx, canvas:canvas, ctxBuffer:ctxBuffer, canvasBuffer:canvasBuffer, xToPx:xToPx , yToPy:yToPy, PxToX:PxToX, PyToY:PyToY, br:boundingRect} = this 

        console.log(`draw: k ${this.transform.k}`)
            
        if (cbUpdateList.checked) cTree.innerHTML = '';

        // 1. Draw grid x10
        if(this.isDrawGrid_x10){
            drawGrid_x10(this.ctx, this.transform)
        }
            
        // For adopting grid
        const xMap = new Map();
        const yMap = new Map();

        // 2. Buffer canvas for changing drawing from calculating order
        canvasBuffer.width = canvas.width;
        canvasBuffer.height = canvas.height;



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


            // 3. If dynamic coordinate - recalculate
            if (
                (   s.dynamicCoordinate === 'x' && isVisibleVertically)         ||      // Shape with x dynamic sizing      
                (   s.dynamicCoordinate === 'y' && isVisibleHorizontally)               // Shape with y dynamic sizing    
            ){

                //----------------------------------------------------------Dynamic: Recalculate dynamic coordinates, if scale changed
                
                //If coordinate id dynamic no drift compensation
                let applyDriftCompensationX = true
                let applyDriftCompensationY = true
                if(this.k_old != this.transform.k){

                    this.logicalWidth  = canvas.width   * (1 - this.paddingInit ) / this.dynX_count
                    this.logicalHeight = canvas.height  * (1 - this.paddingInit ) / this.dynY_count
                
                    for(const s of this.shapes){
                        if(s.dynamicCoordinate === 'x'){
                            s.width = this.logicalWidth / this.transform.k  
                            s.left =   s.shift * this.logicalWidth / this.transform.k  
                            applyDriftCompensationX = false
                        }
                        if(s.dynamicCoordinate === 'y'){
                            s.height = this.logicalHeight / this.transform.k    
                            s.left = s.shift * this.logicalHeight / this.transform.k
                            applyDriftCompensationY = false
                        }
                    }
                
                    this.k_old = this.transform.k

                    // Compensation during pan
                    if( this.transform.applyDriftCompensationX !== applyDriftCompensationX  )   {
                        this.transform.applyDriftCompensationX = applyDriftCompensationX 
                    }// 3. Define borders
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
            if ( isVisibleHorizontally && isVisibleVertically ){


                // log shapes
                if (cbUpdateList.checked) addListItem(cTree, s.toString());


                //----------------------------------------------------------Drawing shapes
                ctxBuffer.fillStyle = s.color;
                switch (s.type) {
                    case 'rect':
                        ctxBuffer.fillRect(xToPx(s.left), yToPy(s.top), s.width * t.k, s.height * t.k);
                        //console.log(xToPx(s.left) +','+yToPy(s.top)+','+s.width * t.k,+','+ s.height * t.k)
                        break;
                    case 'circle':
                        ctxBuffer.beginPath();
                        ctxBuffer.ellipse(
                            xToPx(s.left + s.width / 2),
                            yToPy(s.top + s.height / 2),
                            s.width * t.k / 2,
                            s.height * t.k / 2,
                            0, 0, Math.PI * 2
                        );
                        ctxBuffer.fill();
                        break;
                    case 'line':
                        ctxBuffer.beginPath();
                        ctxBuffer.moveTo(xToPx(s.left), yToPy(s.top));
                        ctxBuffer.lineTo(xToPx(s.left + s.width), yToPy(s.top + s.height));
                        ctxBuffer.closePath();
                        ctxBuffer.strokeStyle = s.color;
                        ctxBuffer.stroke();
                        break;
                    case 'point':
                        ctxBuffer.fillRect(xToPx(s.left), yToPy(s.top), 5, 5);
                        break;
                    default:
                        console.log('(!) Wrong shape type');
                        ctxBuffer.fillRect(xToPx(s.left), yToPy(s.top), 5, 5);
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
                ctxBuffer.textAlign = "center";
                ctxBuffer.textBaseline = "middle";
                ctxBuffer.fillStyle =  getColorfulContrastingTextColor(s.color); //invertColor(s.color || "#FFFFFF");

                // Настройки размеров шрифта
                const H_MIN = 6, H_MAX = 18;  // Горизонтально
                const V_MIN = 4, V_MAX = 14;  // Вертикально
                const STEP = 0.5;

                let found = false;

                // Сначала пробуем горизонтально
                for (let fontSize = H_MAX; fontSize >= H_MIN; fontSize -= STEP) {
                    ctxBuffer.font = `${fontSize}px sans-serif`;
                    const textWidth = ctxBuffer.measureText(text).width;
                    const textHeight = fontSize;

                    if (textWidth <= visibleWidth * t.k && textHeight <= visibleHeight * t.k   || !this.adoptTextDirection) {
                        ctxBuffer.fillText(text, px, py);
                        found = true;
                        break;
                    }
                }

                // Если не влезло — пробуем вертикально
                if (!found) {
                    for (let fontSize = V_MAX; fontSize >= V_MIN; fontSize -= STEP) {
                        ctxBuffer.font = `${fontSize}px sans-serif`;
                        const textWidth = ctxBuffer.measureText(text).width;
                        const textHeight = fontSize;

                        // В повороте местами ширина и высота
                        if (textHeight <= visibleWidth * t.k && textWidth <= visibleHeight * t.k) {
                            ctxBuffer.save();
                            ctxBuffer.translate(px, py);
                            ctxBuffer.rotate(-Math.PI / 2);
                            ctxBuffer.fillText(text, 0, 0);
                            ctxBuffer.restore();
                            found = true;
                            break;
                        }
                    }
                }

                //Gather data for adopted grid
                // 1. Encounterd shapes larger than text
                if(this.isDrawAdoptedGrid){
                    xMap.set(s.left, (xMap.get(s.left) || 0) + 1);
                    xMap.set(s.right, (xMap.get(s.right) || 0) + 1);
                    yMap.set(s.top, (yMap.get(s.top) || 0) + 1);
                    yMap.set(s.bottom, (yMap.get(s.bottom) || 0) + 1);
                }   

            }

 

        });
        //----------------------------------------------------------Draw adopted Grid
        if(this.isDrawAdoptedGrid){

            drawAdoptedGrid(xMap, this.ctx, this.transform, false); // вертикальные линии
            drawAdoptedGrid(yMap, this.ctx, this.transform, true);  // горизонтальные линии
                    
        }

        // === 4. Отрисовка буфера с фигурами поверх делений
        this.ctx.drawImage(canvasBuffer, 0, 0);


    }


    defineBoundaries() {
        console.log(`3. Define borders`)
        if (!this.shapes || this.shapes.length === 0) {
            this.boundingRect = null;
            return;
        }


        let left   ;
        let right  ;
        let top    ;
        let bottom ;



        let xmin =  Infinity;
        let xmax = -Infinity;
        let ymin =  Infinity;
        let ymax = -Infinity;

        // 3.1 Dynamic coordinates: define number of layers and ranges for other real coordinate
        // level - dynamic coordinate
        let dinX_Lvl_min = Infinity;
        let dinX_Lvl_max = -Infinity;
        let dinY_Lvl_min = Infinity;
        let dinY_Lvl_max = -Infinity;
        //Coordinate - static coordinate
        let dinX_min = Infinity;
        let dinX_max = -Infinity;
        let dinY_min = Infinity;
        let dinY_max = -Infinity;

        // For dynamic coord: finding maximum level, for static coordinate: find max ranges to calculate prliminary coefficient k
        for (const s of this.shapes) {
            //Dynamic coordinates
            // Ranges for dynamic shapes only
            if(s.dynamicCoordinate ==="x"){
                // Dynamic part finding levels
                dinX_Lvl_min = Math.min(dinX_Lvl_min, s.shift);
                dinX_Lvl_max = Math.max(dinX_Lvl_max, s.shift);
                // Static part
                top    = Math.min(s.top, s.top + s.height);
                bottom = Math.max(s.top, s.top + s.height);
                dinY_min = Math.min(dinY_min, top);
                dinY_max = Math.max(dinY_max, bottom);
                // Update 

                
            }
            else if(s.dynamicCoordinate ==="y"){
                // Dynamic part finding levels
                dinY_Lvl_min = Math.min(dinY_Lvl_min, s.shift);
                dinY_Lvl_max = Math.max(dinY_Lvl_max, s.shift);
                // Static part
                left   = Math.min(s.left, s.left + s.width);
                right  = Math.max(s.left, s.left + s.width);
                dinX_min = Math.min(dinX_min, left);
                dinX_max = Math.max(dinX_max, right);

            }
        }
        const dynWidth = dinX_max - dinX_min 
        const dynHeight = dinY_max - dinY_min

        console.log(`3.1 Dynamic coordinates: defined ranges dynWidth: ${dynWidth}     dynHeight: ${dynHeight}`)

        // For the case when dynamic coorduinates present, recalculate it 
        if (dinX_Lvl_min !== Infinity && dinX_Lvl_max !== -Infinity) {
            this.dynX_count = dinX_Lvl_max - dinX_Lvl_min + 1
            this.hasDynamicShapes = true
        } else {
            this.dynX_count = 0 // Ни одного числового значения не встретилось
        }

        if (dinY_Lvl_min !== Infinity && dinY_Lvl_max !== -Infinity) {
            this.dynY_count = dinY_Lvl_max - dinY_Lvl_min + 1
            this.hasDynamicShapes = true
        } else {
            this.dynY_count = 0 // Ни одного числового значения не встретилось
        }

        // 1.2 Dynamic coordinates: calculate traslate coefficients and choose least to make whole are fit to vewport
        const k_dynX = this.canvas.clientWidth / dynWidth
        const k_dynY = this.canvas.clientHeight / dynHeight


  
        // if( isFinite(dynKx) &&  isFinite(dynKy)){
        //     dynK = Math.max(dynKx,dynKy)
        // }
        // else if(isFinite(dynKx) ){}

        // Создаем массив из значений dynKx и dynKy
        const values = [k_dynX, k_dynY];

        // Фильтруем значения, чтобы исключить NaN, Infinity и undefined
       const validValues = values.filter(v => typeof v === 'number' && isFinite(v) && v > 0);

        // Получаем наибольшее значение из отфильтрованных значений
        // Берём наименьшее из отфильтрованных
        const k_dyn = validValues.length > 0 ? Math.min(...validValues) : 1; // ← 1 — значение по умолчанию



        console.log(`3.2 Coefficients: dynKx =  ${k_dynX}  dynKy =  ${k_dynY}  dynK =  ${k_dyn}`)
        console.log(`3.2.1 dynX_count: ${this.dynX_count}  dynY_count: ${this.dynY_count}   dynWidth ${dynWidth} dynHeight ${dynHeight}`)
       
        // 3.3 Dynamic coordinates: Calculate borders of each lvl to fit viewport
        // Logical width in veiwport to fit all the levels of dynamic shapes
        this.logicalWidth  = canvas.width   * (1 - this.paddingInit ) / this.dynX_count
        this.logicalHeight = canvas.height  * (1 - this.paddingInit ) / this.dynY_count

        // 3.4 For dynamic shapes, calculate coordinates  according to caclculated started k value enough to all shapes be in viewport
        console.log(`3.4 For dynamic shapes, calculate coordinates:`)
        for (const s of this.shapes) {

            if(s.dynamicCoordinate === 'x'){
                s.width = this.logicalWidth  / k_dyn
                s.left =   s.shift * this.logicalWidth /k_dyn
                
            }
            if(s.dynamicCoordinate === 'y'){
                s.height = this.logicalHeight / k_dyn
                s.top = s.shift * this.logicalHeight / k_dyn
            }

            // Нормализуем координаты
            left   = Math.min(s.left, s.left + s.width);
            right  = Math.max(s.left, s.left + s.width);
            top    = Math.min(s.top, s.top + s.height);
            bottom = Math.max(s.top, s.top + s.height);

            console.log(`   - ${s.id} L= ${s.left}  W= ${s.width}  T= ${s.top}  H= ${s.height}  R= ${s.right}  B= ${s.bottom}`);

            xmin = Math.min(xmin, left);
            xmax = Math.max(xmax, right);
            ymin = Math.min(ymin, top);
            ymax = Math.max(ymax, bottom);

        }

        // 3.5 Define all shapes area
        this.k_dyn = k_dyn
        this.Xmin = xmin;
        this.Xmax = xmax;
        this.Ymin = ymin;
        this.Ymax = ymax;
        // And Update to transfor if it is already defined


        // 3.6 Update Trasfer if defined
        console.log(`3.6 Update Trasfer if defined`)
        if (this.transform instanceof Transform2D) {
            console.log(`3.6 Update Trasfer if defined: trasfer defined`)
            this.updateCoeffToTransform()
            this.transform.updateSourceCoord(xmin, xmax, ymin, ymax)
        } else{
            console.log(`(!) Nok trasfer undefined`)
        }

        // this.boundingRect = {
        //     left: xmin,
        //     top: ymin,
        //     width: xmax - xmin,
        //     height: ymax - ymin
        // };



        console.log(`Boundaries x = ${xmin} .. ${xmax} \n          y = ${ymin} .. ${ymax} \n          dyn X: ${this.dynX_count}  dyn y: ${this.dynY_count}`);

    }

    settings(drawGrid, adoptTextDirection){
        if(drawGrid!==undefined)this.drawGrid = drawGrid
        if(adoptTextDirection!==undefined)this.adoptTextDirection = adoptTextDirection
    }

    toString() {
        return `Boundaries ${this.Xmin} : ${this.Ymin} .. ${this.Xmax} : ${this.Ymax} 
        \nDynamic horizontal level: ${this.dynX_count} 
        \nDynamic vertical object level: ${this.dynY_count}` 

    }

}










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








