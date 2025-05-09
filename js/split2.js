/**
 *  Usage:
 * 
 *  1. Create all divs autmatially (only parent div exists at the beginning. The nested areas and splitter between them will be created automatically)
 * 
 *          parent          ->      parent
 *                                      prevArea
 *                                      splitter
 *                                      nextArea
 * 
 *      const splitter = new Split2().split( parent, 'column', 0.5);
 *
 *  2. Add Splitter between exisiting areas (prevArea nextArea) nested in parent div  (already created and both are in parent (childs 0 and 1))
 *   
 *          parent          ->      parent
 *              prevArea                prevArea
 *              nextArea                splitter
 *                                      nextArea
 * 
 *      const splitter = new Split2().insertSplitter( parent 'column', 0.6);
 * 
 *  3. Configure exisiting divs: prevArea splitter nextArea (already created)
 * 
 *          parent          ->      parent
 *              prevArea                prevArea
 *              splitter                splitter                <---- divThatWillBeSplitter
 *              nextArea                nextArea
 * 
 *      new Split2().configureSplitter( divThatWillBeSplitter, 'row', 0.5);
 * 
 *  4. #TODO 
 * 
 *           parent          ->      parent
 *                                      prevArea
 *                                      splitter
 *                                      nextArea
 *                                      splitter
 *                                      nextArea
 *                                      splitter
 *                                      nextArea
 * 
 *      const splitter = new Split2().splitMultiple( parent, 'column', 3);      // 3 - num of splitters
 *  
 * 
 * 
 *  Flow:
 *      split( parent, 'column', 0.5);
 *          insertSplitter(parentDiv 'column', 0.6);
 *              configureSplitter( divThatWillBeSplitter, 'row', 0.5);
 *                  setSplitterDirection(this.splitter);    <-- Assign splitter width
 *                  #updateSibilingElements(this.splitter);
 *                      parentContentArea = this.#getContentArea(this.parent); 
 *                      prevMarginBox 
 *                      nextMarginBox 
 *                      splitterMarginBox 
 *                      gap                          //parent ComputedStyles.gap
 *                      areaPrevMinSize 
 *                      areaNextMinSize 
 * 
 * 
 * 
 */



const styleSplit2 = document.createElement('style');
styleSplit2.textContent = `
    
		/* height: calc(100% - 4px);
		width: calc(100% - 2px); */

    .area{
		box-sizing: border-box;
        display: flex;
        flex-grow:0;
        flex-direction: column; 
        min-width: 0; /* To do not exceed forced by nested*/
        min-height: 0; /* To do not exceed forced by nested*/
        overflow: auto;

        /*background-color: red;
        margin: 22px;
        border: solid 18px rgb(0, 170, 31);
        padding: 7px;
        gap:13px; */
    }


    .splitter{
		box-sizing: border-box;
        transition: background-color 0.3s ease;
        overflow: auto;
		flex-grow: 0;
		flex-shrink: 0;

        /* background-color: yellow;
        margin:7px;
        border: solid 23px rgb(0, 0, 0);
        padding: 7px;
		 width: 100px; */
    }


    .splitter:hover {
        background-color: #ddd;
    }

            
    .toolbar{
        display: flex;
        flex-grow: 0;
        flex-shrink: 0; 
        /* dfisplay: flex; */
        flex-direction: row; 
        flex-wrap: wrap;

        padding: 2px;
        gap: 2px;
    }
    .button{
        flex-grow: 0;
        flex-shrink: 1;
        display: inline;
        
        background-color: #007bff;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    .button:hover {
            background-color: #ddd;
    }

    /* Decoration */
    .embossed1, .toolbar, .splitter {
        background-color:        #eee;
        border-left:   1px solid #fff;
        border-top:    1px solid #fff;
        border-right:  1px solid #ddd;
        border-bottom: 1px solid #ddd;
    }
    .embossed2, .button{
        background-color:        #eee;
        border-left:   2px solid #fff;
        border-top:    2px solid #fff;
        border-right:  2px solid #ddd;
        border-bottom: 2px solid #ddd;
    } 

`;
document.head.appendChild(styleSplit2);


class Split2 {
    static splitterSize = 7
    static areaSizeMin = 5      // minimum area size ~5px depends from calc durinng rendering to to not exceed ranges of parent content area
    
