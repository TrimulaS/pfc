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
