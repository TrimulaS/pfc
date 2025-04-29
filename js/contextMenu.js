// //Usage
// const contextMenu = new ContextMenuSplit();
// contextMenu.addTo(component);
// contextMenu.splitHorizontal.addEventListener('click', () => {           // Legacy     document.getElementById('splitHorizontal').addEventListener('click', () => {
//     const targetDiv = contextMenu.menu.targetDiv;
//     if (targetDiv) splitDiv(targetDiv, 'horizontal');
//     contextMenu.hideContextMenu();
// });

// contextMenu.splitVertical.addEventListener('click', () => {           // Legacy     document.getElementById('splitHorizontal').addEventListener('click', () => {
//     const targetDiv = contextMenu.menu.targetDiv;
//     if (targetDiv) splitDiv(targetDiv, 'vertical');
//     contextMenu.hideContextMenu();
// });

// contextMenu.deleteArea.addEventListener('click', () => {       //document.getElementById('splitVertical').addEventListener('click', () => {
//     const targetDiv = contextMenu.menu.targetDiv;
//     if (targetDiv) console.log('delete current area ' + targetDiv.id);
//     contextMenu.hideContextMenu();
// });



class ContextMenuSplit{


    createContextMenu(){
        let spinnerContainer = document.createElement('div');
        let spinnerLabel = document.createElement('label');
        spinnerLabel.textContent = 'Spinner: ';
        this.spinner = document.createElement('input');
        this.spinner.id = 'spinner';
        this.spinner.type = 'number';
        this.spinner.min = '2';
        this.spinner.max = '10';
        this.spinner.value = '2';
        spinnerContainer.appendChild(spinnerLabel);
        spinnerContainer.appendChild(this.spinner);
    
        let contextMenu = document.createElement('ul');
        contextMenu.id = 'contextMenu';
        contextMenu.classList.add('context-menu');
        
        this.splitHorizontal = document.createElement('li');                    // Entry point to assign listener
        //splitHorizontal.id = 'splitHorizontal';
        this.splitHorizontal.textContent = " |  Разделить горизонтально";
        
        this.splitVertical = document.createElement('li');                       // Entry point to assign listener
        //splitVertical.id = 'splitVertical';
        this.splitVertical.textContent = ' ⎯  Разделить вертикально';
    
        let separator = document.createElement('hr');
        contextMenu.appendChild(separator); // Вставить разделитель
    
    
        this.deleteArea = document.createElement('li');
        //deleteArea.id = 'deleteArea';
        this.deleteArea.textContent = 'Delete area';
    
        contextMenu.append(spinnerContainer, this.splitHorizontal, this.splitVertical, separator, this.deleteArea);
    
        let propertiesMenu = [
            { id: 'leftPlus',    text: 'Left +10', prop: 'left', delta: 10 },
            { id: 'leftMinus',   text: 'Left -10', prop: 'left', delta: -10 },
            { id: 'topPlus' ,    text: 'Top +10', prop: 'top', delta: 10 },
            { id: 'topMinus',    text: 'Top -10', prop: 'top', delta: -10 },
            { id: 'widthPlus' ,  text: 'Width +10', prop: 'width', delta: 10 },
            { id: 'widthMinus',  text: 'Width -10', prop: 'width', delta: -10 },
            { id: 'heightPlus' , text: 'Height +10', prop: 'height', delta: 10 },
            { id: 'heightMinus', text: 'Height -10', prop: 'height', delta: -10 },
            { id: 'xPlus',       text: 'Z + 1', prop: 'z-index', delta: 1 },
            { id: 'xMinus',      text: 'Z - 1', prop: 'z-index', delta: -1 },
        ];
        
        propertiesMenu.forEach(item => {
            let btn = document.createElement('li');
            btn.id = item.id;
            btn.textContent = item.text;
            btn.addEventListener('click', () => {
                let targetDiv = contextMenu.targetDiv;
                let currentVal;
        
                if (item.prop === 'z-index') {
                    // Если z-index не задан, установим значение по умолчанию 0
                    currentVal = parseInt(window.getComputedStyle(targetDiv).getPropertyValue(item.prop)) || 0;
                } else {
                    currentVal = parseInt(window.getComputedStyle(targetDiv).getPropertyValue(item.prop).replace('px', '')) || 0;
                }
        
                targetDiv.style[item.prop] = item.prop === 'z-index' 
                    ? `${currentVal + item.delta}`  // z-index не нуждается в "px"
                    : `${currentVal + item.delta}px`;  // Для других свойств добавляем "px"
    
                console.log(currentVal + ' - ' + item.prop + ' - ' + (currentVal + item.delta));
            });
            contextMenu.appendChild(btn);
        });
        document.body.appendChild(contextMenu);
        return contextMenu;
    }

    addListenres(){
        document.addEventListener('click', () => {
            // Проверяем, если клик был вне contextMenu
            if (!this.menu.contains(event.target)) {
                this.hideContextMenu();
            }
        });
    }
    
    addTo(component){
        component.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e);
        });

    }
    // отображение контекстного меню
    showContextMenu(e) {
        this.menu.style.left = `${e.pageX}px`;
        this.menu.style.top = `${e.pageY}px`;
        this.menu.style.display = 'block';
        this.menu.targetDiv = e.target; // Запоминаем div, на котором вызвано меню It is new inseted field
    }

    // Скрытие контекстного меню
        hideContextMenu() {
        this.menu.style.display = 'none';
    }
    constructor(){
        this.menu = this.createContextMenu();
        
        this.addListenres();
    }
}

