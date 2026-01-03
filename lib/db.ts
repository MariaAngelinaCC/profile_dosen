import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "db_biodosen",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function getConnection() {
  try {
    const connection = await pool.getConnection()
    return connection
  } catch (error) {
    console.error("[v0] Database connection error:", error)
    throw error
  }
}

export async function query(sql: string, values?: any[]): Promise<any> {
  const connection = await getConnection()
  try {
    const [results] = await connection.execute(sql, values || [])
    return results
  } finally {
    connection.release()
  }
}

// ✅ Perbaiki ekspor default & connection
export { pool as connection }
export default pool
