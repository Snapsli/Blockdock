// Интеграция с Telegram Web Apps
class TelegramIntegration {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        
        this.init();
    }

    init() {
        if (!this.tg) {
            console.log('Telegram WebApp API недоступен - работает в режиме веб-страницы');
            return;
        }

        // Настройка Telegram WebApp
        this.tg.ready();
        this.tg.expand();
        
        // Получаем данные пользователя
        this.user = this.tg.initDataUnsafe?.user;
        
        // Настройка темы
        this.setupTheme();
        
        // Настройка главной кнопки
        this.setupMainButton();
        
        // Настройка обработчиков событий
        this.setupEventHandlers();
        
        // Отключаем вертикальные свайпы (если поддерживается)
        if (this.tg.isVerticalSwipesEnabled !== undefined) {
            this.tg.disableVerticalSwipes();
        }

        console.log('Telegram WebApp инициализирован');
        console.log('Пользователь:', this.user);
    }

    setupTheme() {
        if (!this.tg) return;

        // Применяем цветовую схему Telegram
        const root = document.documentElement;
        
        if (this.tg.colorScheme === 'dark') {
            root.style.setProperty('--tg-theme-bg-color', this.tg.themeParams.bg_color || '#1e1e1e');
            root.style.setProperty('--tg-theme-secondary-bg-color', this.tg.themeParams.secondary_bg_color || '#2a2a2a');
            root.style.setProperty('--tg-theme-text-color', this.tg.themeParams.text_color || '#ffffff');
            root.style.setProperty('--tg-theme-hint-color', this.tg.themeParams.hint_color || '#6c757d');
            root.style.setProperty('--tg-theme-accent-text-color', this.tg.themeParams.accent_text_color || '#64b5ef');
            root.style.setProperty('--tg-theme-button-color', this.tg.themeParams.button_color || '#64b5ef');
            root.style.setProperty('--tg-theme-button-text-color', this.tg.themeParams.button_text_color || '#ffffff');
            root.style.setProperty('--tg-theme-destructive-text-color', this.tg.themeParams.destructive_text_color || '#ff6b6b');
        } else {
            root.style.setProperty('--tg-theme-bg-color', this.tg.themeParams.bg_color || '#ffffff');
            root.style.setProperty('--tg-theme-secondary-bg-color', this.tg.themeParams.secondary_bg_color || '#f8f9fa');
            root.style.setProperty('--tg-theme-text-color', this.tg.themeParams.text_color || '#212529');
            root.style.setProperty('--tg-theme-hint-color', this.tg.themeParams.hint_color || '#6c757d');
            root.style.setProperty('--tg-theme-accent-text-color', this.tg.themeParams.accent_text_color || '#0088cc');
            root.style.setProperty('--tg-theme-button-color', this.tg.themeParams.button_color || '#0088cc');
            root.style.setProperty('--tg-theme-button-text-color', this.tg.themeParams.button_text_color || '#ffffff');
            root.style.setProperty('--tg-theme-destructive-text-color', this.tg.themeParams.destructive_text_color || '#dc3545');
        }

        // Устанавливаем цвет header bar
        if (this.tg.setHeaderColor) {
            this.tg.setHeaderColor(this.tg.themeParams.secondary_bg_color || '#ffffff');
        }
    }

    setupMainButton() {
        if (!this.tg?.MainButton) return;

        // Настройка главной кнопки для действий в игре
        this.tg.MainButton.setText('Поделиться результатом');
        this.tg.MainButton.hide();

        this.tg.MainButton.onClick(() => {
            this.shareScore();
        });
    }

    setupEventHandlers() {
        if (!this.tg) return;

        // Обработчик изменения темы
        this.tg.onEvent('themeChanged', () => {
            this.setupTheme();
        });

        // Обработчик изменения viewport
        this.tg.onEvent('viewportChanged', () => {
            this.handleViewportChange();
        });

        // Обработчик закрытия приложения
        this.tg.onEvent('mainButtonClicked', () => {
            this.shareScore();
        });
    }

    handleViewportChange() {
        if (!this.tg) return;

        // Адаптируем интерфейс под изменение размера viewport
        const viewport = this.tg.viewportHeight;
        const stableHeight = this.tg.viewportStableHeight;
        
        // Если клавиатура открыта, адаптируем интерфейс
        if (viewport < stableHeight) {
            document.body.style.height = `${viewport}px`;
        } else {
            document.body.style.height = '100vh';
        }
    }

    showMainButton() {
        if (this.tg?.MainButton) {
            this.tg.MainButton.show();
        }
    }

    hideMainButton() {
        if (this.tg?.MainButton) {
            this.tg.MainButton.hide();
        }
    }

    shareScore() {
        if (!this.tg || !window.game) return;

        const score = window.game.score;
        const bestScore = window.game.bestScore;
        
        const shareText = `🎮 Я играю в Blockdoku!\n\n` +
                         `🎯 Текущий счет: ${score}\n` +
                         `🏆 Рекорд: ${bestScore}\n\n` +
                         `Попробуй превзойти мой результат!`;

        // Используем Telegram WebApp API для отправки данных
        if (this.tg.sendData) {
            this.tg.sendData(JSON.stringify({
                action: 'share_score',
                score: score,
                bestScore: bestScore,
                text: shareText
            }));
        }

        // Альтернативно - показываем popup с результатом
        if (this.tg.showPopup) {
            this.tg.showPopup({
                title: 'Поделиться результатом',
                message: shareText,
                buttons: [
                    {
                        type: 'default',
                        text: 'Отправить в чат'
                    },
                    {
                        type: 'cancel',
                        text: 'Отмена'
                    }
                ]
            }, (buttonId) => {
                if (buttonId === 'default') {
                    this.tg.switchInlineQuery(shareText, ['users', 'groups']);
                }
            });
        }
    }

    sendScore(score, bestScore) {
        if (!this.tg) return;

        // Отправляем данные об игре боту
        const gameData = {
            user_id: this.user?.id,
            username: this.user?.username,
            first_name: this.user?.first_name,
            score: score,
            best_score: bestScore,
            timestamp: Date.now()
        };

        if (this.tg.sendData) {
            this.tg.sendData(JSON.stringify(gameData));
        }
    }

    showAlert(message) {
        if (this.tg?.showAlert) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }

    showConfirm(message, callback) {
        if (this.tg?.showConfirm) {
            this.tg.showConfirm(message, callback);
        } else {
            const result = confirm(message);
            callback(result);
        }
    }

    hapticFeedback(type = 'impact', style = 'medium') {
        if (this.tg?.HapticFeedback) {
            switch (type) {
                case 'impact':
                    this.tg.HapticFeedback.impactOccurred(style);
                    break;
                case 'notification':
                    this.tg.HapticFeedback.notificationOccurred(style);
                    break;
                case 'selection':
                    this.tg.HapticFeedback.selectionChanged();
                    break;
            }
        }
    }

    // Сохранение прогресса в облачном хранилище Telegram
    saveProgress(gameState) {
        if (!this.tg?.CloudStorage) return;

        const dataKey = `blockdoku_progress_${this.user?.id || 'guest'}`;
        const gameData = JSON.stringify({
            score: gameState.score,
            bestScore: gameState.bestScore,
            lastPlayed: Date.now(),
            board: gameState.board
        });

        this.tg.CloudStorage.setItem(dataKey, gameData, (error) => {
            if (error) {
                console.error('Ошибка сохранения прогресса:', error);
            } else {
                console.log('Прогресс сохранен в облако');
            }
        });
    }

    // Загрузка прогресса из облачного хранилища
    loadProgress(callback) {
        if (!this.tg?.CloudStorage) {
            callback(null);
            return;
        }

        const dataKey = `blockdoku_progress_${this.user?.id || 'guest'}`;
        
        this.tg.CloudStorage.getItem(dataKey, (error, value) => {
            if (error || !value) {
                callback(null);
                return;
            }

            try {
                const gameData = JSON.parse(value);
                callback(gameData);
            } catch (e) {
                console.error('Ошибка парсинга сохраненных данных:', e);
                callback(null);
            }
        });
    }
}

