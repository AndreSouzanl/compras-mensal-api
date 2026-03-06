import express from "express"
import { autenticarToken } from "../middleware/auth.js"
import {
  listarProdutos,
  cadastrarProduto,
  buscarProdutoPorNome,
  atualizarProduto,
  atualizarStatus,
  removerProduto,
} from "../servicos/servico_produto.js"
import { validarProduto, validarStatus } from "../validacao/valida_produto.js"

const router = express.Router()

// GET — listar produtos
router.get("/", autenticarToken, async (req, res) => {
  try {
    const produtos = await listarProdutos(req.user.id)
    return res.status(200).json(produtos)
  } catch (erro) {
    console.error("Erro ao listar produtos:", erro)
    return res.status(500).json({ mensagem: "Erro interno do servidor" })
  }
})

// POST — cadastrar produto
router.post("/", autenticarToken, async (req, res) => {
  const { nome, descricao, quantidade, unidade } = req.body

  // 1. validação
  const validacao = validarProduto(nome, quantidade, unidade)
  if (!validacao.status) {
    return res.status(400).json({ mensagem: validacao.mensagem })
  }

  try {
    // 2. verifica duplicidade
    const existente = await buscarProdutoPorNome(nome, req.user.id)
    if (existente) {
      if (existente.status === "removido") {
        // reativa o produto
        await atualizarProduto(existente.id, { nome, descricao, quantidade, unidade, status: "ativo" }, req.user.id)
        return res.status(200).json({ mensagem: "Produto reativado com sucesso!" })
      }
      return res.status(400).json({ mensagem: "Produto já cadastrado!" })
    }

    // 3. cadastra
    const produto = await cadastrarProduto(nome, descricao, quantidade, unidade, req.user.id)
    return res.status(201).json({
      mensagem: "Produto cadastrado com sucesso!",
      produto,
    })
  } catch (erro) {
    console.error("Erro ao cadastrar produto:", erro)
    return res.status(500).json({ mensagem: "Erro interno do servidor" })
  }
})

// PUT — atualizar produto
router.put("/:id", autenticarToken, async (req, res) => {
  const { id } = req.params
  const { nome, descricao, quantidade, unidade } = req.body

  const validacao = validarProduto(nome, quantidade, unidade)
  if (!validacao.status) {
    return res.status(400).json({ mensagem: validacao.mensagem })
  }

  try {
    await atualizarProduto(id, { nome, descricao, quantidade, unidade }, req.user.id)
    return res.status(200).json({ mensagem: "Produto atualizado com sucesso!" })
  } catch (erro) {
    console.error("Erro ao atualizar produto:", erro)
    return res.status(500).json({ mensagem: "Erro interno do servidor" })
  }
})

// PATCH — atualizar status (comprado/ativo)
router.patch("/:id", autenticarToken, async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  const validacao = validarStatus(status)
  if (!validacao.status) {
    return res.status(400).json({ mensagem: validacao.mensagem })
  }

  try {
    await atualizarStatus(id, status, req.user.id)
    return res.status(200).json({ mensagem: "Status atualizado com sucesso!" })
  } catch (erro) {
    console.error("Erro ao atualizar status:", erro)
    return res.status(500).json({ mensagem: "Erro interno do servidor" })
  }
})

// DELETE — remover produto
router.delete("/:id", autenticarToken, async (req, res) => {
  const { id } = req.params 
  try {
    await removerProduto(id, req.user.id)
    return res.status(200).json({ mensagem: "Produto removido com sucesso!" })
  } catch (erro) {
    console.error("Erro ao remover produto:", erro)
    return res.status(500).json({ mensagem: "Erro interno do servidor" })
  }
})

export default router