
// (!) all shapes normilezed w, h only positive
//-------------------------------------------------------------------------------------------------
class Set2D extends Transform2D{

    minSizeToDraw = 3               // Minimal shape size to be drawn
    offsetBeforeBorderToDraw = 0
    maxGridNumber = 20              // Maximum number of grid in one axis
    paddingInit = 0.15		        // 5% Padding of inintial centring in parts from whole size (%)  (same for dynamic shapes in set)

    shapes = []

    ctx = undefined

    k_last_dyn_calc = undefined                   // previos coefficient src / viewport  to decide if dyn coord should be recalculated while drawing
    // k_dyn = undefined                    // in case of dynamic shapes define coefficient to conatain real size and cacaulate first dynamic coordinates

    hasDynamicShapes = false            // To exclude additional cofficient adoptation transform.init / transform centralize instead
    dynX_Lvl = 0
    dynY_Lvl = 0

    // Settings:
    drawGridx10 = false
    drawGridAdopted = true
    adoptTextDirection = true



    // Result boundaries (! shoild be updated to transform)


    constructor(canvas){
        super(canvas)

        this.ctx = this.canvas.getContext('2d');

        //  Buffer canvas for changing drawing from calculating order
        this.canvasBuffer = document.createElement('canvas');
        this.ctxBuffer = this.canvasBuffer.getContext('2d');


        //this.transform
        
    }

    initSet() {                                         // When set filled with shapes define borders and 
        console.log(`4. InitSet() Define borders`)
        this.applyDriftCompensationX = true
        this.applyDriftCompensationY = true

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
            if(s.dynamicCoordinate ==="x"){                                 // Dynamic x
                // Dynamic part finding levels
                dinX_Lvl_min = Math.min(dinX_Lvl_min, s.shift);
                dinX_Lvl_max = Math.max(dinX_Lvl_max, s.shift);

                // Static part
                ymin = Math.min(ymin, Math.min(s.top, s.top + s.height) );
                ymax = Math.max(ymax, Math.max(s.top, s.top + s.height) );

                this.applyDriftCompensationX = false
            }
            else if(s.dynamicCoordinate ==="y"){                            // Dynamic y
                // Dynamic part finding levels
                dinY_Lvl_min = Math.min(dinY_Lvl_min, s.shift);
                dinY_Lvl_max = Math.max(dinY_Lvl_max, s.shift);
                
                // Static part
                xmin = Math.min(xmin, Math.min(s.left, s.left + s.width) );
                xmax = Math.max(xmax, Math.max(s.left, s.left + s.width) );
                
                this.applyDriftCompensationY = false
            }
            else{                                                          // Real coordinates
                xmin = Math.min(xmin, Math.min(s.left, s.left + s.width) );
                xmax = Math.max(xmax, Math.max(s.left, s.left + s.width) );
                ymin = Math.min(ymin, Math.min(s.top,  s.top + s.height) );
                ymax = Math.max(ymax, Math.max(s.top,  s.top + s.height) );

            }
        }

        // If dynamic coorduinates present, calc number of levels 
        if (dinX_Lvl_min !== Infinity && dinX_Lvl_max !== -Infinity) {
            this.dynX_Lvl = dinX_Lvl_max - dinX_Lvl_min + 1
            this.hasDynamicShapes = true
        } else {
            this.dynX_Lvl = 0 // Ни одного числового значения не встретилось
        }

        if (dinY_Lvl_min !== Infinity && dinY_Lvl_max !== -Infinity) {
            this.dynY_Lvl = dinY_Lvl_max - dinY_Lvl_min + 1
            this.hasDynamicShapes = true
        } else {
            this.dynY_Lvl = 0 // Ни одного числового значения не встретилось
        }

        //????????????????????????????????????
        // if ( xmin ==  Infinity) xmin = 0
        // if ( xmax == -Infinity) xmax = 0
        // if ( ymin ==  Infinity) ymin = 0
        // if ( ymax == -Infinity) ymax = 0


        this.Xmin = xmin;
        this.Xmax = xmax;
        this.Ymin = ymin;
        this.Ymax = ymax;

        // define k
        this.toCenterScale()


        // If dynamic coordinates exists - calculate it:
        if(this.hasDynamicShapes){
            this.calcDynamicCoordinates()
        }

        // 3.5 Define all shapes area
        // this.k_dyn = k_dyn

