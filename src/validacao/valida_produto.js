export function validarProduto(nome, quantidade, unidade) {
  if (!nome || nome.trim() === "") {
    return { status: false, mensagem: "Nome do produto é obrigatório!" }
  }

  if (nome.length < 2) {
    return { status: false, mensagem: "Nome deve ter no mínimo 2 caracteres!" }
  }

  if (!quantidade || quantidade <= 0) {
    return { status: false, mensagem: "Quantidade deve ser maior que zero!" }
  }

  if (!unidade || unidade.trim() === "") {
    return { status: false, mensagem: "Unidade é obrigatória!" }
  }

  const unidadesValidas = ["kg", "un", "L", "g", "cx"]
  if (!unidadesValidas.includes(unidade)) {
    return { status: false, mensagem: "Unidade inválida! Use: kg, un, L, g ou cx" }
  }

  return { status: true }
}

export function validarStatus(status) {
  const statusValidos = ["ativo", "comprado"]
  if (!statusValidos.includes(status)) {
    return { status: false, mensagem: "Status inválido! Use: ativo ou comprado" }
  }

  return { status: true }
}