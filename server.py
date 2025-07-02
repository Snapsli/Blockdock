#!/usr/bin/env python3
"""
Простой HTTP сервер для локального тестирования игры Blockdoku
Использование: python server.py [порт]
"""

import http.server
import socketserver
import os
import sys
import webbrowser
from pathlib import Path

# Порт по умолчанию
DEFAULT_PORT = 4000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Кастомный обработчик для улучшенной работы с файлами"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def end_headers(self):
        # Добавляем заголовки для лучшей совместимости
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        
        # CORS заголовки для разработки
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        super().end_headers()
    
    def guess_type(self, path):
        """Определяем MIME типы для файлов"""
        # Дополнительные MIME типы
        if path.endswith('.js'):
            return 'application/javascript'
        elif path.endswith('.css'):
            return 'text/css'
        elif path.endswith('.html'):
            return 'text/html'
        elif path.endswith('.json'):
            return 'application/json'
        
        # Возвращаем результат родительского метода (только mimetype, без encoding)
        mimetype, _ = super().guess_type(path)
        return mimetype
    
    def log_message(self, format, *args):
        """Улучшенное логирование"""
        timestamp = self.log_date_time_string()
        print(f"[{timestamp}] {format % args}")

def check_files():
    """Проверяем наличие необходимых файлов"""
    required_files = ['index.html', 'styles.css', 'game.js', 'telegram-integration.js']
    missing_files = []
    
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)
    
    if missing_files:
        print("❌ Отсутствуют следующие файлы:")
        for file in missing_files:
            print(f"   - {file}")
        print("\nУбедитесь, что все файлы находятся в текущей директории.")
        return False
    
    print("✅ Все необходимые файлы найдены")
    return True

def get_local_ip():
    """Получаем локальный IP адрес"""
    import socket
    try:
        # Подключаемся к Google DNS для определения локального IP
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"

def main():
    """Основная функция запуска сервера"""
    
    # Проверяем порт из аргументов командной строки
    port = DEFAULT_PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"❌ Неверный номер порта: {sys.argv[1]}")
            print(f"Использование: python {sys.argv[0]} [порт]")
            sys.exit(1)
    
    # Проверяем наличие файлов
    if not check_files():
        sys.exit(1)
    
    # Настраиваем сервер
    try:
        with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
            local_ip = get_local_ip()
            
            print("\n" + "="*60)
            print("🎮 Сервер Blockdoku запущен!")
            print("="*60)
            print(f"📡 Локальный адрес:    http://localhost:{port}")
            print(f"🌐 Сетевой адрес:     http://{local_ip}:{port}")
            print(f"📁 Рабочая директория: {os.getcwd()}")
            print("="*60)
            print("📱 Для тестирования в Telegram:")
            print("   1. Разместите файлы на HTTPS хостинге")
            print("   2. Настройте мини-приложение через @BotFather")
            print("   3. Используйте команду /newapp")
            print("="*60)
            print("⏹️  Для остановки нажмите Ctrl+C")
            print()
            
            # Автоматически открываем браузер
            try:
                webbrowser.open(f'http://localhost:{port}')
                print("🌐 Браузер должен открыться автоматически")
            except Exception:
                print("⚠️  Не удалось автоматически открыть браузер")
            
            print()
            
            # Запускаем сервер
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Порт {port} уже занят")
            print(f"Попробуйте другой порт: python {sys.argv[0]} {port + 1}")
        else:
            print(f"❌ Ошибка запуска сервера: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n👋 Сервер остановлен пользователем")
        print("Спасибо за использование Blockdoku!")

if __name__ == "__main__":
    main() 