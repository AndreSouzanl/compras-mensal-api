import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"

import rotaUsuarios from "./router/router_usuarios.js"
import rotaAutenticacao from "./router/router_autenticacao.js"
import rotaProdutos from "./router/router_produtos.js"

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

// ROTAS
app.get("/", (req, res) => {
  res.send("🚀 ComprasMensal API rodando!")
})

app.use("/usuarios", rotaUsuarios)
app.use("/login", rotaAutenticacao)
app.use("/produtos", rotaProdutos)

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta: ${PORT}`)
})

