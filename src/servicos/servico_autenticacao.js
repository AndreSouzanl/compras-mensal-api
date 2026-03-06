import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { buscarUsuarioPorEmail } from "./servico_usuario.js"
import dotenv from "dotenv"

dotenv.config()

export async function autenticar(email, senha) {
  // 1. busca o usuário pelo email
  const usuario = await buscarUsuarioPorEmail(email)

  if (!usuario) {
    return { status: false, mensagem: "E-mail ou senha incorretos!" }
  }

  // 2. compara a senha digitada com a senha criptografada
  const senhaValida = await bcrypt.compare(senha, usuario.senha)

  if (!senhaValida) {
    return { status: false, mensagem: "E-mail ou senha incorretos!" }
  }

  // 3. gera o token JWT
  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

  return {
    status: true,
    mensagem: "Autenticação realizada com sucesso!",
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  }
}