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

## Painel admin e ajuste dos controles (modo dev)

Os botões 🛠️ (admin) e ⚙ (tamanho do manche e dos botões) ficam **escondidos do jogador**.

- Para ligar no seu aparelho: abra o jogo uma vez com `?admin=1` no fim do endereço (ex.: `index.html?admin=1`). Fica lembrado naquele navegador.
- Para desligar: abra com `?admin=0`.
- `SEM_ADMIN = true` em `js/dados.js` continua valendo: remove o painel de vez, mesmo com `?admin=1`.

## Instalar como app

O jogo tem manifesto (`manifest.webmanifest`) e ícones em `assets/ui/icone-*.png`. Publicado em `https://`, o navegador do celular oferece "Adicionar à tela inicial" e o jogo abre em tela cheia, deitado, sem barra de endereço.

## Vilões novos, versão azul e poses novas (out/2026)

**Elenco das ondas: 10 personagens × 2 (normal e azul) = 20 vilões, cada um com um jeito de lutar só dele.**

- 4 personagens novos em `assets/viloes/08-skatista-laranja`, `09-faca`, `10-regata`, `11-colete-preto` (ficam em `P.tipos` no `js/dados.js`).
- 6 chefes já vencidos voltam nas ondas das fases seguintes.
- A versão azul é pintada pelo motor em cima da arte normal (não precisa de arquivo azul). Mesmo nível de vida e dano.

| Personagem | Desde a fase | Normal | Azul |
|---|---|---|---|
| LARANJA | 1 | Investida de skate em linha reta | Bate e foge |
| REGATA | 1 | Agarrador | Golpe duplo |
| FACA | 2 | Estocada de longe | Dá a volta e ataca pelas costas |
| COLETE | 3 | Voadora | Muralha (defende muito) |
| JAY | 2 | Pesado (quase não é empurrado) | Golpe triplo |
| O SKATER | 3 | Esquiva (sai da faixa quando você bate) | Investida vai e volta |
| OLD T | 4 | Fúria (acelera com metade da vida) | Empurrão (joga o MC longe) |
| MÃO DE PEDRA | 5 | Marreta (soco lento e forte) | Levanta batendo |
| WALESKA | 6 | Metralha (chutes rápidos e fracos) | Pula por cima de você |
| MAZAROPE | 7 | Contra-ataque (defende e revida) | Marcação (nunca sai da sua faixa) |

**Ondas no padrão Streets of Rage**
- 2 capangas fracos da gangue do chefe por onda (os recoloridos, briga comum) fazem volume.
- Os especiais chegam de 2 em 2, um de cada lado: 1 normal + 1 azul de personagens diferentes. O normal e o azul do mesmo boneco nunca vêm no mesmo par.
- Todo o elenco da fase aparece antes de alguém repetir.
- Na onda do meio de cada fase vem um **mini-chefe**: um vilão do elenco maior, com 3× a vida e letreiro "CHEFÃO".
- O tamanho total da onda continua o de antes (4 a 8), mais o mini-chefe.

**Vidas**
- 3 vidas. Acabou a energia: perde 1 vida e volta no mesmo lugar, invencível por um instante, com os vilões jogados para longe.
- Sem vidas: tela de derrota. CONTINUAR volta ao início da onda com 3 vidas e os pontos daquele ponto.
- Vida extra a cada 20.000 pontos, até 5.
- Ajuste em `P.regras` no `js/dados.js` (`vidas`, `vidaExtraPts`, `vidasMax`).

**Como o jogador responde (3 botões)**
- Investida, vai e volta (aviso azul com "!"): ⤴️ pula por cima, ou sai da faixa com o manche. Na vai e volta vem uma segunda passada.
- Voadora: sai da faixa com o manche (pular não desvia).
- Estocada e marreta: aviso longo; 🦵 afasta ou sai do alcance.
- Agarrador (aviso vermelho): ⤴️⤴️ salto de fuga.
- Bate e foge, metralha: 👊 logo depois do golpe.
- Duplo e triplo: 🦵 afasta ou ⤴️⤴️ sai depois do primeiro golpe.
- Pelas costas, pula por cima: vire o manche para ele.
- Muralha, contra-ataque: 🦵 abre a guarda, depois 👊. No contra-ataque, afaste depois de bater na guarda.
- Esquiva: alinhe a faixa de novo (a guia no chão mostra) ou use 🦵, que alcança mais.
- Pesado: 👊 colado para agarrar e arremessar.
- Fúria: acabe rápido quando ele passar da metade da vida.
- Empurrão: ⤴️⤴️ ou 🦵 antes do golpe; se levar, você é jogado longe.
- Levanta batendo: depois de derrubar, afaste; ele levanta já com golpe armado.
- Marcação: mudar de faixa não despista; use 🦵 e 👊.

