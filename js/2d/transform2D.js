/**
 *  Wv , Hv - Sizes of viewport
 *  Xmin, Xmax, Ymin, Ymax - extremum shapes set coordinates
 * 
 */

class Transform2D {
	constructor( canvas ) {
		console.log(`1 Creating Trasform2D `)
		this.canvas = canvas;

		this.applyDriftCompensationX = true	// compensation of drift when sclaling (should be off when dynamic coordinates in use)
		this.applyDriftCompensationY = true	// compensation of drift when sclaling (should be off when dynamic coordinates in use)

		this.Wv = canvas.clientWidth;
		this.Hv = canvas.clientHeight;


		this.k = 1;					// if defined 
		this.k_old = 1.1;

		this.pxShift = 0;
		this.pyShift = 0;

		// local fiels
		this.paddingInit = 0.05;		// 5% Padding for inintialcentring in parts from whole size  (same for dynamic shapes in ShapeSet)
		this.zoomFactor = 1.1;
		this.clearPadding = 0;		// Padding for check if shape in draw list

		
		this.isDragging = false;
		this.startX = 0;
		this.startY = 0;
		
	}

	updateSourceCoord(Xmin, Xmax, Ymin, Ymax) {
		this.Xmin = Xmin;
		this.Xmax = Xmax;
		this.Ymin = Ymin;
		this.Ymax = Ymax;
	}

		
	
	toCenterScale() {							// Set the shift to align the center of the source with the center of the viewport.
		
		console.log(`toCenterScale()`)
		const { canvas, Xmin, Xmax, Ymin, Ymax, paddingInit: padding } = this;

		this.Wv = canvas.clientWidth;
		this.Hv = canvas.clientHeight;

		const contentWidth  = Xmax - Xmin;
		const contentHeight = Ymax - Ymin;

		const paddingX = contentWidth  * padding;
		const paddingY = contentHeight * padding;

		const width = contentWidth + paddingX * 2;
		const height = contentHeight + paddingY * 2;

		this.k = Math.min(this.Wv / width, this.Hv / height);
		this.k_old = this.k;
		

		console.log(`toCenterScale() contentWidth: ${contentWidth}		contentHeight: ${contentHeight}`)

	}

	toCenterShift(){					// Set the shift to align the center of the source with the center of the viewport.

		console.log(`toCenterShift`)
		const { canvas, k, Xmin, Xmax, Ymin, Ymax, paddingInit: padding, Wv, Hv } = this;

		this.Wv = canvas.clientWidth;
		this.Hv = canvas.clientHeight;

		const centerX = (Xmin + Xmax) / 2;
		const centerY = (Ymin + Ymax) / 2;
	
		this.pxShift = this.Wv / 2 - k * centerX;
		this.pyShift = this.Hv / 2 - k * centerY;

		console.log(`pxShift ${this.pxShift}   k ${k} Wv ${Wv}  Xmin ${Xmin }   Xmax ${Xmax }   centerX ${centerX}  centerX ${centerX} `)
	

		this.calcVisibleRanges();

	}

	toCenter(){
		console.log(`transform x = ${this.Xmin} .. ${this.Xmax} \n          y = ${this.Ymin} .. ${this.Ymax}`)
		this.toCenterShift()				// Wv and Hv will duplicate
		this.toCenterShift()
	}
	

	calcVisibleRanges() {
		
		const { canvas, Wv, Hv, k, pxShift, pyShift, clearPadding } = this;

		this.canvas.width  = canvas.clientWidth;
		this.canvas.height = canvas.clientHeight;

		this.visibleLeft 	= (0 - pxShift) / k + clearPadding;
		this.visibleTop 	= (0 - pyShift) / k + clearPadding;
		this.visibleRight	= (Wv - pxShift) / k - clearPadding;
		this.visibleBottom 	= (Hv - pyShift) / k - clearPadding;
		console.log(`calcVisibleRanges: (${this.visibleLeft} , ${this.visibleTop} )  ..  ( ${this.visibleRight} , ${this.visibleBottom} )`)
		
	}
	// From source to viewport
	xToPx(x) {
		return this.pxShift + this.k * x;
	}
	yToPy(y) {
		return this.pyShift + this.k * y;
	}

	//From Viewport to source
	PxToX(px){
		return (px-this.pxShift) / this.k 
	}
	PyToY(py){
		return (py-this.pyShift) / this.k 
	}



	mouseDown(x, y) {
		this.isDragging = true;
		this.startX = x;
		this.startY = y;
	}

	mouseMove(x, y) {
		this.pxShift += x - this.startX;
		this.pyShift += y - this.startY;
		this.startX = x;
		this.startY = y;

		this.calcVisibleRanges();

		//console.log(`x ${x}  this.pxShift ${this.pxShift} `)
	}

	mouseWheel(deltaY) {
		const delta = deltaY < 0 ? this.zoomFactor : 1 / this.zoomFactor;
		this.k_old = this.k;
		this.k *= delta;

		if (this.applyDriftCompensationX){
			const driftCorrX = (this.Wv / 2 - this.pxShift) * (this.k_old - this.k) / this.k_old;

			this.pxShift += driftCorrX;

		}
		if (this.applyDriftCompensationY){

			const driftCorrY = (this.Hv / 2 - this.pyShift) * (this.k_old - this.k) / this.k_old;

			this.pyShift += driftCorrY;
		}
		this.calcVisibleRanges();
	}

	// Новый resize: сохраняет отображаемую геометрию
	resize(newW, newH) {
		this.canvas.width = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;
		this.Wv = newW;
		this.Hv = newH;
		this.calcVisibleRanges();

	}
}



// cGraph.width = cGraph.clientWidth; // Установка ширины canvas
// cGraph.height = cGraph.clientHeight; // Установка высоты canvas
