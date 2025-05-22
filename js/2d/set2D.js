
// (!) all shapes normilezed w, h only positive
//-------------------------------------------------------------------------------------------------
class Set2D extends Transform2D{

    minSizeToDraw = 3               // Minimal shape size to be drawn
    offsetBeforeBorderToDraw = 0
    maxGridNumber = 20              // Maximum number of grid in one axis
    paddingInit = 0.15		        // 5% Padding of inintial centring in parts from whole size (%)  (same for dynamic shapes in set)

    shapes = []

    ctx = undefined

    k_old_draw = undefined                   // previos coefficient src / viewport  to decide if dyn coord should be recalculated while drawing
    // k_dyn = undefined                    // in case of dynamic shapes define coefficient to conatain real size and cacaulate first dynamic coordinates

    hasDynamicShapes = false            // To exclude additional cofficient adoptation transform.init / transform centralize instead
    dynX_count = 0
    dynY_count = 0

    // Settings:
    isDrawGrid_x10 = true
    isDrawAdoptedGrid = true
    adoptTextDirection = true


    // Result boundaries (! shoild be updated to transform)


    constructor(canvas){
        super(canvas)
        // this.transform = transform
   
        // this.canvas = this.transform.canvas
        // this.Xmin   = this.transform.Xmin
        // this.Xmax   = this.transform.Xmax
        // this.Ymin   = this.transform.Ymin
        // this.Ymax   = this.transform.Ymax
        // this.xToPx  = super.xToPx.bind(transform)			// Binding methods for convinience
        // this.yToPy  = super.yToPy.bind(transform)
        // this.PxToX  = super.PxToX.bind(transform)			// Binding methods for convinience
        // this.PyToY  = super.PyToY.bind(transform)

        this.ctx = this.canvas.getContext('2d');

        //  Buffer canvas for changing drawing from calculating order
        this.canvasBuffer = document.createElement('canvas');
        this.ctxBuffer = this.canvasBuffer.getContext('2d');


        //this.transform
        
    }

