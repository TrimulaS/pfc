/**
 *  Wv , Hv - Sizes of viewport
 *  Xmin, Xmax, Ymin, Ymax - extremum shapes set coordinates
 * 
 */

class Transform2D {
	constructor(canvasElement, Xmin, Xmax, Ymin, Ymax) {
		this.canvas = canvasElement;

		this.Wv = canvasElement.clientWidth;
		this.Hv = canvasElement.clientHeight;

		this.Xmin = Xmin;
		this.Xmax = Xmax;
		this.Ymin = Ymin;
		this.Ymax = Ymax;

		this.padding = 30;
		this.zoomFactor = 1.1;
		this.clearPadding = 20;

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

		if (Wv / (Xmax - Xmin + padding * 2) > Hv / (Ymax - Ymin + padding * 2)) {
			this.k = Hv / (Ymax - Ymin + padding * 2);
		} else {
			this.k = Wv / (Xmax - Xmin + padding * 2);
		}

		this.kOld = this.k;

		// Центрируем видимую область с учетом padding
		this.pxShift = -this.k * (Xmin - padding);
		this.pyShift = -this.k * (Ymin - padding);

		this.calcVisibleRanges();
	}

	xToPx(x) {
		return this.pxShift + this.k * x;
	}

	yToPy(y) {
		return this.pyShift + this.k * y;
	}

	calcVisibleRanges() {
		const { Wv, Hv, k, pxShift, pyShift, clearPadding } = this;

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

		const driftCorrX = (this.Wv / 2 - this.pxShift) * (this.kOld - this.k) / this.kOld;
		const driftCorrY = (this.Hv / 2 - this.pyShift) * (this.kOld - this.k) / this.kOld;

		this.pxShift += driftCorrX;
		this.pyShift += driftCorrY;

		this.calcVisibleRanges();
	}

	// Новый resize: сохраняет отображаемую геометрию
	resize(newW, newH) {
		const canvas = this.canvas;

		// Координаты левого верхнего угла canvas на странице
		const rect = canvas.getBoundingClientRect();
		const pageX = rect.left;
		const pageY = rect.top;

		// Сохраняем геометрические координаты, которые отображались в левом верхнем углу
		const Xvis = (0 - this.pxShift) / this.k;
		const Yvis = (0 - this.pyShift) / this.k;

		// Обновляем размеры
		this.Wv = newW;
		this.Hv = newH;

		// Пересчитываем масштаб по тем же правилам
		this.kOld = this.k;

		if (newW / (this.Xmax - this.Xmin + this.padding * 2) > newH / (this.Ymax - this.Ymin + this.padding * 2)) {
			this.k = newH / (this.Ymax - this.Ymin + this.padding * 2);
		} else {
			this.k = newW / (this.Xmax - this.Xmin + this.padding * 2);
		}

		// Пересчитываем смещение так, чтобы Xvis, Yvis остались на прежнем месте
		this.pxShift = -this.k * Xvis;
		this.pyShift = -this.k * Yvis;

		this.calcVisibleRanges();
        this.initScale();
	}
}
