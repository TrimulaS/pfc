/**
 *      Grids, Number formats, color
 * 
 */


//------------------------------------------------------------------------------- Finction to adopt grid values
const formatNumber = (() => {
    const useSI = true;
    const SI = [
        { value: 1e15, symbol: "P" },
        { value: 1e12, symbol: "T" },
        { value: 1e9, symbol: "G" },
        { value: 1e6, symbol: "M" },
        { value: 1e3, symbol: "k" },
        { value: 1,     symbol: "" },
        { value: 1e-3, symbol: "m" },
        { value: 1e-6, symbol: "µ" },
        { value: 1e-9, symbol: "n" },
        { value: 1e-12, symbol: "π" },
        { value: 1e-15, symbol: "f" }
    ];

    const previous = new Map(); // хранит последний формат по "категории"

    return function formatNumber(value) {
        if (!isFinite(value)) return "NaN";

        let absVal = Math.abs(value);
        let suffix = "", scaled = value;

        if (useSI) {
            for (let i = 0; i < SI.length; i++) {
                if (absVal >= SI[i].value) {
                    scaled = value / SI[i].value;
                    suffix = SI[i].symbol;
                    break;
                }
            }
        }

        const key = suffix;
        let precision = 2;
        let formatted;

        do {
            formatted = scaled.toFixed(precision).replace(/\.?0+$/, "");
            if (previous.get(key) !== formatted) {
                previous.set(key, formatted);
                break;
            }
            precision++;
        } while (precision <= 10); // ограничим макс. точность

        return formatted + suffix;
    };
})();


//------------------------------------------------------------------------------- Draw standard x10 grid
function drawGrid_x10(ctx, transform) {
    const canvas = transform.canvas;
    const maxXTicks = 20;
    const maxYTicks = 15;
    const margin = 2; // отступы в пикселях

    const xToPx = x => transform.xToPx(x);
    const yToPy = y => transform.yToPy(y);
    const PxToX = px => transform.PxToX(px);
    const PyToY = py => transform.PyToY(py);

    const xStart = PxToX(0);
    const xEnd = PxToX(canvas.width);
    const yStart = PyToY(0); // верх                 //PyToY(canvas.height);
    const yEnd = PyToY(canvas.height); // низ       //yEnd = PyToY(0);

    function getStep(range, maxTicks) {
        const roughStep = range / maxTicks;
        const pow10 = Math.pow(10, Math.floor(Math.log10(roughStep)));
        const steps = [1, 2, 5, 10];
        for (let s of steps) {
            if (s * pow10 >= roughStep) return s * pow10;
        }
        return 10 * pow10;
    }

    const xStep = getStep(xEnd - xStart, maxXTicks);
    const yStep = getStep(yEnd - yStart, maxYTicks);

    const xFirst = Math.ceil(xStart / xStep) * xStep;
    const yFirst = Math.ceil(yStart / yStep) * yStep;

    ctx.save();
    ctx.strokeStyle = '#ccc';
    ctx.fillStyle = '#000';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // === Вертикальные линии и подписи (по X) ===
    for (let x = xFirst; x <= xEnd; x += xStep) {
        const px = xToPx(x);
        if (px < 0 || px > canvas.width) continue;
        const label = formatNumber(x);

        // Линия по всему viewport сверху вниз
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, canvas.height);
        ctx.stroke();

        // Верхняя подпись
        ctx.textBaseline = 'top';
        ctx.fillText(label, px, margin);

        // Нижняя подпись
        ctx.textBaseline = 'bottom';
        ctx.fillText(label, px, canvas.height - margin);
    }

    // === Горизонтальные линии и подписи (по Y) ===
    for (let y = yFirst; y <= yEnd; y += yStep) {
        const py = yToPy(y);
        if (py < 0 || py > canvas.height) continue;
        const label = formatNumber(y);

        // Линия по всему viewport слева направо
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(canvas.width, py);
        ctx.stroke();

        // Левая подпись
        ctx.textAlign = 'left';
        ctx.fillText(label, margin, py);

        // Правая подпись
        ctx.textAlign = 'right';
        ctx.fillText(label, canvas.width - margin, py);
    }

    ctx.restore();
}

//------------------------------------------------------------------------------- Function to add adopted grid
 // Функция для отображения делений
