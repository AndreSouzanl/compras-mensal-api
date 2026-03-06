import { supabase } from "../conexao/supabase.js"

export async function listarProdutos(usuarioID) {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("criado_por", usuarioID)
    .neq("status", "removido")
    .order("criado_em", { ascending: false })

  if (error) throw error
  return data
}

export async function buscarProdutoPorNome(nome, usuarioID) {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("nome", nome)
    .eq("criado_por", usuarioID)
    .single()

  if (error) return null
  return data
}

export async function cadastrarProduto(nome, descricao, quantidade, unidade, usuarioID) {
  const { data, error } = await supabase
    .from("produtos")
    .insert([{ nome, descricao, quantidade, unidade, criado_por: usuarioID }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function atualizarProduto(id, dados, usuarioID) {
  const { error } = await supabase
    .from("produtos")
    .update({ ...dados, atualizado_em: new Date() })
    .eq("id", id)
    .eq("criado_por", usuarioID)

  if (error) throw error
  return { sucesso: true }
}

export async function atualizarStatus(id, status, usuarioID) {
  const { error } = await supabase
    .from("produtos")
    .update({ status, atualizado_em: new Date() })
    .eq("id", id)
    .eq("criado_por", usuarioID)

  if (error) throw error
  return { sucesso: true }
}

export async function removerProduto(id, usuarioID) {
  const { error } = await supabase
    .from("produtos")
    .update({ status: "removido", atualizado_em: new Date() })
    .eq("id", id)
    .eq("criado_por", usuarioID)

  if (error) throw error
  return { sucesso: true }
}