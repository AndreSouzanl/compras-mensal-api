export function validarUsuario(nome, email, senha) {
  if (!nome || nome.trim() === "") {
    return { status: false, mensagem: "Nome é obrigatório!" }
  }

  if (!email || email.trim() === "") {
    return { status: false, mensagem: "E-mail é obrigatório!" }
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailValido) {
    return { status: false, mensagem: "E-mail inválido!" }
  }

  if (!senha || senha.trim() === "") {
    return { status: false, mensagem: "Senha é obrigatória!" }
  }

  if (senha.length < 6) {
    return { status: false, mensagem: "Senha deve ter no mínimo 6 caracteres!" }
  }

  return { status: true }
}

export function validarLogin(email, senha) {
  if (!email || email.trim() === "") {
    return { status: false, mensagem: "E-mail é obrigatório!" }
  }

  if (!senha || senha.trim() === "") {
    return { status: false, mensagem: "Senha é obrigatória!" }
  }

  return { status: true }
}