    initSet() {                                         // When set filled with shapes define borders and 
        console.log(`4. InitSet() Define borders`)

        let xmin =  Infinity;
        let xmax = -Infinity;
        let ymin =  Infinity;
        let ymax = -Infinity;

        // 4.1 Dynamic coordinates: define number of layers and ranges for other real coordinate
        // level - dynamic coordinate
        let dinX_Lvl_min = Infinity;
        let dinX_Lvl_max = -Infinity;
        let dinY_Lvl_min = Infinity;
        let dinY_Lvl_max = -Infinity;

        // For dynamic coord: finding maximum level, for static coordinate: find max ranges to calculate prliminary coefficient k
        for (const s of this.shapes) {
            console.log("shape entry:", s);
            //Dynamic coordinates
            if(s.dynamicCoordinate ==="x"){                         // Dynamic x
                // Dynamic part finding levels
                dinX_Lvl_min = Math.min(dinX_Lvl_min, s.shift);
                dinX_Lvl_max = Math.max(dinX_Lvl_max, s.shift);

                // Static part
                ymin = Math.min(ymin, Math.min(s.top, s.top + s.height) );
                ymax = Math.max(ymax, Math.max(s.top, s.top + s.height) );

            }
            else if(s.dynamicCoordinate ==="y"){                         // Dynamic y
                // Dynamic part finding levels
                dinY_Lvl_min = Math.min(dinY_Lvl_min, s.shift);
                dinY_Lvl_max = Math.max(dinY_Lvl_max, s.shift);
                
                // Static part
                xmin = Math.min(xmin, Math.min(s.left, s.left + s.width) );
                xmax = Math.max(xmax, Math.max(s.left, s.left + s.width) );

            }
            else{                                                          // Real coordinates
                xmin = Math.min(xmin, Math.min(s.left, s.left + s.width) );
                xmax = Math.max(xmax, Math.max(s.left, s.left + s.width) );
                ymin = Math.min(ymin, Math.min(s.top,  s.top + s.height) );
                ymax = Math.max(ymax, Math.max(s.top,  s.top + s.height) );

            }
        }

        // const dynWidth = dinX_max - dinX_min 
        // const dynHeight = dinY_max - dinY_min

        // console.log(`3.1 Dynamic coordinates: defined ranges dynWidth: ${dynWidth}     dynHeight: ${dynHeight}`)

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

        //????????????????????????????????????
        if ( xmin ==  Infinity) xmin = 0
        if ( xmax == -Infinity) xmax = 0
        if ( ymin ==  Infinity) ymin = 0
        if ( ymax == -Infinity) ymax = 0


        // // 1.2 Dynamic coordinates: calculate traslate coefficients and choose least to make whole are fit to vewport
        // const k_dynX = this.canvas.clientWidth / dynWidth
        // const k_dynY = this.canvas.clientHeight / dynHeight


  
    //     // if( isFinite(dynKx) &&  isFinite(dynKy)){
    //     //     dynK = Math.max(dynKx,dynKy)
    //     // }
    //     // else if(isFinite(dynKx) ){}

    //     // Создаем массив из значений dynKx и dynKy
    //     const values = [k_dynX, k_dynY];

    //     // Фильтруем значения, чтобы исключить NaN, Infinity и undefined
    //    const validValues = values.filter(v => typeof v === 'number' && isFinite(v) && v > 0);

    //     // Получаем наибольшее значение из отфильтрованных значений
    //     // Берём наименьшее из отфильтрованных
    //     const k_dyn = validValues.length > 0 ? Math.min(...validValues) : 1; // ← 1 — значение по умолчанию



    //     console.log(`3.2 Coefficients: dynKx =  ${k_dynX}  dynKy =  ${k_dynY}  dynK =  ${k_dyn}`)
    //     console.log(`3.2.1 dynX_count: ${this.dynX_count}  dynY_count: ${this.dynY_count}   dynWidth ${dynWidth} dynHeight ${dynHeight}`)
       
    //     // 3.3 Dynamic coordinates: Calculate borders of each lvl to fit viewport
    //     // Logical width in veiwport to fit all the levels of dynamic shapes
        
        

        


        // // 3.4 For dynamic shapes, calculate coordinates  according to caclculated started k value enough to all shapes be in viewport
        // console.log(`3.4 For dynamic shapes, calculate coordinates:`)

        // this.calcDynamicCoordinates(k_dyn)

        // // this.logicalWidth  = canvas.width   * (1 - this.paddingInit ) / this.dynX_count
        // // this.logicalHeight = canvas.height  * (1 - this.paddingInit ) / this.dynY_count

        // for (const s of this.shapes) {

        // //     if(s.dynamicCoordinate === 'x'){
        // //         s.width = this.logicalWidth  / k_dyn
        // //         s.left =   s.shift * this.logicalWidth /k_dyn
                
        // //     }
        // //     if(s.dynamicCoordinate === 'y'){
        // //         s.height = this.logicalHeight / k_dyn
        // //         s.top = s.shift * this.logicalHeight / k_dyn
        // //     }



        // }

        // 3.5 Define all shapes area
        // this.k_dyn = k_dyn
        this.Xmin = xmin;
        this.Xmax = xmax;
        this.Ymin = ymin;
        this.Ymax = ymax;
        // And Update to transfor if it is already defined


        // // 3.6 Update Trasfer if defined
        // console.log(`3.6 Update Trasfer if defined`)
        // if (this.transform instanceof Transform2D) {
        //     console.log(`3.6 Update Trasfer if defined: trasfer defined`)
        //     this.updateCoeffToTransform()
        //     this.transform.updateSourceCoord(xmin, xmax, ymin, ymax)
        // } else{
        //     console.log(`(!) Nok trasfer undefined`)
        // }

        // this.boundingRect = {
        //     left: xmin,
        //     top: ymin,
        //     width: xmax - xmin,
        //     height: ymax - ymin
        // };


        console.log(`Boundaries x = ${this.Xmin} .. ${this.Xmax} \n          y = ${this.Ymin} .. ${this.Ymax = ymax} \n 
                    dyn X: ${this.dynX_count}  dyn y: ${this.dynY_count}\
                    dyn Lvl X: ${this.dynX_count}  dyn y: ${this.dynY_count}`);

        this.toCenter()

    }






