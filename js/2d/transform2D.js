/**
 *  Wv , Hv - Sizes of viewport
 *  Xmin, Xmax, Ymin, Ymax - extremum shapes set coordinates
 * 
 * 	Performs transform between sorce an destination (0,0 Wv,Hv) coordinates
 * 	
 * 
 */

class Transform2D {
	constructor( canvas ) {
		console.log(`1 Creating Trasform2D `)
		this.canvas = canvas;
		this.updateDstCoord()

		this.applyDriftCompensationX = true	// compensation of drift when sclaling (should be off when dynamic coordinates in use)
		this.applyDriftCompensationY = true	// compensation of drift when sclaling (should be off when dynamic coordinates in use)




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

	updateDstCoord(){
		this.canvas.width = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;
		this.Wv = this.canvas.width 
		this.Hv = this.canvas.height
	}

		
	
	toCenterScale() {							// Set the shift to align the center of the source with the center of the viewport.
		
		console.log(`Transform2D.toCenterScale()`)

		this.updateDstCoord()
		const { Xmin, Xmax, Ymin, Ymax, paddingInit: padding } = this;

		//Check if boundaries correct

		const validX = Number.isFinite(Xmin) && Number.isFinite(Xmax);
		const validY = Number.isFinite(Ymin) && Number.isFinite(Ymax);

		// const width  = ( Xmax - Xmin ) * ( 1 + padding * 2);
		// const height = ( Ymax - Ymin ) * ( 1 + padding * 2)  ;

		if (validX && validY) {
			this.k = Math.min(this.Wv / (  ( Xmax - Xmin ) * ( 1 + padding * 2)  ), this.Hv / (  ( Ymax - Ymin ) * ( 1 + padding * 2)  )    );
			this.k_old = this.k;
			console.log(`K calculated by both X and Y`)
		} else if (validX) {
			this.k = this.Wv / (  ( Xmax - Xmin ) * ( 1 + padding * 2)  );
			this.k_old = this.k;
			console.log(`K calculated by X only`)
		} else if (validY) {
			this.k = this.Hv / (  ( Ymax - Ymin ) * ( 1 + padding * 2)   );
			this.k_old = this.k;
			console.log(`K calculated by Y only  ( Ymax - Ymin )= ${( Ymax - Ymin )}`)
		}

		

		//console.log(`toCenterScale() contentWidth: ${contentWidth}		contentHeight: ${contentHeight}`)

	}

	toCenterShift(){					// Set the shift to align the center of the source with the center of the viewport.

		console.log(`toCenterShift`)

		this.updateDstCoord()
		const { k, Xmin, Xmax, Ymin, Ymax, Wv, Hv } = this;  // используем реальные размеры viewport

		const centerX = (Xmin + Xmax) / 2;
		const centerY = (Ymin + Ymax) / 2;

		this.pxShift = Wv / 2 - k * centerX;
		this.pyShift = Hv / 2 - k * centerY;

		console.log(`toCenterShift: pxShift ${this.pxShift}   k ${k}, Wv ${Wv}, Hv ${Hv},  Xmin ${Xmin}   Xmax ${Xmax}   centerX ${centerX}  centerY ${centerY}`)

		this.calcVisibleRanges();

	}

	toCenter(){
		console.log(`transform x = ${this.Xmin} .. ${this.Xmax} \n          y = ${this.Ymin} .. ${this.Ymax}`)
		this.toCenterShift()				// Wv and Hv will duplicate
		this.toCenterShift()
	}
	

	calcVisibleRanges() {

		this.updateDstCoord()
		
		const { canvas, Wv, Hv, k, pxShift, pyShift, clearPadding } = this;

		console.log(`pxShift: (${pxShift} , pyShift${pyShift} )`)
	

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
		console.log(`mouseWheel:  applyDriftCompensationX: ${this.applyDriftCompensationX},  applyDriftCompensationY: ${this.applyDriftCompensationY}`)
	}

	// Новый resize: сохраняет отображаемую геометрию
	resize(newW, newH) {

		this.updateDstCoord()

		this.Wv = newW;
		this.Hv = newH;
		this.calcVisibleRanges();

	}
}



// cGraph.width = cGraph.clientWidth; // Установка ширины canvas
// cGraph.height = cGraph.clientHeight; // Установка высоты canvas
