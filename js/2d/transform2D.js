/**
 *  Wv , Hv - Sizes of viewport
 *  Xmin, Xmax, Ymin, Ymax - extremum shapes set coordinates
 * 
 */

class Transform2D {
	constructor(canvas, Xmin, Xmax, Ymin, Ymax, k) {
		console.log(`4.1 Creating Trasform2D Xmin: ${Xmin},  Xmax: ${Xmax}, Ymin: ${Ymin},  Ymax: ${Ymax},  k: ${k}`)
		this.canvas = canvas;

		this.applyDriftCompensationX = true	// compensation of drift when sclaling (should be off when dynamic coordinates in use)
		this.applyDriftCompensationY = true	// compensation of drift when sclaling (should be off when dynamic coordinates in use)

		this.Wv = canvas.clientWidth;
		this.Hv = canvas.clientHeight;

		this.updateSourceCoord(Xmin, Xmax, Ymin, Ymax)

		this.paddingInit = 0.05;		// 5% Padding for inintialcentring in parts from whole size  (same for dynamic shapes in ShapeSet)
		this.zoomFactor = 1.1;
		this.clearPadding = 0;		// Padding for check if shape in draw list

		this.k = k;					// if defined 
		this.k_old = k;

		this.pxShift = 0;
		this.pyShift = 0;

		this.isDragging = false;
		this.startX = 0;
		this.startY = 0;
		
		if(typeof k === 'number' && isFinite(k)){		// If k alredy defineded (for dynamyc shapes)		k-> x -> k 
			this.toCenterShift()
		}
		else{
			this.toCenterScale()
		}
			

	}

	updateSourceCoord(Xmin, Xmax, Ymin, Ymax) {
		this.Xmin = Xmin;
		this.Xmax = Xmax;
		this.Ymin = Ymin;
		this.Ymax = Ymax;
	}

	toCenterScale() {
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

		this.toCenterShift()				// Wv and Hv will duplicate

		// const centerX = (Xmin + Xmax) / 2;
		// const centerY = (Ymin + Ymax) / 2;

		// this.pxShift = this.Wv / 2 - this.k * centerX;
		// this.pyShift = this.Hv / 2 - this.k * centerY;


		console.log(`toCenterScale() contentWidth: ${contentWidth}		contentHeight: ${contentHeight}`)

	}




	toCenterShift(){
		console.log(`toCenterShift`)
		const { canvas, Xmin, Xmax, Ymin, Ymax, paddingInit: padding, Wv, Hv } = this;

		this.Wv = canvas.clientWidth;
		this.Hv = canvas.clientHeight;

		const centerX = (Xmin + Xmax) / 2;
		const centerY = (Ymin + Ymax) / 2;
	
		this.pxShift = this.Wv / 2 - this.k * centerX;
		this.pyShift = this.Hv / 2 - this.k * centerY;

		this.calcVisibleRanges();

	}

	calcVisibleRanges() {
		console.log(`calcVisibleRanges`)
		const { Wv, Hv, k, pxShift, pyShift, clearPadding } = this;

		this.canvas.width = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;

		this.visibleLeft 	= (0 - pxShift) / k + clearPadding;
		this.visibleTop 	= (0 - pyShift) / k + clearPadding;
		this.visibleRight	= (Wv - pxShift) / k - clearPadding;
		this.visibleBottom 	= (Hv - pyShift) / k - clearPadding;
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
