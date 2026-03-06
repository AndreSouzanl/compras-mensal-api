import express from "express"
import { autenticar } from "../servicos/servico_autenticacao.js"
import { validarLogin } from "../validacao/valida_usuario.js"

const router = express.Router()

router.post("/", async (req, res) => {
  const { email, senha } = req.body

  // 1. validação
  const validacao = validarLogin(email, senha)
  if (!validacao.status) {
    return res.status(400).json({ mensagem: validacao.mensagem })
  }

  try {
    // 2. autenticar
    const resultado = await autenticar(email, senha)

    if (!resultado.status) {
      return res.status(401).json({ mensagem: resultado.mensagem })
    }

    return res.status(200).json(resultado)
  } catch (erro) {
    console.error("Erro ao autenticar:", erro)
    return res.status(500).json({ mensagem: "Erro interno do servidor" })
  }
})

export default router