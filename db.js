// ПРОБНЫЙ ФАЙЛ ПО ПОДКЛЮЧЕНИЮ

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres', // замени на своего пользователя
  host: 'localhost',
  database: 'ИМЯ БД', // замени на имя своей базы
  password: 'ПАРОЛЬ', // замени на свой пароль
  port: 5432,
});

export default pool; 