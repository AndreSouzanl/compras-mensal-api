import express from "express"
import { solicitarReset, resetarSenha } from "../servicos/servico_reset.js"

const router = express.Router()

// solicitar reset
router.post("/solicitar", async (req, res) => {
  const { email } = req.body

  if (!email) return res.status(400).json({ mensagem: "E-mail é obrigatório!" })

  const resultado = await solicitarReset(email)

  if (!resultado.status) {
    return res.status(404).json({ mensagem: resultado.mensagem })
  }

  return res.status(200).json({ mensagem: resultado.mensagem })
})

// resetar senha
router.post("/resetar", async (req, res) => {
  const { token, novaSenha } = req.body

  if (!token || !novaSenha) {
    return res.status(400).json({ mensagem: "Token e nova senha são obrigatórios!" })
  }

  if (novaSenha.length < 6) {
    return res.status(400).json({ mensagem: "Senha deve ter no mínimo 6 caracteres!" })
  }

  const resultado = await resetarSenha(token, novaSenha)

  if (!resultado.status) {
    return res.status(400).json({ mensagem: resultado.mensagem })
  }

  return res.status(200).json({ mensagem: resultado.mensagem })
})

export default router