import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]
  // Authorization: Bearer <token>
  //                        ↑ pega só o token

  if (!token) {
    return res.status(401).json({ mensagem: "Token não fornecido!" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    // req.user fica disponível em todas as rotas protegidas
    next()
  } catch (erro) {
    return res.status(401).json({ mensagem: "Token inválido ou expirado!" })
  }
}