import { supabase } from "../conexao/supabase.js"
import { enviarEmailResetSenha } from "./servico_email.js"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function solicitarReset(email) {
  // busca usuário
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("id, nome, email")
    .eq("email", email)
    .single()

  if (!usuario) return { status: false, mensagem: "E-mail não encontrado!" }

  // gera token único
  const token = crypto.randomBytes(32).toString("hex")
  const expiraEm = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

  // salva token no banco
  await supabase.from("reset_tokens").insert([{
    usuario_id: usuario.id,
    token,
    expira_em: expiraEm,
  }])

  // envia email
  await enviarEmailResetSenha(usuario.email, usuario.nome, token)

  return { status: true, mensagem: "Email enviado com sucesso!" }
}

export async function resetarSenha(token, novaSenha) {
  // busca token válido
  const { data: resetToken } = await supabase
    .from("reset_tokens")
    .select("*")
    .eq("token", token)
    .eq("usado", false)
    .single()

  if (!resetToken) return { status: false, mensagem: "Token inválido!" }

  // verifica se expirou
  if (new Date() > new Date(resetToken.expira_em)) {
    return { status: false, mensagem: "Token expirado! Solicite um novo." }
  }

  // atualiza senha
  const senhaCriptografada = await bcrypt.hash(novaSenha, 10)
  await supabase
    .from("usuarios")
    .update({ senha: senhaCriptografada })
    .eq("id", resetToken.usuario_id)

  // marca token como usado
  await supabase
    .from("reset_tokens")
    .update({ usado: true })
    .eq("id", resetToken.id)

  return { status: true, mensagem: "Senha alterada com sucesso!" }
}