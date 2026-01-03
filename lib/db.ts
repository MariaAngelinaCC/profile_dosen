import { Pool } from "pg"

<<<<<<< HEAD
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
})

export async function query(sql: string, values: any[] = []) {
  const [rows] = await pool.execute(sql, values)
  return rows
=======
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

export async function query(sql: string, params?: any[]) {
  const result = await pool.query(sql, params)
  return result.rows
>>>>>>> 6dc17e7583efab658e4ce6dffee2c4593aba01e3
}

export default pool
