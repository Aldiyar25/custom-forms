# Custom Forms

This repository contains a React frontend and a Node.js backend for creating and managing custom form templates. Users can register, create templates with multiple question types, share them publicly or privately, and collect responses. The project also provides an admin panel for user management and integrates with Salesforce for pushing data.

## Features

- User registration and authentication using JWT
- Create and edit form templates with text, long text, number and checkbox questions
- Upload images for templates via Cloudinary
- Public and private templates with access control
- Comment and like templates
- Submit responses as forms and view analytics
- Admin dashboard to manage users (block/unblock, grant/revoke admin)
- Multi-language UI (English and Russian) and light/dark theme switch
-  integration for exporting contact data to Salesforce

## Requirements

- Node.js 18+
- PostgreSQL database

## Running the project

```bash
# Backend
cd backend
npm install
# create a .env file with DATABASE_URL, JWT_SECRET and Cloudinary/Salesforce variables
npm run migrate
npm run seed       # optional sample data
npm run dev        # starts on http://localhost:3000
```

```bash
# Frontend
cd frontend
npm install
npm run dev        # starts Vite dev server on http://localhost:5173
```

During development the frontend proxies API requests to the backend. Set `VITE_API_URL` in a `.env` file for production builds.

---

# Custom Forms (Russian)

Репозиторий содержит React‑фронтенд и Node.js‑бэкенд для создания и управления пользовательскими шаблонами форм. Пользователи могут регистрироваться, создавать шаблоны с различными типами вопросов, делиться ими и собирать ответы. Есть панель администратора и интеграция с Salesforce для отправки данных.

## Возможности

- Регистрация и авторизация пользователей (JWT)
- Создание и редактирование шаблонов с вопросами типа текст, большой текст, число и флажок
- Загрузка изображений через Cloudinary
- Публичные и приватные шаблоны с доступом по списку пользователей
- Комментарии и лайки к шаблонам
- Отправка ответов и просмотр аналитики
- Админ‑панель для управления пользователями (блокировка, назначение админов)
- Интерфейс на английском и русском языках, переключение темы оформления
-  интеграция с Salesforce

## Требования

- Node.js 18+
- База данных PostgreSQL

## Запуск проекта

```bash
# Бэкенд
cd backend
npm install
# создайте файл .env с DATABASE_URL, JWT_SECRET и переменными Cloudinary/Salesforce
npm run migrate
npm run seed       # опционально — заполнить тестовыми данными
npm run dev        # сервер запустится на http://localhost:3000
```

```bash
# Фронтенд
cd frontend
npm install
npm run dev        # Vite запустит сервер на http://localhost:5173
```

Во время разработки фронтенд проксирует запросы к API на бэкенд. Для продакшена укажите `VITE_API_URL` в файле `.env`.