        this.toCenterShift()

        // 1. сначала всё добавили и нашли границы
        // 2. масштаб с учётом padding
        // this.toCenterScale();
        // if (this.hasDynamicShapes) {
        //     this.calcDynamicCoordinates();  // фигуры "физически" размещены, Xmin/Xmax актуальны
        //     this.toCenterScale();
        // }

        // // 2. масштаб с учётом padding


        // // 3. сдвиг для центрирования
        // this.toCenterShift();


        console.log(`Boundaries x = ${this.Xmin} .. ${this.Xmax} \n          y = ${this.Ymin} .. ${this.Ymax = ymax} \n 
                    dyn X: ${this.dynX_Lvl}  dyn y: ${this.dynY_Lvl}\
                    dyn Lvl X: ${this.dynX_Lvl}  dyn y: ${this.dynY_Lvl}\n
                    applyDriftCompensationX: ${this.applyDriftCompensationX},  applyDriftCompensationY: ${this.applyDriftCompensationY}`);

        //this.toCenter()

    }


    
    draw() {




        const{ ctx, canvas, ctxBuffer, canvasBuffer,k,visibleLeft,visibleRight,visibleTop,visibleBottom, br:boundingRect} = this 
        const xToPx = this.xToPx.bind(this);
        const yToPy = this.yToPy.bind(this);

        console.log(`draw: k ${k}`)
            
        if (cbUpdateList.checked) cTree.innerHTML = '';

        // 1. Draw grid x10
        if(this.drawGridx10){
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

                if(this.k_last_dyn_calc != k){

                    this.calcDynamicCoordinates()
                
  
                    
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
                const px = xToPx(visibleL + visibleWidth / 2);
                const py = yToPy(visibleT + visibleHeight / 2);

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
                if(this.drawGridAdopted){
                    xMap.set(s.left, (xMap.get(s.left) || 0) + 1);
                    xMap.set(s.right, (xMap.get(s.right) || 0) + 1);
                    yMap.set(s.checkedtop, (yMap.get(s.top) || 0) + 1);
                    yMap.set(s.bottom, (yMap.get(s.bottom) || 0) + 1);
                }   

            }

 

        });
        //----------------------------------------------------------Draw adopted Grid
        if(this.drawGridAdopted){

            drawAdoptedGrid(xMap, this.ctx, this, false); // вертикальные линии
            drawAdoptedGrid(yMap, this.ctx, this, true);  // горизонтальные линии
                    
        }

        // === 4. Отрисовка буфера с фигурами поверх делений
        this.ctx.drawImage(canvasBuffer, 0, 0);


    }

    calcDynamicCoordinates(){
        const {k} = this
        this.dynLvlWidth  = canvas.width  * (1 - this.paddingInit ) / this.dynX_Lvl
        this.dynLvlHeight = canvas.height * (1 - this.paddingInit ) / this.dynY_Lvl
    
        for(const s of this.shapes){
            if(s.dynamicCoordinate === 'x'){
                s.width = this.dynLvlWidth / this.k  
                s.left =   s.shift * this.dynLvlWidth / k  

                this.Xmin = Math.min(this.Xmin, Math.min(s.left, s.left + s.width) );
                this.Xmax = Math.max(this.Xmax, Math.max(s.left, s.left + s.width) );
            }
            if(s.dynamicCoordinate === 'y'){
                s.height = this.dynLvlHeight / k    
                s.left = s.shift * this.dynLvlHeight / k

                //Update boundaries
                this.Ymin = Math.min(this.Ymin, Math.min(s.top, s.top + s.height) );
                this.Ymax = Math.max(this.Ymax, Math.max(s.top, s.top + s.height) );
            }
        }
        this.k_last_dyn_calc = k
        
    }


   

    settings(drawGridx10, drawGridAdopted, adoptTextDirection){
        if(drawGridx10 != undefined)this.drawGridx10 = drawGridx10
        if(drawGridAdopted != undefined)this.drawGridAdopted = drawGridAdopted
        if(adoptTextDirection !== undefined)this.adoptTextDirection = adoptTextDirection
    }

    toString() {
        return `Boundaries ${this.Xmin} : ${this.Ymin} .. ${this.Xmax} : ${this.Ymax} 
        \nDynamic horizontal level: ${this.dynX_Lvl} 
        \nDynamic vertical object level: ${this.dynY_Lvl}` 

    }

}