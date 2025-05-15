/**
 *  Wv , Hv - Sizes of viewport
 *  Xmin, Xmax, Ymin, Ymax - extremum shapes set coordinates
 * 
 */

class Transform2D {
	constructor(canvasElement, Xmin, Xmax, Ymin, Ymax) {
		this.canvas = canvasElement;

		this.applyDriftCompensationX = true	// compensation of drift when sclaling (should be off when dynamic coordinates in use)
		this.applyDriftCompensationY = true	// compensation of drift when sclaling (should be off when dynamic coordinates in use)

		this.Wv = canvasElement.clientWidth;
		this.Hv = canvasElement.clientHeight;

		this.Xmin = Xmin;
		this.Xmax = Xmax;
		this.Ymin = Ymin;
		this.Ymax = Ymax;

		this.padding = 30;			//Padding for inintialcentring
		this.zoomFactor = 1.1;
		this.clearPadding = 0;		// Padding for check clear

		this.k = 1;
		this.kOld = 1;

		this.pxShift = 0;
		this.pyShift = 0;

		this.isDragging = false;
		this.startX = 0;
		this.startY = 0;

		this.initScale();
	}

	initScale() {


		const { Xmin, Xmax, Ymin, Ymax, padding, Wv, Hv } = this;

		const width = Xmax - Xmin + padding * 2;
		const height = Ymax - Ymin + padding * 2;
	
		this.k = Math.min(Wv / width, Hv / height);
		this.kOld = this.k;
	
		const centerX = (Xmin + Xmax) / 2;
		const centerY = (Ymin + Ymax) / 2;
	
		this.pxShift = Wv / 2 - this.k * centerX;
		this.pyShift = Hv / 2 - this.k * centerY;
	
		this.calcVisibleRanges();

	}
	centrlize(){

		const { Xmin, Xmax, Ymin, Ymax, padding, Wv, Hv } = this;

		const width = Xmax - Xmin + padding * 2;
		const height = Ymax - Ymin + padding * 2;

		const centerX = (Xmin + Xmax) / 2;
		const centerY = (Ymin + Ymax) / 2;
	
		this.pxShift = Wv / 2 - this.k * centerX;
		this.pyShift = Hv / 2 - this.k * centerY;

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

	calcVisibleRanges() {
		const { Wv, Hv, k, pxShift, pyShift, clearPadding } = this;

		this.canvas.width = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;

		this.visibleLeft = (0 - pxShift) / k + clearPadding;
		this.visibleTop = (0 - pyShift) / k + clearPadding;
		this.visibleRight = (Wv - pxShift) / k - clearPadding;
		this.visibleBottom = (Hv - pyShift) / k - clearPadding;
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
		this.kOld = this.k;
		this.k *= delta;

		if (this.applyDriftCompensationX){
			const driftCorrX = (this.Wv / 2 - this.pxShift) * (this.kOld - this.k) / this.kOld;

			this.pxShift += driftCorrX;

		}
		if (this.applyDriftCompensationY){

			const driftCorrY = (this.Hv / 2 - this.pyShift) * (this.kOld - this.k) / this.kOld;

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
