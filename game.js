class BlockdokuGame {
    constructor() {
        this.board = Array(9).fill().map(() => Array(9).fill(false));
        this.score = 0;
        this.bestScore = localStorage.getItem('blockdoku-best-score') || 0;
        this.currentPieces = [];
        this.gameRunning = true;
        this.selectedPiece = null;
        this.draggedPiece = null;
        this.dragGhost = null; // Призрачная копия фигуры для анимации
        
        this.init();
    }

    init() {
        this.createGameBoard();
        this.generateNewPieces();
        this.updateScore();
        this.setupEventListeners();
    }

    createGameBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                gameBoard.appendChild(cell);
            }
        }
    }

    // Определение различных фигур Blockdoku
    getPieceShapes() {
        return [
            // Одиночный блок
            [[1]],
            
            // Двойные блоки
            [[1, 1]],
            [[1], [1]],
            
            // Тройные блоки
            [[1, 1, 1]],
            [[1], [1], [1]],
            
            // L-фигуры
            [[1, 0], [1, 1]],
            [[1, 1], [1, 0]],
            [[1, 1], [0, 1]],
            [[0, 1], [1, 1]],
            
            // Большие L-фигуры
            [[1, 0, 0], [1, 1, 1]],
            [[0, 0, 1], [1, 1, 1]],
            [[1, 1, 1], [1, 0, 0]],
            [[1, 1, 1], [0, 0, 1]],
            
            // Квадраты
            [[1, 1], [1, 1]],
            [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
            
            // T-фигуры
            [[1, 1, 1], [0, 1, 0]],
            [[0, 1], [1, 1], [0, 1]],
            [[0, 1, 0], [1, 1, 1]],
            [[1, 0], [1, 1], [1, 0]],
            
            // Z-фигуры
            [[1, 1, 0], [0, 1, 1]],
            [[0, 1, 1], [1, 1, 0]],
            [[1, 0], [1, 1], [0, 1]],
            [[0, 1], [1, 1], [1, 0]],
            
            // Длинные блоки
            [[1, 1, 1, 1]],
            [[1], [1], [1], [1]],
            
            // Диагональные
            [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
            [[0, 0, 1], [0, 1, 0], [1, 0, 0]]
        ];
    }

    generateNewPieces() {
        const shapes = this.getPieceShapes();
        this.currentPieces = [];
        
        for (let i = 0; i < 3; i++) {
            const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
            this.currentPieces.push({
                shape: randomShape,
                id: i,
                placed: false
            });
        }
        
        this.renderPieces();
        this.checkGameOver();
    }

    renderPieces() {
        for (let i = 0; i < 3; i++) {
            const piece = this.currentPieces[i];
            const slot = document.getElementById(`piece-${i + 1}`);
            
            if (piece.placed) {
                slot.innerHTML = '';
                continue;
            }
            
            const pieceElement = this.createPieceElement(piece.shape, i);
            slot.innerHTML = '';
            slot.appendChild(pieceElement);
        }
    }

    createPieceElement(shape, pieceId) {
        const piece = document.createElement('div');
        piece.className = 'piece';
        piece.dataset.pieceId = pieceId;
        piece.style.gridTemplateColumns = `repeat(${shape[0].length}, 1fr)`;
        piece.style.gridTemplateRows = `repeat(${shape.length}, 1fr)`;
        
        // Создаем все ячейки в правильном порядке, включая пустые
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                const cell = document.createElement('div');
                if (shape[row][col]) {
                    cell.className = 'piece-cell';
                } else {
                    cell.className = 'piece-cell-empty';
                }
                piece.appendChild(cell);
            }
        }
        
        return piece;
    }

    // Создание призрачной копии фигуры
    createDragGhost(shape) {
        const ghost = document.createElement('div');
        ghost.className = 'drag-ghost';
        ghost.style.gridTemplateColumns = `repeat(${shape[0].length}, 1fr)`;
        ghost.style.gridTemplateRows = `repeat(${shape.length}, 1fr)`;
        
        // Создаем ячейки призрачной копии
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                const cell = document.createElement('div');
                if (shape[row][col]) {
                    cell.className = 'piece-cell';
                } else {
                    cell.className = 'piece-cell-empty';
                }
                ghost.appendChild(cell);
            }
        }
        
        document.body.appendChild(ghost);
        return ghost;
    }

    // Обновление позиции призрачной копии
    updateDragGhost(x, y) {
        if (this.dragGhost) {
            this.dragGhost.style.left = x + 'px';
            this.dragGhost.style.top = y + 'px';
        }
    }

    // Удаление призрачной копии
    removeDragGhost() {
        if (this.dragGhost) {
            document.body.removeChild(this.dragGhost);
            this.dragGhost = null;
        }
    }

    setupEventListeners() {
        // События для мобильных устройств и десктопа
        document.addEventListener('mousedown', this.handlePointerDown.bind(this));
        document.addEventListener('mousemove', this.handlePointerMove.bind(this));
        document.addEventListener('mouseup', this.handlePointerUp.bind(this));
        
        // Touch события с preventDefault для мини-приложений
        document.addEventListener('touchstart', this.handlePointerDown.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handlePointerMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handlePointerUp.bind(this), { passive: false });
        
        // Дополнительная блокировка скролла для Telegram Web App
        document.addEventListener('touchmove', this.preventDefaultTouchMove.bind(this), { passive: false });
        document.addEventListener('gesturestart', this.preventGestures.bind(this));
        document.addEventListener('gesturechange', this.preventGestures.bind(this));
        document.addEventListener('gestureend', this.preventGestures.bind(this));
        
        // Кнопки управления
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
    }

    preventDefaultTouchMove(e) {
        // Блокируем скролл при драге фигур
        if (this.selectedPiece !== null || e.target.closest('.piece') || e.target.closest('.game-board')) {
            e.preventDefault();
        }
    }

    preventGestures(e) {
        // Блокируем жесты масштабирования
        e.preventDefault();
    }

    handlePointerDown(e) {
        // Всегда блокируем события при касании элементов игры
        if (e.target.closest('.piece') || e.target.closest('.game-board')) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        const target = e.target.closest('.piece');
        if (target && !this.currentPieces[target.dataset.pieceId].placed) {
            this.selectedPiece = parseInt(target.dataset.pieceId);
            this.draggedPiece = target;
            target.classList.add('dragging');
            
            // Создаем призрачную копию фигуры
            const piece = this.currentPieces[this.selectedPiece];
            this.dragGhost = this.createDragGhost(piece.shape);
            
            // Устанавливаем начальную позицию призрачной копии
            const touch = e.touches ? e.touches[0] : e;
            this.updateDragGhost(touch.clientX, touch.clientY);
            
            // Haptic feedback для Telegram
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        }
    }

    handlePointerMove(e) {
        // Блокируем скролл при перетаскивании
        if (this.selectedPiece !== null || e.target.closest('.piece') || e.target.closest('.game-board')) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (this.selectedPiece !== null && this.draggedPiece) {
            const touch = e.touches ? e.touches[0] : e;
            
            // Обновляем позицию призрачной копии
            this.updateDragGhost(touch.clientX, touch.clientY);
            
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const cell = elementBelow?.closest('.cell');
            
            // Убираем превью с предыдущих клеток
            document.querySelectorAll('.cell.preview').forEach(c => c.classList.remove('preview', 'invalid'));
            
            if (cell) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                this.showPreview(row, col, this.selectedPiece);
            }
        }
    }

    handlePointerUp(e) {
        // Блокируем события на элементах игры
        if (this.selectedPiece !== null || e.target.closest('.piece') || e.target.closest('.game-board')) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (this.selectedPiece !== null) {
            const touch = e.changedTouches ? e.changedTouches[0] : e;
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const cell = elementBelow?.closest('.cell');
            
            let placed = false;
            if (cell) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                placed = this.placePiece(row, col, this.selectedPiece);
            }
            
            // Haptic feedback для Telegram
            if (window.Telegram?.WebApp?.HapticFeedback) {
                if (placed) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                } else {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
            }
            
            // Очистка превью и состояния
            document.querySelectorAll('.cell.preview, .cell.invalid').forEach(c => {
                c.classList.remove('preview', 'invalid');
            });
            
            if (this.draggedPiece) {
                this.draggedPiece.classList.remove('dragging');
            }
            
            // Удаляем призрачную копию
            this.removeDragGhost();
            
            this.selectedPiece = null;
            this.draggedPiece = null;
        }
    }

    showPreview(startRow, startCol, pieceId) {
        const piece = this.currentPieces[pieceId];
        if (!piece || piece.placed) return;
        
        const shape = piece.shape;
        const canPlace = this.canPlacePiece(startRow, startCol, shape);
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardRow = startRow + row;
                    const boardCol = startCol + col;
                    
                    if (boardRow >= 0 && boardRow < 9 && boardCol >= 0 && boardCol < 9) {
                        const cell = document.querySelector(`[data-row="${boardRow}"][data-col="${boardCol}"]`);
                        if (cell) {
                            cell.classList.add(canPlace ? 'preview' : 'invalid');
                        }
                    }
                }
            }
        }
    }

    canPlacePiece(startRow, startCol, shape) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardRow = startRow + row;
                    const boardCol = startCol + col;
                    
                    if (boardRow < 0 || boardRow >= 9 || boardCol < 0 || boardCol >= 9) {
                        return false;
                    }
                    
                    if (this.board[boardRow][boardCol]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    placePiece(startRow, startCol, pieceId) {
        const piece = this.currentPieces[pieceId];
        if (!piece || piece.placed) return false;
        
        const shape = piece.shape;
        if (!this.canPlacePiece(startRow, startCol, shape)) return false;
        
        // Размещаем фигуру на доске
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardRow = startRow + row;
                    const boardCol = startCol + col;
                    this.board[boardRow][boardCol] = true;
                    
                    const cell = document.querySelector(`[data-row="${boardRow}"][data-col="${boardCol}"]`);
                    if (cell) {
                        cell.classList.add('filled');
                    }
                }
            }
        }
        
        // Отмечаем фигуру как размещенную
        piece.placed = true;
        this.renderPieces();
        
        // Добавляем очки за размещение
        this.score += this.calculatePieceScore(shape);
        
        // Проверяем и убираем заполненные линии
        this.clearCompletedLines();
        
        // Проверяем, все ли фигуры размещены
        if (this.currentPieces.every(p => p.placed)) {
            setTimeout(() => this.generateNewPieces(), 500);
        }
        
        this.updateScore();
        return true;
    }

    calculatePieceScore(shape) {
        let blocks = 0;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) blocks++;
            }
        }
        return blocks;
    }

    clearCompletedLines() {
        let linesCleared = 0;
        const cellsToRemove = new Set();
        
        // Проверяем строки
        for (let row = 0; row < 9; row++) {
            if (this.board[row].every(cell => cell)) {
                linesCleared++;
                for (let col = 0; col < 9; col++) {
                    cellsToRemove.add(`${row}-${col}`);
                }
            }
        }
        
        // Проверяем столбцы
        for (let col = 0; col < 9; col++) {
            if (this.board.every(row => row[col])) {
                linesCleared++;
                for (let row = 0; row < 9; row++) {
                    cellsToRemove.add(`${row}-${col}`);
                }
            }
        }
        
        // Проверяем блоки 3x3
        for (let blockRow = 0; blockRow < 3; blockRow++) {
            for (let blockCol = 0; blockCol < 3; blockCol++) {
                let blockFilled = true;
                
                for (let row = blockRow * 3; row < (blockRow + 1) * 3; row++) {
                    for (let col = blockCol * 3; col < (blockCol + 1) * 3; col++) {
                        if (row < 9 && col < 9 && !this.board[row][col]) {
                            blockFilled = false;
                            break;
                        }
                    }
                    if (!blockFilled) break;
                }
                
                if (blockFilled) {
                    linesCleared++;
                    for (let row = blockRow * 3; row < (blockRow + 1) * 3; row++) {
                        for (let col = blockCol * 3; col < (blockCol + 1) * 3; col++) {
                            if (row < 9 && col < 9) {
                                cellsToRemove.add(`${row}-${col}`);
                            }
                        }
                    }
                }
            }
        }
        
        // Удаляем клетки с анимацией
        if (cellsToRemove.size > 0) {
            this.animateLineClear(cellsToRemove);
            this.score += linesCleared * 100 + cellsToRemove.size * 10;
        }
    }

    animateLineClear(cellsToRemove) {
        // Подсвечиваем клетки перед удалением
        cellsToRemove.forEach(cellKey => {
            const [row, col] = cellKey.split('-').map(Number);
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('highlight');
            }
        });
        
        // Удаляем клетки после анимации
        setTimeout(() => {
            cellsToRemove.forEach(cellKey => {
                const [row, col] = cellKey.split('-').map(Number);
                this.board[row][col] = false;
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.classList.remove('filled', 'highlight');
                }
            });
        }, 600);
    }

    checkGameOver() {
        for (const piece of this.currentPieces) {
            if (piece.placed) continue;
            
            if (this.hasValidPosition(piece.shape)) {
                return false;
            }
        }
        
        this.gameOver();
        return true;
    }

    hasValidPosition(shape) {
        for (let row = 0; row <= 9 - shape.length; row++) {
            for (let col = 0; col <= 9 - shape[0].length; col++) {
                if (this.canPlacePiece(row, col, shape)) {
                    return true;
                }
            }
        }
        return false;
    }

    gameOver() {
        this.gameRunning = false;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('blockdoku-best-score', this.bestScore);
        }
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('modal-best-score').textContent = this.bestScore;
        document.getElementById('game-over-modal').style.display = 'flex';
    }

    restartGame() {
        this.board = Array(9).fill().map(() => Array(9).fill(false));
        this.score = 0;
        this.gameRunning = true;
        this.selectedPiece = null;
        this.draggedPiece = null;
        
        // Удаляем призрачную копию если она есть
        this.removeDragGhost();
        
        document.getElementById('game-over-modal').style.display = 'none';
        
        // Очищаем доску
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('filled', 'preview', 'invalid', 'highlight');
        });
        
        this.generateNewPieces();
        this.updateScore();
    }

    showHint() {
        if (!this.gameRunning) return;
        
        // Показываем подсказку для первой доступной фигуры
        for (const piece of this.currentPieces) {
            if (piece.placed) continue;
            
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (this.canPlacePiece(row, col, piece.shape)) {
                        this.showPreview(row, col, piece.id);
                        setTimeout(() => {
                            document.querySelectorAll('.cell.preview').forEach(c => {
                                c.classList.remove('preview');
                            });
                        }, 2000);
                        return;
                    }
                }
            }
        }
    }

    updateScore() {
        document.getElementById('score-value').textContent = this.score;
        document.getElementById('best-score-value').textContent = this.bestScore;
    }
}

// Инициализация игры
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new BlockdokuGame();
}); 