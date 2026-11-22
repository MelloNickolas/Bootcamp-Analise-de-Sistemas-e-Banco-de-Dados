// Reduz uma imagem escolhida pelo usuário para caber em um texto pequeno ("data:image/...") que vai para o banco.
export async function reduzirImagem(arquivo: File, ladoMaximo = 192): Promise<string> {
  if (!arquivo.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem.');

  const endereco = URL.createObjectURL(arquivo);
  try {
    const imagem = await new Promise<HTMLImageElement>((ok, falha) => {
      const elemento = new Image();
      elemento.onload = () => ok(elemento);
      elemento.onerror = () => falha(new Error('Não consegui abrir essa imagem.'));
      elemento.src = endereco;
    });

    const escala = Math.min(1, ladoMaximo / Math.max(imagem.width, imagem.height));
    const tela = document.createElement('canvas');
    tela.width = Math.max(1, Math.round(imagem.width * escala));
    tela.height = Math.max(1, Math.round(imagem.height * escala));
    tela.getContext('2d')?.drawImage(imagem, 0, 0, tela.width, tela.height);

    // WebP quando o navegador suporta (menor); senão PNG
    const webp = tela.toDataURL('image/webp', 0.85);
    return webp.startsWith('data:image/webp') ? webp : tela.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(endereco);
  }
}
