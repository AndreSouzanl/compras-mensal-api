import express from "express"
import { criarUsuario, buscarUsuarioPorEmail } from "../servicos/servico_usuario.js"
import { validarUsuario } from "../validacao/valida_usuario.js"

const router = express.Router()

router.post("/", async (req, res) => {
  const { nome, email, senha } = req.body

  // 1. validação
  const validacao = validarUsuario(nome, email, senha)
  if (!validacao.status) {
    return res.status(400).json({ mensagem: validacao.mensagem })
  }

  // 2. verifica se email já existe
  const usuarioExistente = await buscarUsuarioPorEmail(email)
  if (usuarioExistente) {
    return res.status(400).json({ mensagem: "E-mail já cadastrado!" })
  }

  try {
    // 3. cria o usuário
    const usuario = await criarUsuario(nome, email, senha)
    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario,
    })
  } catch (erro) {
    console.error("Erro ao cadastrar usuário:", erro)
    return res.status(500).json({ mensagem: "Erro interno do servidor" })
  }
})

export default router