    // updateCoeffToTransform(){
    //     const {k_dyn} = this
    //     // If dynamic shapes present and initial k coefficient is calculated
    //     console.log(`update k to transfer? k_dyn  ${k_dyn}`)
    //     if (typeof k_dyn === 'number' && isFinite(k_dyn)) { 
    //         this.transform.k = k_dyn
    //         this.transform.k_old = k_dyn
    //         console.log(`update done k_dyn  ${k_dyn}`)
    //     }
    // }


    
    draw() {




        const{ ctx, canvas, ctxBuffer, canvasBuffer,k,visibleLeft,visibleRight,visibleTop,visibleBottom, br:boundingRect} = this 
        const xToPx = this.xToPx.bind(this);
        const yToPy = this.yToPy.bind(this);

        console.log(`draw: k ${k}`)
            
        if (cbUpdateList.checked) cTree.innerHTML = '';

        // 1. Draw grid x10
        if(this.isDrawGrid_x10){
            drawGrid_x10(this.ctx, this)
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
                shapeRight  - this.offsetBeforeBorderToDraw >= visibleLeft &&
                shapeLeft   + this.offsetBeforeBorderToDraw <= visibleRight;

            let isVisibleVertically =                 
                shapeBottom - this.offsetBeforeBorderToDraw >= visibleTop &&
                shapeTop    + this.offsetBeforeBorderToDraw <= visibleBottom;


            // 3. If dynamic coordinate - recalculate
            if (
                (   s.dynamicCoordinate === 'x' && isVisibleVertically)         ||      // Shape with x dynamic sizing      
                (   s.dynamicCoordinate === 'y' && isVisibleHorizontally)               // Shape with y dynamic sizing    
            ){

                //----------------------------------------------------------Dynamic: Recalculate dynamic coordinates, if scale changed
                
                // If coordinate id dynamic no drift compensation
                let applyDriftCompensationX = true
                let applyDriftCompensationY = true
                if(this.k_old_draw != k){

                    this.calcDynamicCoordinates( k )
                
                    this.k_old_draw = k

                    // Compensation during pan
                    if( this.applyDriftCompensationX !== applyDriftCompensationX  )   {
                        this.applyDriftCompensationX = applyDriftCompensationX 
                    }// 3. Define borders
                    if( this.applyDriftCompensationY !== applyDriftCompensationY  )   {
                        this.applyDriftCompensationY = applyDriftCompensationY 
                    }
                    
                    
                    isVisibleHorizontally =  
                        s.left + s.width - this.offsetBeforeBorderToDraw    >= visibleLeft &&
                        s.left           + this.offsetBeforeBorderToDraw    <= visibleRight ;
                    isVisibleVertically =                 
                        s.top + s.height - this.offsetBeforeBorderToDraw    >= visibleTop &&
                        s.top            + this.offsetBeforeBorderToDraw    <= visibleBottom;
               }

            }



            // Drawing shape
            console.log(`-------------pxShift${this.pxShift}`)
            if (s.width * k < this.minSizeToDraw   &&   s.height * k < this.minSizeToDraw) return false;      // Skip tiny objects
            if ( isVisibleHorizontally && isVisibleVertically ){


                // log shapes
                if (cbUpdateList.checked) addListItem(cTree, s.toString());


                //----------------------------------------------------------Drawing shapes
                ctxBuffer.fillStyle = s.color;
                switch (s.type) {
                    case 'rect':
                        ctxBuffer.fillRect(xToPx(s.left), yToPy(s.top), s.width * k, s.height * k);
                        //console.log(xToPx(s.left) +','+yToPy(s.top)+','+s.width * t.k,+','+ s.height * t.k)
                        break;
                    case 'circle':
                        ctxBuffer.beginPath();
                        ctxBuffer.ellipse(
                            xToPx(s.left + s.width / 2),
                            yToPy(s.top + s.height / 2),
                            s.width * k / 2,
                            s.height * k / 2,
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
                const visibleL   = Math.max(shapeLeft, visibleLeft);
                const visibleR  = Math.min(shapeRight, visibleRight);
                const visibleT    = Math.max(shapeTop, visibleTop);
                const visibleB = Math.min(shapeBottom, visibleBottom);

                // Вычисление размеров видимой области
                const visibleWidth  = visibleR - visibleL;
                const visibleHeight = visibleB- visibleT;

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

                    if (textWidth <= visibleWidth * k && textHeight <= visibleHeight * k   || !this.adoptTextDirection) {
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
                        if (textHeight <= visibleWidth * k && textWidth <= visibleHeight * k) {
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

            drawAdoptedGrid(xMap, this.ctx, this, false); // вертикальные линии
            drawAdoptedGrid(yMap, this.ctx, this, true);  // горизонтальные линии
                    
        }

        // === 4. Отрисовка буфера с фигурами поверх делений
        this.ctx.drawImage(canvasBuffer, 0, 0);


    }

    calcDynamicCoordinates( k ){
        this.logicalWidth  = canvas.width  * (1 - this.paddingInit ) / this.dynX_count
        this.logicalHeight = canvas.height * (1 - this.paddingInit ) / this.dynY_count
    
        for(const s of this.shapes){
            if(s.dynamicCoordinate === 'x'){
                s.width = this.logicalWidth / k  
                s.left =   s.shift * this.logicalWidth / k  
                this.applyDriftCompensationX = false
            }
            if(s.dynamicCoordinate === 'y'){
                s.height = this.logicalHeight / k    
                s.left = s.shift * this.logicalHeight / k
                this.applyDriftCompensationY = false
            }
        }
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