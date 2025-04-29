/**
 *  Wv , Hv - Sizes of viewport
 *  Xmin, Xmax, Ymin, Ymax - extremum shapes set coordinates
 * 
 */

class Transform2D{
    constructor(Wv, Hv, Xmin, Xmax, Ymin, Ymax){
        this.Wv = Wv
        this.Hv = Hv
        this.Xmin = Xmin
        this.Xmax = Xmax
        this.Ymin = Ymin
        this.Ymax = Ymax

        //Initial padding 
        this.padding = 30
        this.zoomFactor = 1.1  // mouse wheel zoom factor
        this.clearPadding = 20
        
        // Zoom coefficient
        this.k = 1
        this.kOld = 1

        this.isDragging = false     // mouse dragging flag
		this.startX = 0             // start drag X
		this.startY = 0             // start drag Y

        // Shift between Viewport and source data coordinate systems
        this.pxShift = 0
        this.pyShift = 0

        this.initScale()
    }

    initScale(){
        // Choose axis with maximum difference
        const { Wv:Wv, Hv:Hv, Xmin:Xmin, Xmax:Xmax, Ymin:Ymin, Ymax:Ymax, padding:padding} = this
		if (Wv / (Xmax - Xmin + padding * 2) > Hv / (Ymax - Ymin + padding * 2)) {
			this.k = Hv / (Ymax - Ymin + padding * 2);
		} else {
			this.k = Wv / (Xmax - Xmin + padding * 2); 
		}

        // Shift to locate X min Y min near 0,0 viewport
		this.pxShift = -this.k * (Xmin - padding)
		this.pyShift = -this.k * (Ymin - padding)

        this.calcVisibleRanges()

    }

    
    xToPx(x){
        return this.pxShift + this.k * x
    }
    yToPy(y){
        return this.pyShift + this.k * y
    }

    calcVisibleRanges(){
        const { Wv:Wv, Hv:Hv, k:k, pxShift:pxShift, pyShift:pyShift, clearPadding:clearPadding} = this
        this.visibleLeft   = (0  - pxShift) / k + clearPadding
        this.visibleTop    = (0  - pyShift) / k + clearPadding
        this.visibleRight  = (Wv - pxShift) / k - clearPadding
        this.visibleBottom = (Hv - pyShift) / k - clearPadding
    }

    mouseDown(x, y){
        this.isDragging = true;
        this.startX = x;
        this.startY = y;
    }

    mouseMove(x,y){
        // if (this.isDragging) {                   // This check preformed externally
            this.pxShift += x - this.startX;
            this.pyShift += y - this.startY;
            this.startX = x;
            this.startY = y;

            this.calcVisibleRanges()

        // }
    }
    //Zoom detaxY -mouse wheel parameter. After zoom drift correction applied
    mouseWheel(deltaY){

        const { Wv:Wv, Hv:Hv, pxShift:pxShift, pyShift:pyShift, zoomFactor:zoomFactor } = this
        
        // Определяем направление прокрутки (увеличение или уменьшение)
        const delta = deltaY < 0 ? zoomFactor : 1 / zoomFactor; // Увеличение или уменьшение масштаба

        // Изменяем масштаб
        this.kOld = this.k
        this.k *= delta;

        //drift correction to stay center point a its postion after zoom
        const driftCorrX  = (( Wv )/2 - pxShift) * ( this.kOld - this.k )  / this.kOld
        const driftCorrY  = (( Hv )/2 - pyShift) * ( this.kOld - this.k  ) / this.kOld

        this.pxShift += driftCorrX
        this.pyShift += driftCorrY

        this.calcVisibleRanges()

    }

    // // Resize Viewport. w & h  new viewport Width and height
    // resize(w,h){
    //     const { Wv: oldWv, Hv: oldHv, pxShift, pyShift } = this;

    //     // Обновляем размеры области просмотра
    //     this.Wv = w;
    //     this.Hv = h;
    
    //     // Корректируем сдвиг (pxShift, pyShift), чтобы центр области остался на том же логическом месте
    //     const centerLogicalX = (oldWv / 2 - pxShift) / this.k;
    //     const centerLogicalY = (oldHv / 2 - pyShift) / this.k;
    
    //     // Новый сдвиг для нового размера области
    //     this.pxShift = w / 2 - centerLogicalX * this.k;
    //     this.pyShift = h / 2 - centerLogicalY * this.k;
    
    //     // Пересчитываем видимые диапазоны
    //     this.calcVisibleRanges();
    // }
    updateViewport(newWv, newHv, oldLeft, oldTop, newLeft, newTop) {
        // newWv, newHv: новые ширина и высота div
        // oldLeft, oldTop: старое положение верхнего левого угла div относительно страницы
        // newLeft, newTop: новое положение верхнего левого угла div относительно страницы
    
        const {
            Wv: oldWv,
            Hv: oldHv,
            pxShift: oldPxShift,
            pyShift: oldPyShift,
            k: oldK
        } = this;
    
        // Рассчитываем изменение размеров div
        const widthScale = newWv / oldWv;
        const heightScale = newHv / oldHv;
    
        // Корректируем масштаб (k) для сохранения видимого масштаба фигур
        const newK = oldK * Math.min(widthScale, heightScale);
    
        // Рассчитываем смещение div относительно страницы
        const deltaX = newLeft - oldLeft;
        const deltaY = newTop - oldTop;
    
        // Рассчитываем корректировку для pxShift и pyShift
        const shiftXCorrection = (newWv - oldWv) / 2 - deltaX * oldK;
        const shiftYCorrection = (newHv - oldHv) / 2 - deltaY * oldK;
    
        // Обновляем параметры
        this.Wv = newWv;
        this.Hv = newHv;
        this.k = newK;
    
        this.pxShift = oldPxShift + shiftXCorrection;
        this.pyShift = oldPyShift + shiftYCorrection;
    
        // Пересчитываем видимые диапазоны
        this.calcVisibleRanges();
    }
    

}