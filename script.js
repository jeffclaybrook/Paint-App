const canvas = document.querySelector('canvas');
const toolBtns = document.querySelectorAll('.tool');
const fillColor = document.querySelector('#fill-color');
const sizeSlider = document.querySelector('#size-slider');
const colorBtns = document.querySelectorAll('.colors li');
const colorPicker = document.querySelector('#color-picker');
const clearCanvas = document.querySelector('#clear-canvas');
const saveCanvas = document.querySelector('#save-canvas');
const ctx = canvas.getContext('2d');

let prevCursorPoint;
let snapshot;
let isDrawing = false;
let selectedTool = 'brush';
let brushSize = 5;
let selectedColor = '#000';

const setCanvasBackground = () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0 , canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
}

window.addEventListener('load', () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight - 7;
    ctx.lineCap = 'round';
    setCanvasBackground();
})

const currentCursorPoint = e => {
    let x = 'ontouchstart' in window ? e.touches?.[0].pageX : e.offsetX;
    let y = 'ontouchstart' in window ? e.touches?.[0].pageY : e.offsetY;
    return { x, y };
}

const drawRect = position => {
    if (!fillColor.checked) {
        return ctx.strokeRect(position.x, position.y, prevCursorPoint.x - position.x, prevCursorPoint.y - position.y);
    }
    ctx.fillRect(position.x, position.y, prevCursorPoint.x - position.x, prevCursorPoint.y - position.y);
}

const drawCircle = position => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevCursorPoint.x - position.x), 2) + Math.pow((prevCursorPoint.y - position.y), 2));
    ctx.arc(prevCursorPoint.x, prevCursorPoint.y, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

const drawTriangle = position => {
    ctx.beginPath();
    ctx.moveTo(prevCursorPoint.x, prevCursorPoint.y);
    ctx.lineTo(position.x, position.y);
    ctx.lineTo(prevCursorPoint.x * 2 - position.x, position.y);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

const startDraw = e => {
    isDrawing = true;
    ctx.beginPath();
    prevCursorPoint = currentCursorPoint(e);
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

const drawing = e => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);
    let position = currentCursorPoint(e);
    if (selectedTool === 'brush' || selectedTool === 'eraser') {
        ctx.strokeStyle = selectedTool === 'eraser' ? '#fff' : selectedColor;
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
    } else if (selectedTool === 'rectangle') {
        drawRect(position);
    } else if (selectedTool === 'circle') {
        drawCircle(position);
    } else {
        drawTriangle(position);
    }
}

toolBtns.forEach(item => {
    item.addEventListener('click', () => {
        document.querySelector('li.active').classList.remove('active');
        item.classList.add('active');
        selectedTool = item.id;
    })
})

sizeSlider.addEventListener('change', () => brushSize = sizeSlider.value);

colorBtns.forEach(item => {
    item.addEventListener('click', () => {
        document.querySelector('.colors .selected').classList.remove('selected');
        item.classList.add('selected');
        selectedColor = window.getComputedStyle(item).getPropertyValue('background-color');
    })
})

clearCanvas.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
})

colorPicker.addEventListener('change', e => {
    colorPicker.parentElement.style.backgroundColor = e.target.value;
    colorPicker.parentElement.click();
})

saveCanvas.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
})

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('touchstart', startDraw);
canvas.addEventListener('mousemove', drawing);
canvas.addEventListener('touchmove', drawing);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);
canvas.addEventListener('touchend', () => isDrawing = false);