**Ajustes** em `js/dados.js`:
- `P.tipos` — nome, `faseMin`, `hpMul`, `dmg`, `perfil`, `perfilAzul` e os quadros de cada personagem novo.
- `P.perfis` — os 20 jeitos de lutar. Os marcados com `soAzul` são os da versão azul.
- `P.mistura` — `parGap` (segundos entre um par e o próximo), `gangue` (capangas fracos por onda), `miniChefe` (1 liga, 0 desliga), `miniHp` e o perfil normal e azul de cada chefe veterano.

**Poses novas dos chefes** — JAY, OLD T e MÃO DE PEDRA ganharam caído (`koPose`), voando (`voandoA`) e sentado/levantando (`sentadoA`). Qualquer vilão pode receber essas três listas no `dados.js`.

## Armas, outdoor e pancada do JAY (out/2026)

**Armas pegáveis** — `assets/props/arma-*.webp`, config em `P.armas` no `js/dados.js`.

| Arma | Golpes até quebrar | Golpe (👊) | Arremesso (🦵) |
|---|---|---|---|
| GARRAFA | 3 | forte, alcance curto | derruba; quebra ao bater |
| SHAPE | 6 | alcance longo | derruba; cai no chão com 1 uso a menos |
| TÁBUA | 4 | o mais forte, derruba | derruba; cai no chão com 1 uso a menos |
| COPO | 1 | não bate: 👊 também arremessa | dano baixo, não derruba |

- 👊 perto de uma arma no chão, sem vilão no alcance do soco: pega.
- 👊 com arma: golpe de arma (acerta todos na frente). Com arma na mão o 👊 não agarra.
- 🦵 com arma: arremessa em linha reta na sua faixa. Com arma na mão o 🦵 não empurra.
- Levou golpe, foi agarrado ou perdeu vida: a arma cai no chão.
- 2 armas espalhadas por fase; caixa de som e lixeira quebradas soltam arma em 35% das vezes que não soltam copo.
- Ajuste: `P.regras.armasPorFase`, `P.regras.armaDropPct` e os campos de cada arma (`dano`, `alcance`, `usos`, `arremesso`, `derruba`).

**Outdoor COPO VAZIO** — propaganda no fundo, uma por fase, atrás dos personagens. Imagens em `assets/cenarios/outdoor-copo-vazio-*.webp` (alternam por fase). Ajuste em `P.outdoor` (`largura`, `perna`, e `pos` para escolher a posição numa fase: na Redenção fica fora do centro, longe do monumento); apague o bloco para tirar.

**Pancada do JAY** — golpe novo com a pose do shape acima da cabeça (`pancadaA`): aviso longo em vermelho, dano alto e derruba. Vale para o JAY chefe e para o JAY que volta nas ondas. Resposta: 🦵 afasta antes, sair do alcance, ou ⤴️⤴️. Qualquer vilão que receber `pancadaA` no `dados.js` ganha o golpe.

## Especial: giro 360 (out/2026)

- **Comando**: segure 👊 por meio segundo (um anel amarelo enche no chão) e solte.
- **Efeito**: giro de skate invencível que acerta e derruba todos em volta e fura a guarda.
- **Custo (modelo Streets of Rage 4)**: gasta 8% da vida. Essa vida fica em aberto, em verde claro na barra, e volta 2 pontos a cada golpe acertado depois. Se apanhar antes, perde o que faltava voltar.
- **Pânico**: dá para soltar mesmo cambaleando de um golpe. Não funciona caído nem agarrado.
- Com 1 ponto de vida o especial não sai. Toque curto no 👊 continua sendo o soco normal.
- Ajuste em `P.regras` no `js/dados.js`: `especialSegura`, `especialCusto`, `especialVolta`, `especialDano`, `especialRaio`.

## Cerco no padrão Streets of Rage (out/2026)

- **Máximo de 4 vilões de onda na tela**; os outros esperam fora e entram quando um cai.
- **Só 2 chegam perto do herói por vez**, de preferência um de cada lado. Se todos estão do mesmo lado, um dá a volta.
- **Quem atacou recua** e descansa um instante; outro entra no lugar.
- **Os que esperam ficam num anel** em volta, cada um na sua distância e faixa, sem empilhar.
- Ajuste em `P.regras` no `js/dados.js`: `maxNaTela`, `descanso`, `anelDist`, `anelPasso`. O número de vilões que chegam perto é `MAX_ATACANTES` (Admin).

