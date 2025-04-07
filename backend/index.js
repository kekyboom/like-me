import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

export const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "likeme",
    password: "4523",
    port: 5432,
    allowExitOnIdle: true,
    });

    const startServer = async () => {
        try {
          await pool.query("SELECT NOW()");
          console.log("Base de Datos Conectada");
      
          app.listen(PORT, () => {
            console.log("Servidor backend ON");
          });

        } catch (error) {
          console.error("Error al conectar con la base de datos", error);
        }
      };
      
// Ruta GET para obtener los posts
app.get("/posts", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM posts");
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Ruta POST para agregar un nuevo post
  app.post("/posts", async (req, res) => {
    const { titulo, img, descripcion } = req.body;
  
    try {
      const result = await pool.query(
        "INSERT INTO posts (titulo, img, descripcion) VALUES ($1, $2, $3) RETURNING *",
        [titulo, img, descripcion]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  startServer();