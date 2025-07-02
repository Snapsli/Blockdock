#!/usr/bin/env python3
"""
Telegram бот для игры Blockdoku
Использование: python bot.py
"""

import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Токен бота (замените на ваш токен)
BOT_TOKEN = "7771770588:AAHhZfdZEftZ_hWWH6r5gppTqBP1Y761g1I"

# URL мини-приложения (замените на ваш URL после развертывания)
WEBAPP_URL = "https://snapsli.github.io/Blockdock/"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Отправляет приветственное сообщение с кнопкой запуска игры."""
    
    # Создаем кнопку для запуска мини-приложения
    keyboard = [
        [InlineKeyboardButton(
            "🎮 Играть в Blockdoku", 
            web_app=WebAppInfo(url=WEBAPP_URL)
        )],
        [InlineKeyboardButton("ℹ️ О игре", callback_data="about")]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_text = """
🎮 **Добро пожаловать в Blockdoku!**

Увлекательная головоломка с блоками! 

🧩 **Как играть:**
• Размещайте фигуры на поле 9×9
• Заполняйте линии, столбцы и блоки 3×3
• Набирайте очки и бейте рекорды!

Нажмите кнопку ниже, чтобы начать игру:
"""
    
    await update.message.reply_text(
        welcome_text, 
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def about(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Показывает информацию о игре."""
    
    query = update.callback_query
    await query.answer()
    
    about_text = """
ℹ️ **О игре Blockdoku**

🎯 **Цель игры:**
Размещайте различные фигуры на игровом поле 9×9 клеток для заполнения линий, столбцов и квадратов 3×3.

🎮 **Игровой процесс:**
• Перетаскивайте фигуры из нижней панели на поле
• Заполненные линии, столбцы и блоки 3×3 исчезают
• Игра заканчивается, когда нет места для новых фигур

🏆 **Система очков:**
• Одна клетка = 1 очко
• Линия/столбец = бонус +10 очков
• Блок 3×3 = бонус +30 очков
• Одновременное очищение = множитель!

🎨 **Особенности:**
• Адаптивный дизайн для мобильных устройств
• Поддержка тем Telegram (светлая/темная)
• Вибрация при размещении фигур
• Сохранение прогресса в облаке

Удачной игры! 🍀
"""
    
    # Кнопка возврата к главному меню
    keyboard = [
        [InlineKeyboardButton(
            "🎮 Играть в Blockdoku", 
            web_app=WebAppInfo(url=WEBAPP_URL)
        )],
        [InlineKeyboardButton("🔙 Назад", callback_data="back")]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(
        about_text,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def back_to_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Возвращает к стартовому сообщению."""
    
    query = update.callback_query
    await query.answer()
    
    # Повторяем стартовое сообщение
    keyboard = [
        [InlineKeyboardButton(
            "🎮 Играть в Blockdoku", 
            web_app=WebAppInfo(url=WEBAPP_URL)
        )],
        [InlineKeyboardButton("ℹ️ О игре", callback_data="about")]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_text = """
🎮 **Добро пожаловать в Blockdoku!**

Увлекательная головоломка с блоками! 

🧩 **Как играть:**
• Размещайте фигуры на поле 9×9
• Заполняйте линии, столбцы и блоки 3×3
• Набирайте очки и бейте рекорды!

Нажмите кнопку ниже, чтобы начать игру:
"""
    
    await query.edit_message_text(
        welcome_text,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обрабатывает нажатия кнопок."""
    
    query = update.callback_query
    
    if query.data == "about":
        await about(update, context)
    elif query.data == "back":
        await back_to_start(update, context)

def main() -> None:
    """Запускает бота."""
    
    # Создаем приложение
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Регистрируем обработчики
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CallbackQueryHandler(handle_callback))
    
    # Запускаем бота
    print("🤖 Бот Blockdoku запущен!")
    print(f"🔗 Мини-приложение: {WEBAPP_URL}")
    print("⏹️  Для остановки нажмите Ctrl+C")
    
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main() 