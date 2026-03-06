import { supabase } from "../conexao/supabase.js"
import bcrypt from "bcryptjs"

export async function criarUsuario(nome, email, senha) {
  // 1. criptografa a senha
  const senhaCriptografada = await bcrypt.hash(senha, 10)

  // 2. insere no banco
  const { data, error } = await supabase
    .from("usuarios")
    .insert([{ nome, email, senha: senhaCriptografada }])
    .select("id, nome, email")
    .single()

  if (error) throw error

  return data
}

export async function buscarUsuarioPorEmail(email) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .single()

  if (error) return null

  return data
}