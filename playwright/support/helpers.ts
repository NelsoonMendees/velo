export function gerarCodigoPedido(prefixo = 'VLO', tamanho = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let sufixo = ''

  // Gera "tamanho" caracteres aleatórios
  for (let i = 0; i < tamanho; i++) {
    sufixo += chars[Math.floor(Math.random() * chars.length)]
  }

  return `${prefixo}-${sufixo}`
}