## Escala no padrão Streets of Rage (out/2026)

- **Bonecos menores**: escala 1.4 (era 1.7). Objetos (Uno, bancos, caixas, lixeiras, copos) e altura do pulo diminuem na mesma proporção.
- **Quase sem encolher no fundo**: 92% no fundo da calçada, 100% na frente (antes 70% a 103%).
- **Pés sempre visíveis**: a linha mais baixa da calçada fica em 680 (a tela tem 720), ajustável em `chaoMax`.
- **Faixa de andar rasa**: no máximo 210 px de profundidade, para ninguém "subir" para o fundo do cenário. Trensurb e Palco Final ficam como estavam por causa do degrau.
- Ajuste em `P.regras` no `js/dados.js`: `escalaBonecos`, `escalaFundo`, `escalaFrente`, `faixaMax`. Apague `escalaBonecos` para voltar a usar a escala do Admin.

## Modo palito (protótipo)

- Bonecos desenhados por código, com animação completa: remar, parado, soco em tempos, chute, voadora, agarrão, apanhar, voar, cair, sentar, golpes e avisos dos vilões.
- Liga e desliga no menu de pausa (⏸ → MODO PALITO), ou abrindo o jogo com `?palito=1` / `?palito=0`. Fica lembrado no aparelho.
- Mesmo tamanho e mesmas áreas de acerto da arte: dá para voltar à arte a qualquer momento sem mudar a dificuldade.
- Herói com contorno dourado; versão azul em azul; mini-chefe com coroa; FACA com faca na mão.

## Fase 1: Cervejaria Copo Vazio (out/2026)

- O cenário da fase do JAY trocou da Esquina Democrática para a **Cervejaria Copo Vazio** (`assets/cenarios/01-cervejaria-panorama.webp`). Essa fase não tem outdoor (`"JAY":-1` em `P.outdoor.pos`).
- **A esteira das garrafas é um degrau de slide** (`degrau` da fase em `js/dados.js`: `yPlat` 470 = topo da esteira, `yRua` 590 = pé dela, de `xIni` 410 a `xFim` 2090).
  - **Subir:** encoste na esteira (manche para cima) e pule com o manche para cima.
  - **Slide:** pule, aperte 🦵 (voadora) e segure 🦵 até pousar encostado na esteira. Ele desliza por cima das garrafas até soltar o 🦵 ou a esteira acabar.
- **Objetos da cervejaria** (`assets/props/cervejaria/`, recortados da folha de peças Copo Vazio): engradados e sacos de malte no lugar da caixa de som (quebráveis), barris de inox e madeira no lugar do latão (quebráveis, com slide em cima), esteiras soltas no lugar do banco (slide em cima). A lista fica em `P.objetosFase` no fim de `js/dados.js`. Para dar arte própria a outra fase, crie uma entrada com o nome do chefe.

## Efeitos sonoros gravados (out/2026)

- Os sons ficam em `assets/sons/` (mp3 mono, cortados e com volume igualado). A lista está em `P.sons` no fim de `js/dados.js`, o volume de cada um em `P.sonsVol`.
- **Onde cada som toca:**
  - Golpe no ar: `whoosh`.
  - Acerto: `soco`. Golpe forte, arremesso ou especial: `forte`, às vezes com o grito de força do herói.
  - Vilão: `vilao-ai` (às vezes, ao apanhar) e `vilao-ko` (no nocaute). A Waleska usa `mulher-ai`.
  - Herói apanha: `forte`. Se o atacante for o FACA: `faca`.
  - Quedas no chão (herói ou vilão): `queda`.
  - Objetos: acerto em caixa ou barril `soco`, quebrou `quebra`.
  - Armas: pegar `pega-arma`, cair no chão `arma-chao`, garrafa ou copo estilhaçado `splash`.
  - Especial (giro 360): `especial` + `giro`. Chefe entra: `rugido`. Tiro dos chefes: `tiro`. Game over: `game-over`.
  - Skate: `pouso` ao cair do pulo, `slide-pedra` (meio-fio e degrau) e `slide-metal` (banco, barril, carro) em loop durante o slide, `rodinhas` em loop conforme a velocidade.
  - Fundo: `corvos` na Redenção (`P.sonsAmbiente`).
- Aberto direto do disco (sem servidor) os mp3 não carregam, e o jogo usa os sons sintetizados de antes.
- Não usados por enquanto (originais com você): correndo, espirro, pedra na água, skate parado, skate no parque, passando no meio-fio.
