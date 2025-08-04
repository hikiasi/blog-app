# Приложение Блог

Полнофункциональное приложение для блога с использованием React, TypeScript, PostgreSQL и Express.

## Функциональность

- ✅ Регистрация и вход пользователей
- ✅ Создание, редактирование и удаление постов
- ✅ Подписка на пользователей
- ✅ Лента подписок
- ✅ Просмотр публичных постов
- ✅ Скрытые посты "только по запросу"
- ✅ Система тегов
- ✅ Комментирование постов
- ✅ Поиск и сортировка постов

## Технологии

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui компоненты
- Lucide React иконки

### Backend
- Node.js
- Express
- PostgreSQL
- JWT аутентификация
- bcrypt для хеширования паролей

## Установка и запуск

### 1. Настройка базы данных

1. Установите PostgreSQL
2. Создайте базу данных:
```sql
CREATE DATABASE blog_schema;
```
3. Выполните SQL скрипт из файла `blog_schema.sql`

### 2. Настройка сервера

1. Перейдите в папку сервера:
```bash
cd server
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите сервер:
```bash
npm run dev
```

Сервер будет доступен на http://localhost:5000

### 3. Настройка клиента

1. В корневой папке проекта установите зависимости:
```bash
npm install
```

2. Запустите клиент:
```bash
npm run dev
```

Клиент будет доступен на http://localhost:3000

## Структура проекта

```
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthForm.tsx
│   │   ├── layout/
│   │   │   └── Navigation.tsx
│   │   ├── posts/
│   │   │   ├── PostCard.tsx
│   │   │   └── PostEditor.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       └── ...
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── FollowingPage.tsx
│   │   └── ProfilePage.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── server/
│   └── index.js
├── blog_schema.sql
└── package.json
```

## API Endpoints

### Аутентификация
- `POST /api/auth/signup` - Регистрация
- `POST /api/auth/signin` - Вход

### Посты
- `GET /api/posts` - Получение постов
- `POST /api/posts` - Создание поста
- `PUT /api/posts/:id` - Обновление поста
- `DELETE /api/posts/:id` - Удаление поста

### Комментарии
- `POST /api/posts/:id/comments` - Добавление комментария

### Подписки
- `POST /api/follow/:userId` - Подписка на пользователя
- `DELETE /api/follow/:userId` - Отписка от пользователя
- `GET /api/follow/:userId/status` - Статус подписки

### Теги
- `GET /api/tags` - Получение популярных тегов

## Особенности реализации

1. **Безопасность**: Пароли хешируются с помощью bcrypt
2. **Аутентификация**: JWT токены для сессий
3. **Валидация**: Проверка данных на сервере
4. **UI/UX**: Современный дизайн с Tailwind CSS
5. **Типизация**: Полная типизация TypeScript
6. **Компонентная архитектура**: Переиспользуемые компоненты

## Лицензия

MIT 