// function formatNumber(value) {
//     // Можно переключить этот режим через флаг 10e or SI mode
//     const useSI = true;

//     if (useSI) {
//         const SI = [
//             { value: 1e15, symbol: "P" },
//             { value: 1e12, symbol: "T" },
//             { value: 1e9, symbol: "G" },
//             { value: 1e6, symbol: "M" },
//             { value: 1e3, symbol: "k" },
//             { value: 1, symbol: "" },
//             { value: 1e-3, symbol: "m" },
//             { value: 1e-6, symbol: "µ" },
//             { value: 1e-9, symbol: "n" },
//             { value: 1e-12, symbol: "π" },
//             { value: 1e-15, symbol: "f" }
//         ];
//         for (let i = 0; i < SI.length; i++) {
//             if (Math.abs(value) >= SI[i].value) {
//                 return (value / SI[i].value).toFixed(2) + SI[i].symbol;
//             }
//         }
//         return value.toExponential(2);
//     } else {
//         return value.toExponential(2);
//     }
// }

const formatNumber = (() => {
    const useSI = true;
    const SI = [
        { value: 1e15, symbol: "P" },
        { value: 1e12, symbol: "T" },
        { value: 1e9, symbol: "G" },
        { value: 1e6, symbol: "M" },
        { value: 1e3, symbol: "k" },
        { value: 1, symbol: "" },
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

function drawGrid(ctx, transform) {
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
