document.onload = refreshGame()

const numbers = [
    'empty',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
];

const rightClickOptions = [
    'flag',
    'question',
    '',
];

const gameEnding = document.querySelector('.cover');

const firstTimer = document.querySelector('.timer__first');
const secondTimer = document.querySelector('.timer__second');
const thirdTimer = document.querySelector('.timer__third');

const firstMinesTab = document.querySelector('.counter__first');
const secondMinesTab = document.querySelector('.counter__second');
const thirdMinesTab = document.querySelector('.counter__third');

const defaultTimerClass = 'header__timer__number';

// Активирована ли хотя бы одна бомба
let isMineClicked = false;

// Количество мин
const MINES_COUNT = 40;

let sec = 0;
let tenSec = 0;
let minSec = 0;
let TIMER_DELAY = 1000;

// Функция таймера
function fieldTimer() {
        sec++;
        thirdTimer.className = `header__timer__number timer__first num${sec}`;

        if (sec === 10) {
            thirdTimer.className = `header__timer__number timer__first num0`;
        };

        if (sec > 9) {
            sec = 0;
            tenSec++;
            secondTimer.className = `header__timer__number timer__second num${tenSec}`;
        };

        if (tenSec === 10) {
            secondTimer.className = `header__timer__number timer__first num0`;
        };

        if (tenSec > 9) {
            tenSec = 0;
            minSec++;
            firstTimer.className = `header__timer__number timer__first num${minSec}`;
        };

        if (minSec > 9) {
            clearInterval(mainTimer);
            sec = 0;
            tenSec = 0;
            minSec = 0;
            firstTimer.className = 'header__timer__number timer__first num0';
            secondTimer.className = 'header__timer__number timer__second num0';
            thirdTimer.className = 'header__timer__number timer__third num0';
        };
};

let mainTimer;

let noMoreFlags = 40;
let flagsCounter = 0;

// Сетчик мин
function minesCounter() {
    let secondMines = Math.floor((noMoreFlags - flagsCounter) / 10);
    let thirdMines =  Math.round((((noMoreFlags - flagsCounter) / 10) - Math.floor((noMoreFlags - flagsCounter) / 10)) * 10)
    secondMinesTab.className = `header__counter__number counter__second num${secondMines}`;
    thirdMinesTab.className = `header__counter__number counter__third num${thirdMines}`;
};

// :) 
const refreshSmile = document.querySelector('.header__smile');

// Смайлик нажат
refreshSmile.addEventListener('mousedown', () => {
    refreshSmile.classList.add('clicked');
});

let counterForTimer = 0;

// Мышка отпущена - смайлик спокоен
document.addEventListener('mouseup', (evt) => {
    refreshSmile.classList.remove('worried');
});

// По клику на смайлик перезагружаем игру
refreshSmile.addEventListener('click', function() {
    refreshGame();
    refreshSmile.className = 'header__smile';
    clearInterval(mainTimer)
    sec = 0;
    tenSec = 0;
    minSec = 0;
    firstTimer.className = 'header__timer__number timer__first num0';
    secondTimer.className = 'header__timer__number timer__second num0';
    thirdTimer.className = 'header__timer__number timer__third num0';
    counterForTimer = 0;
    secondMines = 0;
    gameEnding.style.zIndex = -1;
});

// Перезагрузка игры
function refreshGame() {
    startGame(16, 16, 40);
};