// Интеграция с игрой
class GameTelegramIntegration {
    constructor() {
        this.telegram = new TelegramIntegration();
        this.initGameIntegration();
    }

    initGameIntegration() {
        // Ждем инициализации игры
        const checkGame = () => {
            if (window.game) {
                this.setupGameIntegration();
            } else {
                setTimeout(checkGame, 100);
            }
        };
        checkGame();
    }

    setupGameIntegration() {
        const originalGameOver = window.game.gameOver.bind(window.game);
        const originalPlacePiece = window.game.placePiece.bind(window.game);
        const originalClearCompletedLines = window.game.clearCompletedLines.bind(window.game);

        // Переопределяем методы игры для интеграции с Telegram
        window.game.gameOver = () => {
            originalGameOver();
            this.onGameOver();
        };

        window.game.placePiece = (...args) => {
            const result = originalPlacePiece(...args);
            if (result) {
                this.telegram.hapticFeedback('impact', 'light');
            }
            return result;
        };

        window.game.clearCompletedLines = () => {
            const oldScore = window.game.score;
            originalClearCompletedLines();
            const newScore = window.game.score;
            
            if (newScore > oldScore) {
                this.telegram.hapticFeedback('notification', 'success');
            }
        };

        // Загружаем сохраненный прогресс
        this.telegram.loadProgress((savedGame) => {
            if (savedGame && savedGame.bestScore > window.game.bestScore) {
                window.game.bestScore = savedGame.bestScore;
                window.game.updateScore();
                localStorage.setItem('blockdoku-best-score', savedGame.bestScore);
            }
        });
    }

    onGameOver() {
        // Показываем главную кнопку для шаринга
        this.telegram.showMainButton();
        
        // Сохраняем прогресс
        this.telegram.saveProgress({
            score: window.game.score,
            bestScore: window.game.bestScore,
            board: window.game.board
        });

        // Отправляем статистику
        this.telegram.sendScore(window.game.score, window.game.bestScore);
        
        // Вибрация при окончании игры
        this.telegram.hapticFeedback('notification', 'error');
    }

    onNewGame() {
        // Скрываем главную кнопку при новой игре
        this.telegram.hideMainButton();
    }
}

// Инициализация интеграции
document.addEventListener('DOMContentLoaded', () => {
    // Небольшая задержка для гарантии загрузки Telegram WebApp API
    setTimeout(() => {
        window.telegramIntegration = new GameTelegramIntegration();
    }, 100);
}); 