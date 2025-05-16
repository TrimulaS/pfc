// Finction to adopt grid values
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

// const formatNumber = (() => {
//     const useSI = true;
//     const SI = [
//         { value: 1e15, symbol: "P" },
//         { value: 1e12, symbol: "T" },
//         { value: 1e9, symbol: "G" },
//         { value: 1e6, symbol: "M" },
//         { value: 1e3, symbol: "k" },
//         { value: 1, symbol: "" },
//         { value: 1e-3, symbol: "m" },
//         { value: 1e-6, symbol: "µ" },
//         { value: 1e-9, symbol: "n" },
//         { value: 1e-12, symbol: "π" },
//         { value: 1e-15, symbol: "f" }
//     ];

//     const previous = new Map();

//     return function formatNumber(value) {
//         if (!isFinite(value)) return "NaN";
//         if (Math.abs(value) < 1e-16) return "0";

//         let absVal = Math.abs(value);
//         let suffix = "", scaled = value;

//         if (useSI) {
//             for (let i = 0; i < SI.length; i++) {
//                 if (absVal >= SI[i].value) {
//                     scaled = value / SI[i].value;
//                     suffix = SI[i].symbol;
//                     break;
//                 }
//             }
//         }

//         const key = suffix;
//         let precision = 2;
//         let formatted;

//         do {
//             formatted = scaled.toFixed(precision);

//             // Удалим только если после точки идут только нули
//             if (/\.0+$/.test(formatted)) {
//                 formatted = formatted.replace(/\.0+$/, "");
//             }

//             if (previous.get(key) !== formatted) {
//                 previous.set(key, formatted);
//                 break;
//             }

//             precision++;
//         } while (precision <= 10);

//         return formatted + suffix;
//     };
// })();

// function shortNum(num){
//     const SI = [
//         { value: 1e15, symbol: "P" },
//         { value: 1e12, symbol: "T" },
//         { value: 1e9,  symbol: "G" },
//         { value: 1e6,  symbol: "M" },
//         { value: 1e3,  symbol: "k" },
//         { value: 1,    symbol: ""  },
//         { value: 1e-3, symbol: "m" },
//         { value: 1e-6, symbol: "µ" },
//         { value: 1e-9, symbol: "n" },
//         { value: 1e-12,symbol: "π" },
//         { value: 1e-15,symbol: "f" }
//     ];

//     if (num === 0) return "0";

//     const absNum = Math.abs(num);
//     for (const { value, symbol } of SI) {
//         if (absNum >= value) {
//             const scaled = num / value;

//             // Сколько знаков после запятой нужно?
//             let digits = Math.abs(scaled) < 10 ? 1 : 0;
//             let str = scaled.toFixed(digits);

//             // Удаляем лишний ".0" в конце
//             if (str.endsWith('.0')) str = str.slice(0, -2);

//             return str + symbol;
//         }
//     }

//     // Если слишком малое число (меньше 1e-15)
//     return num.toExponential(1).replace(/\.0+/, '');
// }

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

// Function to add adopted grid
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
                // const getColor = (count) => {
                //     const ratio = count / maxCount;
                //     // От светло-голубого (низкий count) до индиго (высокий)
                //     const r = Math.floor(173 - 100 * ratio);
                //     const g = Math.floor(216 - 100 * ratio);
                //     const b = Math.floor(230 - 140 * ratio);
                //     console.log (`rgb(${r},${g},${b})`)
                //     return `rgb(${r},${g},${b})`;
                //     console.log ()
                // };

                const getColor = (count) => {
                const ratio = count / maxCount;

                // Светло-голубой → Индиго
                const r1 = 144, g1 = 213, b1 = 255; // minCount → светлый
                const r2 = 29,  g2 = 0,   b2 = 51;  // maxCount → индиго

                const r = Math.round(r1 + (r2 - r1) * ratio);
                const g = Math.round(g1 + (g2 - g1) * ratio);
                const b = Math.round(b1 + (b2 - b1) * ratio);

                return `rgb(${r},${g},${b})`;
            };

                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.lineWidth = 1;

                for (const { coord, count, px } of filtered) {
                    const color = getColor(count);
                    ctx.strokeStyle = color;
                    ctx.fillStyle = color;

                    // let shortCoord = shortNum(coord)
                    let shortCoord = formatNumber(coord)

                    if (isVertical) {
                        // горизонтальная линия
                        ctx.beginPath();
                        ctx.moveTo(0, px);
                        ctx.lineTo(canvas.width, px);
                        ctx.stroke();
                        ctx.fillText(shortCoord, 20, px - 5);                     //coord.toPrecision(3)
                        ctx.fillText(shortCoord, canvas.width - 20, px - 5);
                    } else {
                        // вертикальная линия
                        ctx.beginPath();
                        ctx.moveTo(px, 0);
                        ctx.lineTo(px, canvas.height);
                        ctx.stroke();
                        ctx.fillText(shortCoord, px, 10);                         //coord.toPrecision(3)
                        ctx.fillText(shortCoord, px, canvas.height - 10);
                    }
                }
            };