function startGame(WIDTH, HEIGHT, MINES_COUNT) {
    // Поле
    const fieldTemplate = document.querySelector('.main__mines');

    // Количество ячеек
    const howMuchCeils = WIDTH * HEIGHT;

    fieldTemplate.addEventListener('click', () => {
        counterForTimer >= 2 ? counterForTimer = 2 : counterForTimer++;
    })

    // Добавляем ячейки
    fieldTemplate.innerHTML = `<div class="ceil"></div>`.repeat(howMuchCeils);

    // Получаем массив ячеек
    const ceils = [...fieldTemplate.children];

    for (let c = 0; c < ceils.length; c++) {

        // Нажатие на ячейку пугает смайлик
        ceils[c].addEventListener('mousedown', (evt) => {
            if (evt.target.className === 'ceil') {
                refreshSmile.classList.add('worried');
            };
        });

        // Правой кнопкой меняем флаг-вопрос-пустая
        ceils[c].addEventListener('contextmenu', (evt) => {
            evt.preventDefault();
                if (evt.target.classList.contains('flag')) {
                    evt.target.classList.remove('flag');
                    evt.target.classList.add('question');
                }
                else if (evt.target.classList.contains('question')) {
                    evt.target.classList.remove('question');
                    evt.target.classList.remove('flag');
                    flagsCounter--;
                    minesCounter();
                }
                else {
                    evt.target.classList.add('flag');
                    flagsCounter++;
                    minesCounter();
                };
            
        });
    };

    // Количество оствашихся ячеек
    let closedCount = howMuchCeils;

    // Отделяем и перемешиваем бомбы
    const mines = [...Array(howMuchCeils).keys()]
                .sort(() => Math.random() - 0.5)
                .slice(0, MINES_COUNT);

    // Показываем сколько мин вокруг ячейки
    function open(row, col) {
        if (!isValid(row, col)) return;

        const index = row * WIDTH + col;
        const ceil = ceils[index];

        // Если ячейка открыта - больше не открываем другие по клику на нее
        if (ceil.disabled === true) return;
        ceil.disabled = true; 

        // Нажатие на бомбу
        if (isCeilMine(row, col)) {
            ceil.className = 'ceil mine';
            isMineClicked = true;
            return;
        };

        // Снижаем количество закрытых ячеек
        closedCount--;
        if (closedCount <= MINES_COUNT && !isMineClicked) {
            refreshSmile.className = 'header__smile cool';
        };

        // Открываем соседние ячейки если нажатая - пустая
        const count = getCount(row, col)[1];
        
        // Окрываем рядомстоящие при нажатии на пустую
        if (count !== 0) {
            ceil.className = `ceil ${getCount(row, col)[0]}`;
            return;
        };

        // Открываем рядомстоящие пустые
        ceil.className = 'ceil empty';

        // Проходимся по соседним у пустой ячейки и открываем их
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                open(row + y, col + x);             
            };
        };
    };

    // Адекватность поля
    function isValid(row, col) {
        return row >= 0
               && row < HEIGHT
               && col >= 0
               && col < WIDTH;  
    };

    // Получаем значение ячейки в зависимости от количества мин вокруг
    function getCount(row, col) {
        let count = 0;
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (isCeilMine(row + y, col + x)) {
                    count++;
                };
            };
        };
        return [numbers[count], count];
    };

    // Открываем ячейку по клику
    fieldTemplate.addEventListener('click', (evt) => {
            if (!evt.target.classList.contains('ceil')) {
                    return;
            };
            const index = ceils.indexOf(evt.target);
            const col = index % WIDTH;
            const row = Math.floor((index - col) / WIDTH);

            if (!evt.target.classList.contains('flag') && !evt.target.classList.contains('question')) {
                open(row, col);
                minesCounter();
            };

            if (counterForTimer === 1) {
                mainTimer = setInterval(fieldTimer, TIMER_DELAY);
            }

            // Показываем мины при проигрыше
            if (evt.target.classList.contains('mine')) {
                refreshSmile.className = 'header__smile died';
                evt.target.className = 'ceil exploded';
                clearInterval(mainTimer);
                for (let i = 0; i < 16; i++) {
                    for (let j = 0; j < 16; j++) {
                        if (isCeilMine(i, j)) {
                        open(i, j);
                        gameEnding.style.zIndex = 1;
                        };
                    };
                };
            };
    });
 
    // Проверка ячейки на мину
    function isCeilMine(row, col) {
        if (!isValid(row, col)) return false;
        const mineIndex = WIDTH * row + col;
        return mines.includes(mineIndex);
    };
};
