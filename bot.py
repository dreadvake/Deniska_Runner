import os
import json
from dotenv import load_dotenv
from telegram import Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

# Загружаем переменные окружения из .env
load_dotenv()

# Получаем токен бота
BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise RuntimeError("Не найден BOT_TOKEN в окружении. Проверьте файл .env")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Приветственное сообщение и инструкция."""
    await update.message.reply_text(
        "Привет! Введите /play, чтобы начать игру Deniska Race."
    )

async def play(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Отправляет кнопку Web App для запуска игры."""
    web_app = WebAppInfo(url="https://dreadvake.github.io/Deniska_Runner/")
    button = KeyboardButton(text="▶️ Play Deniska Race", web_app=web_app)
    keyboard = ReplyKeyboardMarkup([[button]], resize_keyboard=True)
    await update.message.reply_text(
        "Нажмите кнопку, чтобы играть:",
        reply_markup=keyboard
    )

async def handle_webapp_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обрабатывает данные, отправленные из Web App."""
    data = update.effective_message.web_app_data.data
    stats = json.loads(data)
    text = (
        f"Игра окончена!\n"
        f"Счёт: {stats['score']} очков\n"
        f"В сервисе заплатили: -{stats['service']}\n"
        f"Капустникам заплатили: -{stats['inspector']}\n"
        f"Квадрокоптеров сбито: {stats['quads']}"
    )
    await update.message.reply_text(text)

def main():
    # Создаём приложение и регистрируем хэндлеры
    app = (
        ApplicationBuilder()
        .token(BOT_TOKEN)
        .build()
    )
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("play", play))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_webapp_data))
    # Запускаем бота
    app.run_polling()

if __name__ == "__main__":
    main()