const drawAdoptedGrid = (map, ctx, transform, isVertical) => {
    

    // Сортируем по координате
    const entries = Array.from(map.entries()).sort((a, b) => a[0] - b[0]);

    // Отфильтровываем, чтобы было не более 50 делений и не налезали подписи
    const maxLabels = 50;
    const filtered = [];
    const minSpacing = (isVertical ? canvas.height : canvas.width) / maxLabels;

    let lastPx = -Infinity;
    for (const [coord, count] of entries) {
        const px = isVertical ? transform.yToPy(coord) : transform.xToPx(coord);
        if (Math.abs(px - lastPx) >= minSpacing) {
            filtered.push({ coord, count, px });
            lastPx = px;
        }
    }

    const maxCount = Math.max(...filtered.map(f => f.count), 1);

    const getColor = (count) => {
    const ratio = count / maxCount;

    // Светло-голубой → Индиго
    const r1 = 144, g1 = 213, b1 = 255; // minCount → светлый
    const r2 = 29,  g2 = 0,   b2 = 100;  // maxCount → индиго

    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);

    return `rgb(${r},${g},${b})`;
};

    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    //ctx.textAlign === 'start'
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 1;

    const textHeight = parseInt(ctx.font, 10);
    const textOffset = 5

    for (const { coord, count, px } of filtered) {
        const color = getColor(count);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        
        // Coordinate text
        let shortCoord = formatNumber(coord)
        const textWidth = ctx.measureText(shortCoord).width;

        if (isVertical) {
            // горизонтальная линия
            ctx.beginPath();
            ctx.moveTo(textOffset*2 + textWidth, px);
            ctx.lineTo(canvas.width - textOffset*2 - textWidth, px);
            ctx.stroke();
            ctx.fillText(shortCoord, textOffset + textWidth/2, px );                      //Left label             coord.toPrecision(3)
            ctx.fillText(shortCoord, canvas.width - textWidth/2 - textOffset, px);   //Right Label
        } else {
            // вертикальная линия
            ctx.beginPath();
            ctx.moveTo(px, 0 + 1.5 * textHeight + textOffset);
            ctx.lineTo(px, canvas.height - 1.5 * textHeight - textOffset);
            ctx.stroke();
            ctx.fillText(shortCoord, px, textOffset + textHeight/2);                         //coord.toPrecision(3)
            ctx.fillText(shortCoord, px, canvas.height - textOffset - textHeight/2);
        }
    }
};



//------------------------------------------------------------------------------- Gradient Color

function getColorfulContrastingTextColor(color, background = "rgb(255,255,255)") {
	// === Parse RGBA ===
	const rgbaMatch = color.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\s*\)$/i);
	if (!rgbaMatch) return "black";

	let r = parseInt(rgbaMatch[1]);
	let g = parseInt(rgbaMatch[2]);
	let b = parseInt(rgbaMatch[3]);
	const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1.0;

	// === Parse Background RGB ===
	const bgMatch = background.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/i);
	const br = bgMatch ? parseInt(bgMatch[1]) : 255;
	const bg = bgMatch ? parseInt(bgMatch[2]) : 255;
	const bb = bgMatch ? parseInt(bgMatch[3]) : 255;

	// === Blend with background ===
	r = Math.round(r * a + br * (1 - a));
	g = Math.round(g * a + bg * (1 - a));
	b = Math.round(b * a + bb * (1 - a));

	// === RGB → HSL ===
	const [h, s, l] = rgbToHsl(r, g, b);

	// === Compute contrasting hue ===
	let contrastHue = (h + 180) % 360;
	// Slight hue variation to avoid direct inversion
	if (Math.abs(h - contrastHue) < 20) contrastHue = (h + 150) % 360;

	// Invert lightness for contrast
	const contrastLightness = l > 0.5 ? 0.15 : 0.85;

	// === HSL → RGB ===
	const [cr, cg, cb] = hslToRgb(contrastHue, 0.9, contrastLightness); // high saturation

	return `rgb(${cr}, ${cg}, ${cb})`;
}


function rgbToHsl(r, g, b) {
	r /= 255; g /= 255; b /= 255;
	const max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h, s, l = (max + min) / 2;

	if (max === min) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h *= 60;
	}
	return [h, s, l];
}

function hslToRgb(h, s, l) {
	h /= 360;

	let r, g, b;

	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		const hue2rgb = (p, q, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1/6) return p + (q - p) * 6 * t;
			if (t < 1/2) return q;
			if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;

		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