    static areaCount = 0
    static splitterCount = 0

    splitNum = 1        // to controll is parent contain more than 1 splitter
    //Adjacent margin summary excluding areaPrev and areaNext
    sumAdjacentMarginWidth = 0
    sumAdjacentMarginHeight = 0
    //All margin summary
    sumMarginWidth = 0
    sumMarginHeight = 0

    x_start = 0
    y_start = 0
    resizableRect = 0       //first div will be resized by mouse move

    constructor() {
        this.mouseMove = this.mouseMove.bind(this);    // Привязываем контекст
        this.mouseUp = this.mouseUp.bind(this);
    }

    splitMultiple(parentDiv, direction = 'row', splitNum = 1){
        this.parent = parentDiv
        this.splitNum = splitNum
        this.parent.innerHTML = ''
        // Create fires area
        const prevArea = this.#createArea(parentDiv)
        this.parent.append(prevArea)

        const splitters = [];
        for (let i = 0; i < splitNum; i++) {
            const splitter = this.#createSplitter(parentDiv)

            this.parent.append(splitter, this.#createArea(parentDiv))

            const split2 = new Split2()
            split2.splitNum = splitNum

            splitters.push({obj:split2,splitter:splitter })
            //console.log(`position ${position}    split2.splitNum ${ split2.splitNum}`)
        }

        // After all divs added - configure splitters
        const position = 1/(1+splitNum)
        splitters.forEach(element => {
            element.obj.configureSplitter( element.splitter, direction, position)
        });

    }
    #createArea(parent){
        const area = document.createElement('div')
        area.classList.add('area');
        area.id = 'area_'+ Split2.areaCount + '-' + parent.id + '_splitNum_' + this.splitNum
        Split2.areaCount ++
        return area;
    }
    #createSplitter(parent){
        const splitter = document.createElement('div')
        splitter.classList.add('splitter')
        splitter.id = 'splitter_'+ Split2.splitterCount + '-' + parent.id + '_splitNum_' + this.splitNum
        Split2.splitterCount ++ 
        return splitter;
    }

    // Provided parentDiv containes 2 nothing
    split(parentDiv, direction = 'row', position = 0.5){
        this.parent = parentDiv
        this.parent.innerHTML = ''
        this.areaPrev = this.#createArea(parentDiv)
        this.areaNext = this.#createArea(parentDiv)

        this.parent.append(this.areaPrev, this.areaNext);

        return this.insertSplitter(parentDiv, direction, position)
    }

    // Provided parentDiv containes 2 areas
    insertSplitter(parentDiv, direction = 'row', position = 0.5) {

        this.parent = parentDiv;
        const childDivs = parentDiv.children;
        this.areaPrev = childDivs[0];
        this.areaNext = childDivs[1];

        this.parent.innerHTML = '';
        this.splitter = this.#createSplitter(parentDiv)

        this.parent.append(this.areaPrev, this.splitter, this.areaNext);

        this.configureSplitter(this.splitter, direction, position);
        return this.splitter;
    }

    configureSplitter(splitterDiv, direction = 'row', position = 0.5) {

        //For parent resize correction
        this.position = position;

        this.splitter = splitterDiv
        this.parent   = this.splitter.parentElement
        this.areaPrev = this.splitter.previousElementSibling
        this.areaNext = this.splitter.nextElementSibling
        const {parent:parent, areaPrev:areaPrev, splitter:splitter, areaNext:areaNext} = this


        parent.style.display = 'flex';
        parent.style.flexDirection = direction;
        this.setSplitterDirection(splitter);

        areaPrev.classList.add('area');
        splitter.classList.add('splitter');
        areaNext.classList.add('area');

        this.#updateSibilingElements(splitter);

        const{ parentContentArea:parentContentArea,prevMarginBox:prevMarginBox, splitterMarginBox:splitterMarginBox,  nextMarginBox:nextMarginBox, gap:gap, splitNum:splitNum, sumMarginWidth:sumMarginWidth, sumMarginHeight:sumMarginHeight} = this;

        let sizePrev = 0;
        let sizeNext = 0;

        if (direction === 'row') {
            
            if(splitNum > 1) {
                // If multiple splitters applied: distribute spcae equally
                sizePrev =  (parentContentArea.width - Split2.splitterSize * splitNum - gap * 2 * splitNum - sumMarginWidth)/(splitNum + 1)
                sizeNext = sizePrev
            }else{
                // If 1 splitters applied: distribute according to position proportions
                sizePrev = parentContentArea.width  * position       - prevMarginBox.sumMarginHorizontal - splitterMarginBox.width / 2 - gap
                sizeNext = parentContentArea.width  * (1 - position) - nextMarginBox.sumMarginHorizontal - splitterMarginBox.width / 2 - gap
            }


        } else if (direction === 'column') {
            if(splitNum > 1) {
                // If multiple splitters applied: distribute spcae equally
                sizePrev =  (parentContentArea.height - Split2.splitterSize * splitNum - gap * 2 * splitNum - sumMarginHeight)/(splitNum + 1)
                sizeNext = sizePrev
            }else{
                // If 1 splitters applied: distribute according to position proportions
                sizePrev = parentContentArea.height * position       - prevMarginBox.sumMarginVertical   - splitterMarginBox.height / 2 - gap
                sizeNext = parentContentArea.height * (1 - position) - nextMarginBox.sumMarginVertical   - splitterMarginBox.height / 2 - gap
            }
        }else {
            console.log(`(!)configureSplitter: Wrong direction type: ${direction}`);
        }
        areaPrev.style.flexGrow = 0;
        areaPrev.style.flex = `0 0 calc(${sizePrev}px)`;
        areaNext.style.flexGrow = 0;
        areaNext.style.flex = `0 0 calc(${sizeNext}px)`;
        
        this.addListeners(splitter);

        if (!this.resizeObserver) {
            this.resizeObserver = new ResizeObserver(() => {
                this.#adjustAreasOnResize();
            });
            this.resizeObserver.observe(this.parent);
        }
        
    }

    #adjustAreasOnResize() {
        this.#updateSibilingElements(this.splitter);
    
        const {
            parentContentArea,
            prevMarginBox,
            splitterMarginBox,
            nextMarginBox,
            gap,
            splitNum,
            sumMarginWidth,
            sumMarginHeight
        } = this;
    
        let sizePrev = 0;
        let sizeNext = 0;
    
        const direction = this.parent.style.flexDirection;
    
        if (direction === 'row') {
            if (splitNum > 1) {
                sizePrev = (parentContentArea.width - Split2.splitterSize * splitNum - gap * 2 * splitNum - sumMarginWidth) / (splitNum + 1);
                sizeNext = sizePrev;
            } else {
                sizePrev = parentContentArea.width * this.position - prevMarginBox.sumMarginHorizontal - splitterMarginBox.width / 2 - gap;
                sizeNext = parentContentArea.width * (1 - this.position) - nextMarginBox.sumMarginHorizontal - splitterMarginBox.width / 2 - gap;
            }
        } else if (direction === 'column') {
            if (splitNum > 1) {
                sizePrev = (parentContentArea.height - Split2.splitterSize * splitNum - gap * 2 * splitNum - sumMarginHeight) / (splitNum + 1);
                sizeNext = sizePrev;
            } else {
                sizePrev = parentContentArea.height * this.position - prevMarginBox.sumMarginVertical - splitterMarginBox.height / 2 - gap;
                sizeNext = parentContentArea.height * (1 - this.position) - nextMarginBox.sumMarginVertical - splitterMarginBox.height / 2 - gap;
            }
        }
    
        this.areaPrev.style.flex = `0 0 calc(${sizePrev}px)`;
        this.areaNext.style.flex = `0 0 calc(${sizeNext}px)`;
    }
    

    #getContentArea(element){
        const computedStyle = window.getComputedStyle(element);

        // Получение padding
        const paddingLeft = parseFloat(computedStyle.paddingLeft);
        const paddingRight = parseFloat(computedStyle.paddingRight);
        const paddingTop = parseFloat(computedStyle.paddingTop);
        const paddingBottom = parseFloat(computedStyle.paddingBottom);
        
        // Вычисление "чистой" ширины и высоты без padding
        const contentWidth = element.clientWidth - paddingLeft - paddingRight;
        const contentHeight = element.clientHeight - paddingTop - paddingBottom;
        
        return {
            width: contentWidth,
            height: contentHeight
        };
    }

    #getMarginBox(element) {
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);
    
        // Получение размеров margin
        const marginLeft = parseFloat(computedStyle.marginLeft);
        const marginRight = parseFloat(computedStyle.marginRight);
        const marginTop = parseFloat(computedStyle.marginTop);
        const marginBottom = parseFloat(computedStyle.marginBottom);
    
        // Вычисление полной ширины и высоты с учетом margin
        const marginHorizontal = marginLeft + marginRight;
        const marginVertical =  marginTop + marginBottom;

        const fullWidth = rect.width + marginHorizontal;
        const fullHeight = rect.height + marginVertical;
    
        return {
            width: fullWidth,
            height: fullHeight,
            sumMarginHorizontal : marginHorizontal,
            sumMarginVertical : marginVertical

        };
    }
    
    #updateSibilingElements(splitter){
        // Update element
        this.splitter = splitter
        this.parent   = splitter.parentElement
        this.areaPrev = splitter.previousElementSibling
        this.areaNext = splitter.nextElementSibling

        // Box sizes
        this.parentContentArea = this.#getContentArea(this.parent); 
        // console.log(`parentContentArea w: ${this.parentContentArea.width}  h: ${this.parentContentArea.height}`)
        this.prevMarginBox = this.#getMarginBox(this.areaPrev);     // prevMarginBox.sumMarginHorizontal prevMarginBox.sumMarginVertical
        this.nextMarginBox = this.#getMarginBox(this.areaNext);
        this.splitterMarginBox = this.#getMarginBox(this.splitter);
        //console.log(`update sib splitterMarginBox.width ${this.splitterMarginBox.width}`)

        // Debug
        // this.prevContentArea = this.#getContentArea(this.areaPrev); 
        // console.log(`prevContentArea   w: ${this.prevContentArea.width}  h: ${this.prevContentArea.height}`)
        // this.nextContentArea = this.#getContentArea(this.areaNext); 
        // console.log(`nextContentArea   w: ${this.nextContentArea.width}  h: ${this.nextContentArea.height}`)
        // this.splitContentArea = this.#getContentArea(this.splitter); 
        // console.log(`splitContentArea  w: ${this.splitContentArea.width}  h: ${this.splitContentArea.height}`)
        // Gap
        const parentComputedStyles = getComputedStyle(this.parent);
        this.gap = parseFloat(parentComputedStyles.gap) || 0;              //parentComputedStyles.gap; // Возвращает строку, например "10px"
        
        // Miniamal sizes
        this.areaPrevMinSize = this.#getMinSize(this.areaPrev)
        this.areaNextMinSize = this.#getMinSize(this.areaNext)

        //Calculate all others adjacent element margin box sum to limit resize
        this.sumAdjacentMarginWidth = 0
        this.sumAdjacentMarginHeight = 0
        //Only margin foa all nested elements
        this.sumMarginWidth = 0
        this.sumMarginHeight = 0
        Array.from(this.parent.children).forEach((child) => {

            const childMargingBox = this.#getMarginBox(child)
            this.sumMarginWidth += childMargingBox.sumMarginHorizontal
            //console.log(`${child.id} sumMarginHorizontal ${childMargingBox.sumMarginHorizontal}`)
            this.sumMarginHeight += childMargingBox.sumMarginVertical

            // Проверяем, не относится ли элемент к исключаемым
            if (child !== this.areaPrev && child !== this.areaNext){
                // Получаем ширину элемента, включая padding и border, но без margin
                const rect = child.getBoundingClientRect();
                const childMarginBox = this.#getMarginBox(child)
                this.sumAdjacentMarginWidth   += childMarginBox.width
                this.sumAdjacentMarginHeight  += childMarginBox.height
            }
        });
    }

    #getMinSize(element){
        const style = getComputedStyle(element);
        const width = parseFloat(style.borderLeftWidth) +
                         parseFloat(style.borderRightWidth) +
                         parseFloat(style.paddingLeft) +
                         parseFloat(style.paddingRight) +
                        (parseFloat(style.minWidth) || 0);
        const height = parseFloat(style.borderTopWidth) +
                        parseFloat(style.borderBottomWidth) +
                        parseFloat(style.paddingTop) +
                        parseFloat(style.paddingBottom) +
                       (parseFloat(style.minHeight) || 0);                        

        return {
            width  : width,
            height : height
        };                                
    }

    setSplitterDirection(splitter) {
        if (!splitter){ console.log('(!) splitter is null'); return;} 

        const parent = splitter.parentElement;
        if (parent.style.flexDirection === 'row') {
            splitter.classList = 'splitter' + ' ' + 'horizontal-splitter';
            splitter.style.width = Split2.splitterSize + 'px';
            splitter.style.cursor = 'ew-resize';
        } else if (parent.style.flexDirection === 'column') {
            splitter.classList = 'splitter' + ' ' + 'vertical-splitter';
            splitter.style.height = Split2.splitterSize + 'px';
            splitter.style.cursor = 'ns-resize';
        } else {
            console.log(`(!) SetSplitterDirection: Wrong direction type: ${parent.style.flexDirection}`);
        }
    }

    addListeners(splitter) {
        splitter.addEventListener('mousedown', (e) => {
            e.preventDefault();
    
            this.#updateSibilingElements(splitter);
            
            this.x_start = e.pageX; // Текущая координата мыши
            this.y_start = e.pageY; // Текущая координата мыши
            this.startWidth = this.areaPrev.getBoundingClientRect().width; // Текущая ширина области
            this.startHeight = this.areaPrev.getBoundingClientRect().height; // Текущая высота области
    
            window.addEventListener('mousemove', this.mouseMove);
            window.addEventListener('mouseup', this.mouseUp);
        });
    }

    mouseMove(e) {
        const {parent:parent, areaPrev:areaPrev, splitter:splitter, areaNext:areaNext, parentContentArea:parentContentArea, prevMarginBox:prevMarginBox, splitterMarginBox:splitterMarginBox, nextMarginBox:nextMarginBox, gap:gap, areaPrevMinSize:areaPrevMinSize, areaNextMinSize:areaNextMinSize, splitNum:splitNum, sumAdjacentMarginWidth:sumAdjacentMarginWidth, sumAdjacentMarginHeight:sumAdjacentMarginHeight} = this;

        if (parent.style.flexDirection === 'row') {
            const deltaX = e.pageX - this.x_start; // Разница положения мыши
            const newPrevWidth = this.startWidth + deltaX; // Новая ширина с учетом разницы

            //Worked Option when 1 splitter:
            if (newPrevWidth > areaPrevMinSize.width && newPrevWidth < parentContentArea.width - prevMarginBox.sumMarginHorizontal - 2 * gap * splitNum - sumAdjacentMarginWidth - nextMarginBox.sumMarginHorizontal - areaNextMinSize.width) {  
                // console.log(`apply ${newPrevWidth} sum ${prevMarginBox.sumMarginHorizontal + 2 * gap + splitterMarginBox.width + minWidthAreaNext} contentArea ${parentContentArea.width}`)
                this.areaPrev.style.flex = `0 0 ${newPrevWidth}px`; // Устанавливаем новую ширину
                this.areaNext.style.flex = `1 1 auto`; // Остаточная ширина
            }
        } else if (parent.style.flexDirection === 'column') {
            const deltaY = e.pageY - this.y_start; // Разница положения мыши
            const newPrevHeight = this.startHeight + deltaY; // Новая высота с учетом разницы
            
            //Worked Option when 1 splitter:
            if (newPrevHeight > areaPrevMinSize.height  && newPrevHeight < parentContentArea.height - prevMarginBox.sumMarginVertical - 2 * gap * splitNum - sumAdjacentMarginHeight - nextMarginBox.sumMarginVertical - areaNextMinSize.height) {  
                console.log(`apply ${newPrevHeight}`)
                this.areaPrev.style.flex = `0 0 ${newPrevHeight}px`; // Устанавливаем новую высоту
                this.areaNext.style.flex = `1 1 auto`; // Остаточная высота
            }
        } else {
            console.log(`(!) mouseMove: Wrong direction type: ${parent.style.flexDirection}`);
        }
    }
    
    mouseUp() {
        window.removeEventListener('mousemove', this.mouseMove); // Удаляем обработчики
        window.removeEventListener('mouseup', this.mouseUp);

        if (this.parent.style.flexDirection === 'row') {
            this.areaNext.style.flex = `0 0 ${this.areaNext.offsetWidth}px`; 
        } else if (this.parent.style.flexDirection === 'column') {
            this.areaNext.style.flex = `0 0 ${this.areaNext.offsetHeight}px`; 
        }
    }
}
