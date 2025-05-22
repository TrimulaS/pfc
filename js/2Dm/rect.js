// Primitives

class Rectangle {
    /**
     * Конструктор поддерживает два варианта:
     * 1. Rectangle(left, top, width, height)
     * 2. Rectangle.fromLTRB(left, top, right, bottom)
     * 
     * Все размеры нормализуются: width/height всегда положительные
     */
    constructor(left, top, width, height) {
        if (width < 0) {
            left += width;
            width = -width;
        }
        if (height < 0) {
            top += height;
            height = -height;
        }

        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }

    // Альтернативный конструктор: принимает left, top, right, bottom
    static fromLTRB(left, top, right, bottom) {
        const width = right - left;
        const height = bottom - top;
        return new Rectangle(left, top, width, height);
    }

    // Вычисляемые свойства
    get right() {
        return this.left + this.width;
    }

    get bottom() {
        return this.top + this.height;
    }

    // Проверка, входит ли точка (x, y) в прямоугольник
    contains(x, y) {
        return (
            x >= this.left &&
            x <= this.right &&
            y >= this.top &&
            y <= this.bottom
        );
    }

    // Проверка совпадения области (размера и положения)
    equalsArea(other) {
        return (
            this.left === other.left &&
            this.top === other.top &&
            this.width === other.width &&
            this.height === other.height
        );
    }

    // Возвращает новый Rectangle, представляющий пересечение
    // Если пересечения нет — возвращает null
    intersection(other) {
        const x1 = Math.max(this.left, other.left);
        const y1 = Math.max(this.top, other.top);
        const x2 = Math.min(this.right, other.right);
        const y2 = Math.min(this.bottom, other.bottom);

        const w = x2 - x1;
        const h = y2 - y1;

        if (w <= 0 || h <= 0) {
            return null; // Нет пересечения
        }

        return new Rectangle(x1, y1, w, h);
    }
}
