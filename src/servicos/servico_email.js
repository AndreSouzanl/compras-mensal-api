import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function enviarEmailResetSenha(email, nome, token) {
  const linkReset = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "🔑 Resetar senha - ComprasMensal",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #060b14; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #818cf8; font-size: 24px; margin: 0;">
            🛒 ComprasMensal
          </h1>
        </div>

        <h2 style="font-size: 20px; margin-bottom: 8px;">Olá, ${nome}! 👋</h2>
        <p style="color: #94a3b8; margin-bottom: 24px;">
          Recebemos uma solicitação para resetar sua senha. Clique no botão abaixo para criar uma nova senha.
        </p>

        <a href="${linkReset}" style="display: block; text-align: center; background: linear-gradient(to right, #6366f1, #9333ea); color: white; font-weight: bold; padding: 14px 24px; border-radius: 12px; text-decoration: none; margin-bottom: 24px;">
          🔑 Resetar minha senha
        </a>

        <p style="color: #64748b; font-size: 12px; text-align: center;">
          Este link expira em <strong>15 minutos</strong>.<br/>
          Se você não solicitou isso, ignore este email.
        </p>

      </div>
    `
  })
}