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
    const { rows } = await pool.query("SELECT * FROM posts");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

  // Ruta POST para agregar un nuevo post
  app.post("/posts", async (req, res) => {
    const { titulo, img, descripcion } = req.body;
  
    try {
      const { rows } = await pool.query(
        "INSERT INTO posts (titulo, img, descripcion) VALUES ($1, $2, $3) RETURNING *",
        [titulo, img, descripcion]
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Función para modificar likes
const modificarLikes = async (id) => {
  const { rows, rowCount } = await pool.query(
    "SELECT likes FROM posts WHERE id = $1",
    [id]
  );

  if (rowCount === 0) {
    const error = new Error("Post no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const likesActuales = rows[0].likes || 0;
  const nuevosLikes = likesActuales + 1;

  await pool.query(
    "UPDATE posts SET likes = $1 WHERE id = $2",
    [nuevosLikes, id]
  );
};

// Ruta PUT para modificar likes
app.put("/posts/like/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await modificarLikes(id);
    res.status(200).json({ message: "Likes modificados correctamente" });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

// Función para eliminar posts
const eliminarPost = async (id) => {
  const result = await pool.query("DELETE FROM posts WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    const error = new Error("Post no encontrado");
    error.statusCode = 404;
    throw error;
  }
};

// Ruta DELETE para eliminar posts
app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await eliminarPost(id);
    res.status(200).json({ message: "Post Eliminado" });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

startServer();