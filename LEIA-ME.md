# MC SUPREMO · versão em pasta

Nicosheik Labs · beat 'em up mobile 2.5D · Turnê Underground de Reggae em Porto Alegre

## Estrutura

```
mc-supremo/
├── index.html              ← abre o jogo
├── css/jogo.css            ← visual das telas e botões
├── js/dados.js             ← CONTEÚDO: imagens, músicas, fases, ajustes
├── js/jogo.js              ← motor do jogo (não precisa mexer pra trocar arte)
└── assets/
    ├── herois/abacaxi/     ← quadros do Cabeça de Abacaxi
    ├── herois/nico/        ← quadros do Nico Cabeça de Amendoim
    ├── viloes/01-jay/ …    ← uma pasta por chefe (07-super-boss)
    ├── cenarios/           ← fundo de cada fase
    ├── props/              ← Uno (3 estágios) e copo de cura
    ├── ui/                 ← retrato e fundo do museu
    ├── extras/             ← imagens dos créditos e do Super Boss
    ├── _banco/             ← todas as poses recebidas, sem fundo (reserva)
    └── musicas/            ← trilha n9-nico1 … n9-nico10
```

## Como abrir

- **Mais simples:** dois cliques no `index.html`.
- **Recomendado para testar no PC:** rodar um servidor local na pasta (`python -m http.server` e abrir `http://localhost:8000`) ou a extensão Live Server do VS Code.
  - No Chrome, aberto direto do disco, a recoloração dos capangas pode não funcionar e o card de recorde sai sem a foto do herói. Pelo servidor, ou publicado, funciona tudo.
- **Publicar:** envie a pasta inteira para um endereço `https://` (Netlify Drop, GitHub Pages, itch.io). Em `https` o botão de compartilhar abre o WhatsApp direto com o card.

## Carregamento por fase

- **Na abertura** o jogo baixa só o essencial: heróis, vilões, museu e a música do título (~4,5 MB).
- **Depois que o título abre**, baixa em segundo plano o fundo e a música da fase atual e a música do museu.
- **No museu**, já baixa o fundo e a música da próxima fase enquanto o jogador está lá.
- **Antes da última fase**, adianta o epílogo, os créditos e a música final.
- Imagens e músicas que ainda não foram usadas não gastam dados de quem joga.

## Músicas

| Tela | Arquivo |
|---|---|
| Título e elenco (introdução) | n9-nico5.ogg |
| Museu e escolha de MC | n9-nico7.ogg |
| Fase 1 · JAY | n9-nico1.ogg |
| Fase 2 · O Skater | n9-nico2.ogg |
| Fase 3 · Old T | n9-nico3.ogg |
| Fase 4 · Mão de Pedra | n9-nico4.ogg |
| Fase 5 · Waleska | n9-nico6.ogg |
| Fase 6 · Mazarope | n9-nico8.ogg |
| Fase 7 · Super Boss | n9-nico10.ogg |
| Turnê completa e créditos (conclusão) | n9-nico9.ogg |

O bônus do Uno toca a música da fase que acabou de ser vencida.

Para trocar: substitua o arquivo em `assets/musicas/` com o mesmo nome, ou edite o bloco `MUSICAS` no topo de `js/dados.js`.

## Como adicionar ou trocar quadros (frames)

**Pelo jogo (sem editar código)**
1. Abra o Admin (🛠️) → Personagens ou Fases → EDITAR GOLPES.
2. Use TROCAR, + ADICIONAR, AJUSTAR, mover ◀ ▶, duplicar ⧉ ou apagar ✕.
3. Toque em **SALVAR ADM**: baixa um `dados.js` novo.
4. Substitua o `js/dados.js` da pasta por ele.

As imagens novas enviadas pelo Admin vão embutidas dentro do `dados.js`.

**Por arquivo (melhor para muitas imagens)**
1. Salve a imagem na pasta do personagem, por exemplo `assets/herois/abacaxi/throw_1.webp`.
2. Em `js/dados.js`, no golpe certo, adicione: `{"src":"assets/herois/abacaxi/throw_1.webp","w":LARGURA,"h":ALTURA}`.

Regras dos arquivos:
- PNG ou WebP com fundo transparente, personagem virado para a direita, pés na mesma linha de base.
- Mesma altura de referência da pose Parado (herói: 300 px).
- Alguns golpes reutilizam a mesma imagem (por exemplo, o pulo usa quadros do "run"). O `dados.js` mostra qual arquivo cada quadro usa.

Golpes com arte própria (enviada em set/2026), nos dois heróis: `comboFinal` (3), `throw` (agarrão, 4), `voadora` (2), `slide` (2), `fuga` (3).

`assets/_banco/abacaxi` e `assets/_banco/nico` guardam **todas** as poses recebidas, já sem fundo (`pose_NN.webp`), inclusive as que não entraram no jogo. Servem para trocar um quadro pelo Admin (TROCAR / + ADICIONAR) sem precisar gerar de novo.

## Manobras no slide

Durante o slide (⤴️ + segurar 🦵), cada direção do manche é uma manobra no mesmo combo:

| Manche | Manobra | Efeito |
|---|---|---|
| ↑ | OLLIE NO TRILHO | pulinho em cima da superfície |
| ↓ | CROOKED | agachado; no meio-fio tromba 50% mais forte |
| → (frente) | NOSEGRIND | acelera o slide |
| ← (trás) | TAILSLIDE | freia: mais tempo para manobrar |

- Cada manobra **nova** soma 1 hit no contador de combo e pontos crescentes (150, 300, 450…). Repetir a mesma seguida não conta.
- No meio-fio, cada manobra dá +0,3 s de slide (até +1,2 s).
- Na cabeça do vilão, cada manobra também bate.
- As 4 no mesmo slide: **COMBO DE MANOBRAS** (+500).
- Quadros: `slideCima`, `slideBaixo`, `slideFrente`, `slideTras` na pasta de cada herói (editáveis no Admin).

## Versão para publicar sem o Admin

No Admin, **BAIXAR SEM ADM** gera um `dados.js` com `SEM_ADMIN=true`. Com ele o botão 🛠️ some. Também dá para trocar essa linha à mão no topo de `js/dados.js`.
