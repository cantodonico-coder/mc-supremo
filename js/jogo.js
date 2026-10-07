// MC SUPREMO · motor do jogo (Nicosheik Labs)
// Conteudo (imagens, musicas, fases, ajustes) fica em js/dados.js
// contagem pra barra de carregamento
let _imgTot=0,_imgOk=0;
// imagem SOB DEMANDA: so baixa quando _carregar() e chamado (fundos de fase, cenas finais)
function mkImgLazy(src){const im=new Image();im.ok=false;im._src=src;
  im._carregar=()=>{if(im._pedido||!im._src)return;im._pedido=true;im.onload=()=>{im.ok=true;};im.onerror=()=>{im.ok=false;};im.src=im._src;};
  return im;}
function mkImg(src){const im=new Image();im.ok=false;_imgTot++;im.onload=()=>{im.ok=true;_imgOk++;};im.onerror=()=>{im.ok=false;_imgOk++;};im.src=src;return im;}
// Recolore um sprite ao carregar, PRESERVANDO tom de pele e neutros (preto,
// branco, cinza). Um filtro de matiz simples deixava a pele azul e parecia bug.
// Serve pra que dois viloes que herdaram a mesma arte nao virem o mesmo boneco.
//   cfg = {shift: graus de giro de matiz, sat: multiplicador, val: brilho}
function mkTint(src,cfg){
  const cvs=document.createElement('canvas');cvs.ok=false;
  const im=new Image();_imgTot++;im.addEventListener('load',()=>_imgOk++);im.addEventListener('error',()=>_imgOk++);
  im.onload=()=>{try{
    const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height;
    cvs.width=w;cvs.height=h;
    const g=cvs.getContext('2d');g.drawImage(im,0,0);
    const id=g.getImageData(0,0,w,h),d=id.data;
    const sh=(cfg.shift||0)/360,st=(cfg.sat===undefined?1:cfg.sat),vl=(cfg.val===undefined?1:cfg.val);
    for(let i=0;i<d.length;i+=4){
      if(d[i+3]===0)continue;
      const r=d[i]/255,gg=d[i+1]/255,b=d[i+2]/255;
      const mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),c=mx-mn;
      let hh=0;const v=mx,s=mx>0?c/mx:0;
      if(c>1e-6){
        if(mx===r)hh=((gg-b)/c+6)%6;
        else if(mx===gg)hh=(b-r)/c+2;
        else hh=(r-gg)/c+4;
        hh/=6;}
      // pele: matiz alaranjada/avermelhada, saturacao media, nao muito escuro
      const pele=((hh<0.12)||(hh>0.95))&&s>0.12&&s<0.80&&v>0.28;
      const neutro=s<0.12;
      if(neutro&&cfg.neutro&&!pele&&v>0.18){d[i]*=cfg.neutro[0];d[i+1]*=cfg.neutro[1];d[i+2]*=cfg.neutro[2];continue;} // roupa branca/cinza tingida (capangas)
      if(pele||neutro)continue;
      const h2=(hh+sh+1)%1, s2=Math.min(1,s*st), v2=Math.min(1,v*vl);
      const k=Math.floor(h2*6)%6,f=h2*6-Math.floor(h2*6);
      const pp=v2*(1-s2),q=v2*(1-f*s2),tt=v2*(1-(1-f)*s2);
      let R,G,B;
      if(k===0){R=v2;G=tt;B=pp;} else if(k===1){R=q;G=v2;B=pp;}
      else if(k===2){R=pp;G=v2;B=tt;} else if(k===3){R=pp;G=q;B=v2;}
      else if(k===4){R=tt;G=pp;B=v2;} else {R=v2;G=pp;B=q;}
      d[i]=R*255;d[i+1]=G*255;d[i+2]=B*255;}
    g.putImageData(id,0,0);cvs.ok=true;
  }catch(e){try{const g=cvs.getContext('2d');g.drawImage(im,0,0);cvs.ok=true;}catch(e2){cvs.ok=false;}}};
  im.onerror=()=>{cvs.ok=false;};
  im.src=src;return cvs;}
function mkAny(src,t){return t?mkTint(src,t):mkImg(src);}
function fset(fr,t){return fr?[{img:mkAny(fr.src,t),w:fr.w,h:fr.h,flash:null}]:null;}
function fsetArr(a,t){return a.map(fr=>({img:mkAny(fr.src,t),w:fr.w,h:fr.h,flash:null}));}
const IMG={mcPort:mkImg(P.mcPort),museuBg:mkImg(P.museuBg),mc:{},phases:[],props:{}};
for(const s in P.mc)IMG.mc[s]=fsetArr(P.mc[s]);
IMG.nico={};for(const s in NICO)if(s!=="__port")IMG.nico[s]=fsetArr(NICO[s]);
IMG.nicoPort=mkImg(NICO.__port);
IMG.abacaxiParty=mkImgLazy("assets/extras/abacaxiparty_1.jpg");
IMG.nicoBeach=mkImgLazy("assets/extras/nicobeach_1.webp");
IMG.nicoNessa=mkImgLazy("assets/extras/niconessa_1.png");
for(const k in P.props){const pr=P.props[k];
  if(pr.stages){IMG.props[k]={stages:pr.stages.map(s=>({img:mkImg(s.src),w:s.w,h:s.h}))};}
  else{IMG.props[k]={img:mkImg(pr.src),w:pr.w,h:pr.h};}}
// ---- NENHUM VILAO SE REPETE NA TURNE ----
// As fases 7 (O EMPRESARIO) e 8 (DJ MAO DE PEDRA) estavam usando exatamente a
// mesma arte da POLICIA e do MC GRENAL - o mesmo personagem aparecia duas vezes
// com outro nome. Ficam na reserva ate terem sprite proprio.
// PRA REATIVAR: apague o "reservado:true" da fase e coloque a arte nova nela.
// O EMPRESARIO foi removido do jogo.
// DJ MAO DE PEDRA e CHEFE, entao fica no jogo: ganha recolor (preservando a
// pele) e porte maior pra nao ser confundido com o MC GRENAL.
P.phases.find(ph=>ph.name==="MAZAROPE").tint={shift:90,sat:1.02,val:1.0};P.phases.find(ph=>ph.name==="MAZAROPE").sizeMul=0.6;
// AJUSTES DE PORTE POR VILAO (multiplicadores relativos ao tamanho base)
(function(){
  const bump={"MÃO DE PEDRA":1.20,"PM DE BONÉ":0.50};
  P.phases.forEach(ph=>{ if(bump[ph.name]) ph.sizeMul=(ph.sizeMul||1)*bump[ph.name]; });
})();
P.reserva=P.phases.filter(ph=>ph.reservado);
P.phases=P.phases.filter(ph=>!ph.reservado);
// ---- OS DOIS CHEFES: JAY e DJ MAO DE PEDRA ----
// Alem de terem fase propria, eles INVADEM as outras fases aleatoriamente.
// Lista explicita dos chefes (evita casar nomes por acidente com regex de prefixo)
// TODOS os vilões agora são boss (antes só JAY/MAZAROPE/MÃO DE PEDRA)
P.phases.forEach(ph=>{ph.chefe=true;});
(function(){
  if(P.phases.some(p=>p.name==='SUPER BOSS'))return;
  var _i="assets/extras/i_1.webp";
  var _w=["assets/extras/w_1.webp", "assets/extras/extra_1.webp", "assets/extras/extra_2.webp", "assets/extras/extra_3.webp"];
  var _t=["assets/extras/i_1.webp", "assets/extras/extra_4.webp", "assets/extras/extra_5.webp", "assets/extras/extra_6.webp", "assets/extras/extra_7.webp"];
  var _j=["assets/extras/j_1.webp", "assets/extras/extra_8.webp"];
  function f(s){return {src:s};}
  var _bg="assets/extras/bg_1.webp"; // cenario da fase final: Concha Acustica na praia (v2, ja 1280x720)
  P.phases.push({
    name:'SUPER BOSS',cenario:'PALCO FINAL',accent:'#d4af37',chefe:true,hp:350,
    bandTop:P.phases[0].bandTop,bandBottom:P.phases[0].bandBottom,bg:_bg,
    idle:f(_i),guard:f(_i),attack:f(_t[0]),attack2:f(_t[1]),port:_i,
    idleA:[f(_i)],walkA:_w.map(f),socoA:_t.map(f),chuteA:_t.map(f),
    puloA:_j.map(f),danoA:[f(_i)],victoryA:_w.map(f),tauntA:_w.map(f),mksA:_w.map(f),
    sizeMul:1.30,dmgSoco:14,dmgChute:16,
    fire:{pattern:['lane','low','lane'],telegraph:0.90,gap:0.55,cooldown:5.0,dmg:12,speed:480,recover:2.0},
    vinil:{pattern:['lane','low','lane'],telegraph:0.60,gap:0.48,cooldown:5.5,dmg:12,speed:520,recover:2.0}
  });
})();

function idxChefes(){const a=[];P.phases.forEach((ph,i)=>{if(ph.chefe)a.push(i);});return a;}
function fsA(a,t){return a?fsetArr(a,t):null;}
P.phases.forEach(ph=>{const t=ph.tint||null;IMG.phases.push({bg:mkImgLazy(ph.bg),port:mkAny(ph.port,t),
  idle:fset(ph.idle,t),guard:fset(ph.guard,t)||fset(ph.idle,t),attack:fset(ph.attack,t),
  attack2:fset(ph.attack2,t)||fset(ph.attack,t),attack3:fset(ph.attack3,t)||null,taunt:fset(ph.taunt,t)||fset(ph.idle,t),
  idleA:fsA(ph.idleA,t),walkA:fsA(ph.walkA,t),socoA:fsA(ph.socoA,t),chuteA:fsA(ph.chuteA,t),puloA:fsA(ph.puloA,t),danoA:fsA(ph.danoA,t),
  tauntA:fsA(ph.tauntA,t),mksA:fsA(ph.mksA,t),
  victoryA:fsA(ph.victoryA,t),koPose:fset(ph.koPose,t),
  name:ph.name,cenario:ph.cenario,accent:ph.accent,hp:ph.hp,grant:ph.grant,grantName:ph.grantName,sizeMul:ph.sizeMul||1,bgPanMax:ph.bgPanMax||0});});
// conferencia automatica: nenhum vilao pode aparecer duas vezes
(function(){const vis={};P.phases.forEach((ph,i)=>{
  const k=(ph.idle&&ph.idle.src?ph.idle.src.slice(-64):i)+"|"+(ph.tint?JSON.stringify(ph.tint):"");
  if(vis[k]!==undefined)console.warn("ATENCAO: vilao repetido nas fases",vis[k]+1,"e",i+1);else vis[k]=i;});
  console.log("Turne com "+P.phases.length+" fases, "+P.phases.length+" viloes distintos"
    +(P.reserva.length?" ("+P.reserva.length+" na reserva, aguardando arte)":""));})();
// ================= HEROIS JOGAVEIS =================
// O jogador escolhe no inicio: o MC (protagonista) ou o Nico (amigo).
const HEROES={
  abacaxi:{key:"abacaxi",name:"CABECA DE ABACAXI",title:"CABEÇA DE ABACAXI",sizeMul:0.6,
    role:"PROTAGONISTA",tag:"MC DO UNDERGROUND",accent:"#ffcf33",
    hp:100,spd:1.00,dmgSoco:5,dmgChute:7,
    // alcance real das hitboxes (px de mundo) e ataque aereo
    reachSoco:150,depthSoco:52,reachChute:182,depthChute:56,
    // REGRA DE BALANCEAMENTO: dano no ar sempre MENOR que soco/chute em terra
    // (voar ja e vantagem posicional, nao pode ser tambem a opcao mais forte).
    dmgAr:5,reachAr:132,depthAr:200,
    stats:[["FORCA",4],["VELOCIDADE",3],["VIDA",5]],
    note:"Equilibrado. Combo de skate firme e agarrão pesado.",
    set:()=>IMG.mc,port:()=>IMG.mcPort},
  nico:{key:"nico",name:"NICO CABEÇA DE AMENDOIM",title:"NICO CABEÇA DE AMENDOIM",sizeMul:0.6,
    role:"AMIGO · JOGAVEL",tag:"O NERD DO SKATE",accent:"#2ec27e",
    hp:88,spd:1.20,dmgSoco:5,dmgChute:7,
    // o shape e comprido: alcance maior pra bater com o que a arte mostra
    reachSoco:206,depthSoco:60,reachChute:200,depthChute:62,
    dmgAr:5,reachAr:158,depthAr:200,
    stats:[["FORCA",3],["VELOCIDADE",5],["VIDA",3]],
    note:"Mais rapido e frageil. Usa o shape do skate como arma.",
    set:()=>IMG.nico,port:()=>IMG.nicoPort}
};
const HERO_KEYS=["abacaxi","nico"];
let heroKey="abacaxi";
function HERO(){return HEROES[heroKey];}
function HIMG(){return HERO().set();}
// ajustes do Admin salvos em js/dados.js
if(typeof HEROES_AJUSTE!=="undefined")for(const k in HEROES_AJUSTE)if(HEROES[k])Object.assign(HEROES[k],HEROES_AJUSTE[k]);
function flashOf(fr){if(fr.flash)return fr.flash;if(!fr.img.ok)return null;
  const c=document.createElement('canvas');c.width=fr.w;c.height=fr.h;const g=c.getContext('2d');
  g.drawImage(fr.img,0,0,fr.w,fr.h);g.globalCompositeOperation='source-in';g.fillStyle='#fff';g.fillRect(0,0,fr.w,fr.h);fr.flash=c;return c;}
// ================= ÁUDIO (sintetizado, sem arquivos externos) =================
const AU=(()=>{
  let ctx=null,master=null,music=null,sfx=null,muted=false,started=false;
  let loopKind=null,nextStep=0,stepIdx=0,timer=null;
  const STEP_DUR=0.192; // ~78 bpm em semicolcheias (levada reggae)
  function ensure(){
    if(!ctx){ctx=new(window.AudioContext||window.webkitAudioContext)();
      master=ctx.createGain();master.gain.value=muted?0:0.75;master.connect(ctx.destination);
      music=ctx.createGain();music.gain.value=0.55;music.connect(master);
      sfx=ctx.createGain();sfx.gain.value=0.85;sfx.connect(master);}
    if(ctx.state==="suspended")ctx.resume();
  }
  function noiseBuf(dur){const n=Math.max(1,Math.floor(ctx.sampleRate*dur));
    const b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);return b;}
  function kick(t){const o=ctx.createOscillator(),g=ctx.createGain();
    o.type="sine";o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+0.13);
    g.gain.setValueAtTime(0.95,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.17);
    o.connect(g);g.connect(music);o.start(t);o.stop(t+0.18);}
  function snare(t){const src=ctx.createBufferSource();src.buffer=noiseBuf(0.14);
    const hp=ctx.createBiquadFilter();hp.type="highpass";hp.frequency.value=1000;
    const g=ctx.createGain();g.gain.setValueAtTime(0.7,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.13);
    src.connect(hp);hp.connect(g);g.connect(music);src.start(t);src.stop(t+0.14);}
  function hat(t,vol){const src=ctx.createBufferSource();src.buffer=noiseBuf(0.045);
    const hp=ctx.createBiquadFilter();hp.type="highpass";hp.frequency.value=7000;
    const g=ctx.createGain();g.gain.setValueAtTime(vol||0.28,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.045);
    src.connect(hp);hp.connect(g);g.connect(music);src.start(t);src.stop(t+0.05);}
  function bass(freq,t,dur){const o=ctx.createOscillator(),g=ctx.createGain();
    o.type="sawtooth";o.frequency.setValueAtTime(freq,t);
    const f=ctx.createBiquadFilter();f.type="lowpass";f.frequency.value=420;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.22,t+0.01);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.connect(f);f.connect(g);g.connect(music);o.start(t);o.stop(t+dur+0.02);}
  function stab(freq,t,dur,vol){const o=ctx.createOscillator(),g=ctx.createGain();
    o.type="square";o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||0.09,t+0.008);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.connect(g);g.connect(music);o.start(t);o.stop(t+dur+0.02);}
function lead(freq,t,dur,vol){const o=ctx.createOscillator(),g=ctx.createGain();
    o.type="triangle";o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||0.1,t+0.01);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.connect(g);g.connect(music);o.start(t);o.stop(t+dur+0.02);}
  function bounce(t){const o=ctx.createOscillator(),g=ctx.createGain(); // "bounce" de bola de basquete
    o.type="sine";o.frequency.setValueAtTime(95,t);o.frequency.exponentialRampToValueAtTime(55,t+0.08);
    g.gain.setValueAtTime(0.35,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.09);
    o.connect(g);g.connect(music);o.start(t);o.stop(t+0.1);}
  function scratch(t){const src=ctx.createBufferSource();src.buffer=noiseBuf(0.09);
    const bp=ctx.createBiquadFilter();bp.type="bandpass";bp.frequency.setValueAtTime(2200,t);
    bp.frequency.exponentialRampToValueAtTime(500,t+0.09);bp.Q.value=6;
    const g=ctx.createGain();g.gain.setValueAtTime(0.3,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.09);
    src.connect(bp);bp.connect(g);g.connect(music);src.start(t);src.stop(t+0.1);}
  // ===================== TRILHA SONORA: REGGAE =====================
  // Assinatura da levada:
  //   ONE DROP  -> nada no tempo 1; bumbo + aro juntos no tempo 3 (step 8)
  //   SKANK     -> acorde curto e seco nos CONTRATEMPOS (steps 2,6,10,14)
  //   BAIXO     -> grave, gordo, com pausas (o silencio faz parte)
  // NAO REPETICAO: cada tema tem uma roda de 4 compassos de acordes, 4 frases
  // de melodica, viradas a cada 4 compassos e 7 "mixagens" de dub que entram e
  // saem (baixo fora, skank fora, bateria fina, so percussao...). Os ciclos tem
  // tamanhos primos entre si (3, 4, 7), entao a combinacao completa so volta a
  // se repetir depois de ~84 compassos (varios minutos de jogo).
  function skank(t,notes,vol){ // acorde curto no contratempo (guitarra/orgao)
    if(vol<=0.001)return;
    notes.forEach((f,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();
      o.type="square";o.frequency.setValueAtTime(f,t);
      lp.type="lowpass";lp.frequency.setValueAtTime(2600,t);lp.frequency.exponentialRampToValueAtTime(700,t+0.10);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol*(i?0.7:1),t+0.006);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.115);
      o.connect(lp);lp.connect(g);g.connect(music);o.start(t);o.stop(t+0.13);});}
  function dubBass(freq,t,dur,vol){ // baixo redondo de reggae
    if(vol<=0.001)return;
    const o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();
    o.type="sine";o2.type="triangle";
    o.frequency.setValueAtTime(freq,t);o2.frequency.setValueAtTime(freq*2,t);
    lp.type="lowpass";lp.frequency.value=280;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+0.022);
    g.gain.setValueAtTime(vol,t+dur*0.62);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    const g2=ctx.createGain();g2.gain.value=0.18;o2.connect(g2);g2.connect(lp);
    o.connect(lp);lp.connect(g);g.connect(music);
    o.start(t);o.stop(t+dur+0.03);o2.start(t);o2.stop(t+dur+0.03);}
  function oneDrop(t,vol){ // bumbo grave do tempo 3
    if(vol<=0.001)return;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type="sine";o.frequency.setValueAtTime(118,t);o.frequency.exponentialRampToValueAtTime(44,t+0.16);
    g.gain.setValueAtTime(0.9*vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.22);
    o.connect(g);g.connect(music);o.start(t);o.stop(t+0.23);}
  function rim(t,vol){ // rimshot/cross-stick seco
    if(vol<=0.001)return;
    const src=ctx.createBufferSource();src.buffer=noiseBuf(0.06);
    const bp=ctx.createBiquadFilter();bp.type="bandpass";bp.frequency.value=1750;bp.Q.value=4.5;
    const g=ctx.createGain();g.gain.setValueAtTime(0.5*vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.06);
    src.connect(bp);bp.connect(g);g.connect(music);src.start(t);src.stop(t+0.07);
    const o=ctx.createOscillator(),g2=ctx.createGain();
    o.type="triangle";o.frequency.setValueAtTime(400,t);
    g2.gain.setValueAtTime(0.22*vol,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.05);
    o.connect(g2);g2.connect(music);o.start(t);o.stop(t+0.06);}
  function melodica(freq,t,dur,vol,echo){ // melodica/orgao dub (com eco opcional)
    if(vol<=0.001)return;
    const o=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();
    o.type="sawtooth";o.frequency.setValueAtTime(freq,t);
    lp.type="lowpass";lp.frequency.value=1500;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+0.05);
    g.gain.setValueAtTime(vol,t+dur*0.7);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.connect(lp);lp.connect(g);g.connect(music);o.start(t);o.stop(t+dur+0.03);
    if(echo)for(let k=1;k<=2;k++){ // taps de delay: a cara do dub
      const oe=ctx.createOscillator(),ge=ctx.createGain(),le=ctx.createBiquadFilter();
      const te=t+k*echo;
      oe.type="sawtooth";oe.frequency.setValueAtTime(freq,te);
      le.type="lowpass";le.frequency.value=1100-k*250;
      ge.gain.setValueAtTime(0,te);ge.gain.linearRampToValueAtTime(vol*Math.pow(0.45,k),te+0.04);
      ge.gain.exponentialRampToValueAtTime(0.001,te+dur*0.8);
      oe.connect(le);le.connect(ge);ge.connect(music);oe.start(te);oe.stop(te+dur+0.03);}}
  function perc(t,vol){ // shaker
    if(vol<=0.001)return;
    const src=ctx.createBufferSource();src.buffer=noiseBuf(0.035);
    const hp=ctx.createBiquadFilter();hp.type="highpass";hp.frequency.value=6500;
    const g=ctx.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.035);
    src.connect(hp);hp.connect(g);g.connect(music);src.start(t);src.stop(t+0.04);}
  function tom(t,f,vol){ // tom para as viradas
    if(vol<=0.001)return;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type="sine";o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*0.55,t+0.16);
    g.gain.setValueAtTime(0.5*vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.19);
    o.connect(g);g.connect(music);o.start(t);o.stop(t+0.2);}
  // acordes: [raiz, terca, quinta] — o baixo sai de raiz/4
  const CH={Am:[220,261.6,329.6],G:[196,246.9,392],F:[174.6,220,349.2],C:[261.6,329.6,392],
            Dm:[146.8,220,349.2],Em:[164.8,246.9,329.6],Bb:[233.1,293.7,349.2],A:[220,277.2,329.6],
            Gm:[196,233.1,293.7],D:[146.8,185,220],E7:[164.8,207.7,246.9]};
  const semi=(f,n)=>f*Math.pow(2,n/12);
  // ---- MIXAGENS (o "engenheiro de dub" tirando e colocando instrumento) ----
  const MIXES=[
    {b:1.00,s:1.00,d:1.00,m:0.00,p:1.00,echo:0},      // 0 so a base
    {b:1.00,s:1.00,d:1.00,m:1.00,p:1.00,echo:0},      // 1 tudo tocando
    {b:1.00,s:0.00,d:1.00,m:1.00,p:1.00,echo:0.24},   // 2 skank fora
    {b:0.00,s:1.00,d:1.00,m:1.00,p:1.00,echo:0.24},   // 3 baixo cai (dub drop)
    {b:1.00,s:1.00,d:0.35,m:1.00,p:1.00,echo:0.30},   // 4 bateria fininha
    {b:1.00,s:0.55,d:1.00,m:0.00,p:0.00,echo:0},      // 5 seco, so cozinha
    {b:1.10,s:1.00,d:1.00,m:1.00,p:1.00,echo:0.18}    // 6 baixo na frente
  ];
  // ---- TEMAS (um por cenario) ----
  // prog: 4 compassos, cada um [acorde da 1a metade, acorde da 2a metade]
  // bass: [step, semitons em relacao a raiz do acorde, duracao]
  // licks: 4 frases de melodica (uma por compasso), [step, semitons acima da raiz, dur]
  const PAT_HUB={sd:0.203,seed:0,hv:0.13,skv:0.075,
    prog:[[CH.Am,CH.G],[CH.Am,CH.G],[CH.F,CH.G],[CH.Am,CH.Am]],
    drop:[8],rim:[8],hat:[2,6,10,14],perc:[3,11],
    bass:[[0,0,0.30],[3,0,0.16],[6,7,0.34],[8,0,0.30],[11,12,0.16],[14,-2,0.30]],
    licks:[[[12,12,0.42]],[],[[6,15,0.30],[13,12,0.30]],[[10,19,0.50]]]};
  const PAT_JAY={sd:0.188,seed:2,hv:0.15,skv:0.085,
    prog:[[CH.Am,CH.F],[CH.Am,CH.G],[CH.Dm,CH.F],[CH.Am,CH.G]],
    drop:[8],rim:[8],hat:[2,6,10,14],perc:[0,4,8,12],
    bass:[[0,0,0.26],[3,0,0.14],[6,7,0.26],[8,0,0.26],[11,-5,0.16],[14,3,0.26]],
    licks:[[[6,12,0.24],[13,7,0.30]],[[10,15,0.28]],[],[[2,19,0.22],[12,12,0.34]]]};
  const PAT_POLICIA={sd:0.175,seed:4,hv:0.18,skv:0.09,
    prog:[[CH.Dm,CH.Bb],[CH.Dm,CH.C],[CH.Gm,CH.Bb],[CH.Dm,CH.A]],
    drop:[0,4,8,12],rim:[4,12],hat:[2,6,10,14],perc:[7,15],
    bass:[[0,0,0.24],[2,0,0.12],[6,7,0.22],[8,0,0.24],[12,5,0.22]],
    licks:[[[10,12,0.22]],[[6,15,0.20],[14,12,0.20]],[],[[4,19,0.26]]]};
  const PAT_SKATER={sd:0.160,seed:6,hv:0.19,skv:0.075,
    prog:[[CH.C,CH.Am],[CH.F,CH.G],[CH.C,CH.Em],[CH.F,CH.G]],
    drop:[8],rim:[4,12],hat:[2,6,10,14],perc:[0,2,4,6,8,10,12,14],
    bass:[[0,0,0.20],[3,0,0.12],[6,7,0.20],[8,0,0.22],[11,5,0.14],[14,-5,0.20]],
    licks:[[[7,12,0.18],[15,10,0.18]],[[6,16,0.20]],[[2,19,0.16],[10,12,0.20]],[]]};
  const PAT_DUB={sd:0.208,seed:1,hv:0.12,skv:0.10,
    prog:[[CH.Em,CH.Em],[CH.Am,CH.Em],[CH.C,CH.D],[CH.Em,CH.E7]],
    drop:[8],rim:[8,14],hat:[2,6,10,14],perc:[5],
    bass:[[0,0,0.36],[4,0,0.20],[6,7,0.30],[8,0,0.36],[12,-2,0.34]],
    licks:[[[9,12,0.50]],[],[[6,15,0.40],[14,19,0.30]],[[2,12,0.60]]]};
  const PAT_GRENAL={sd:0.179,seed:3,hv:0.17,skv:0.088,
    prog:[[CH.G,CH.C],[CH.G,CH.Dm],[CH.Em,CH.C],[CH.G,CH.D]],
    drop:[8],rim:[8],hat:[2,6,10,14],perc:[0,4,8,12],
    bass:[[0,0,0.26],[3,0,0.14],[6,7,0.24],[8,0,0.26],[12,5,0.24]],
    licks:[[[14,12,0.26]],[[6,16,0.24]],[],[[4,19,0.30],[12,12,0.24]]]};
  const PAT_PARQUE={sd:0.192,seed:5,hv:0.14,skv:0.08,
    prog:[[CH.C,CH.G],[CH.Am,CH.F],[CH.C,CH.Em],[CH.F,CH.G]],
    drop:[8],rim:[8],hat:[2,6,10,14],perc:[1,5,9,13],
    bass:[[0,0,0.28],[6,7,0.28],[8,0,0.26],[14,-5,0.26]],
    licks:[[[4,12,0.34],[12,16,0.34]],[],[[6,19,0.30]],[[10,12,0.40]]]};
  const PAT_SHOW={sd:0.170,seed:7,hv:0.18,skv:0.09,
    prog:[[CH.A,CH.Dm],[CH.A,CH.Em],[CH.Dm,CH.G],[CH.A,CH.E7]],
    drop:[8],rim:[4,12],hat:[2,6,10,14],perc:[0,3,6,9,12,15],
    bass:[[0,0,0.22],[2,0,0.12],[6,7,0.22],[8,0,0.24],[11,5,0.14],[14,-2,0.22]],
    licks:[[[7,12,0.24]],[[10,16,0.22],[15,12,0.18]],[],[[3,19,0.26]]]};
  const PAT_RIO={sd:0.197,seed:8,hv:0.13,skv:0.095,
    prog:[[CH.Em,CH.C],[CH.G,CH.Dm],[CH.Em,CH.Am],[CH.C,CH.D]],
    drop:[8],rim:[8],hat:[2,6,10,14],perc:[10],
    bass:[[0,0,0.34],[5,7,0.20],[8,0,0.32],[13,-2,0.28]],
    licks:[[[3,12,0.44],[11,7,0.44]],[],[[6,19,0.36]],[[14,12,0.50]]]};
  const PATTERNS={hub:PAT_HUB,p0:PAT_JAY,p1:PAT_POLICIA,p2:PAT_SKATER,p3:PAT_DUB,
                  p4:PAT_GRENAL,p5:PAT_PARQUE,p6:PAT_SHOW,p7:PAT_RIO};
  // mixagem do compasso atual: blocos de 4 compassos, passo 5 sobre 7 mixagens
  function mixOf(pat,bar){
    return MIXES[((Math.floor(bar/4)*5)+(pat.seed||0))%MIXES.length];}
  function schedStep(pat,idx,t,bar){
    const mx=mixOf(pat,bar);
    const prog=pat.prog[bar%pat.prog.length];
    const ch=(idx<8)?prog[0]:prog[1];
    const raiz=ch[0]/4;
    const virada=(bar%4===3);            // ultimo compasso da roda leva virada
    const hatDobrado=(bar%3===2);        // ciclo de 3: densidade do chimbau muda
    // bateria
    if(pat.drop.includes(idx))oneDrop(t,mx.d);
    if(pat.rim.includes(idx))rim(t,mx.d);
    if(pat.hat.includes(idx))hat(t,pat.hv*mx.d);
    if(hatDobrado&&mx.d>0.5&&(idx%4===0)&&idx!==8)hat(t,pat.hv*0.45*mx.d);
    if(pat.perc.includes(idx))perc(t,0.10*mx.p);
    // virada de compasso
    if(virada&&mx.d>0.3){
      if(idx===13)tom(t,180,mx.d);
      if(idx===14)tom(t,150,mx.d);
      if(idx===15){tom(t,120,mx.d);rim(t,0.8*mx.d);}
    }
    // skank nos contratempos
    if(pat.hat.includes(idx))skank(t,ch,pat.skv*mx.s);
    // baixo seguindo a roda de acordes
    for(const[i,st,d]of pat.bass)if(i===idx)dubBass(semi(raiz,st),t,d,0.34*mx.b);
    // frases de melodica: uma por compasso, com eco quando a mixagem pede
    const lick=pat.licks[bar%pat.licks.length]||[];
    for(const[i,st,d]of lick)if(i===idx)melodica(semi(ch[0],st),t,d,0.075*mx.m,mx.echo*pat.sd*4);
  }
  function tick(){
    if(!loopKind){timer=null;return;}
    const pat=PATTERNS[loopKind]||PAT_HUB;
    while(nextStep<ctx.currentTime+0.12){
      schedStep(pat,stepIdx%16,nextStep,Math.floor(stepIdx/16));nextStep+=pat.sd;stepIdx++;}
    timer=setTimeout(tick,40);
  }
  const customEls={}; let curCustomKind=null;
  function setCustomTrack(kind,src){
    if(!src){ if(customEls[kind]){customEls[kind].pause();delete customEls[kind];} return; }
    const a=new window.Audio(); a.preload='none'; a.src=src; a.loop=true; a.volume=muted?0:0.75; customEls[kind]=a;
  }
  // PRE-CARREGA uma trilha que vai tocar em seguida (ex.: musica da proxima fase enquanto o jogador esta no museu)
  function prepara(kind){const a=customEls[kind];if(!a||a._prep||kind===curCustomKind)return;a._prep=true;a.preload='auto';try{a.load();}catch(e){}}
  // FURIA DO BOSS (30% de vida): acelera a musica que ja esta tocando, sem trocar de faixa.
  function setFuryTempo(on){
    if(curCustomKind&&customEls[curCustomKind]) customEls[curCustomKind].playbackRate=on?1.15:1.0;
  }
  function playLoop(kind){
    if(customEls[kind]){
      if(curCustomKind===kind)return;
      if(curCustomKind&&customEls[curCustomKind])customEls[curCustomKind].pause();
      if(timer){clearTimeout(timer);timer=null;} loopKind=null;
      curCustomKind=kind; customEls[kind].currentTime=0; const __p=customEls[kind].play(); if(__p&&__p.catch)__p.catch(()=>{});
      return;
    }
    if(curCustomKind&&customEls[curCustomKind]){customEls[curCustomKind].pause();curCustomKind=null;}
    ensure();if(loopKind===kind)return;loopKind=kind;
    stepIdx=16*(Math.floor(Math.random()*4));  // entra num ponto diferente da roda
    nextStep=ctx.currentTime+0.05;
    if(!timer)tick();}
  function stopLoop(){loopKind=null;if(curCustomKind&&customEls[curCustomKind]){customEls[curCustomKind].pause();curCustomKind=null;}}
  function toggleMute(){muted=!muted;if(master)master.gain.value=muted?0:0.75;
    Object.values(customEls).forEach(a=>a.volume=muted?0:0.75);
    document.getElementById('snd').textContent=muted?"✕":"♪";}
  // ---- SFX ----
  function punch(){ensure();const t=ctx.currentTime;const o=ctx.createOscillator(),g=ctx.createGain();
    o.type="square";o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(70,t+0.09);
    g.gain.setValueAtTime(0.5,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.1);o.connect(g);g.connect(sfx);o.start(t);o.stop(t+0.11);}
  function kickHit(){ensure();const t=ctx.currentTime;const o=ctx.createOscillator(),g=ctx.createGain();
    o.type="square";o.frequency.setValueAtTime(240,t);o.frequency.exponentialRampToValueAtTime(60,t+0.13);
    g.gain.setValueAtTime(0.55,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.14);o.connect(g);g.connect(sfx);o.start(t);o.stop(t+0.15);}
  function hurt(){ensure();const src=ctx.createBufferSource();src.buffer=noiseBuf(0.12);
    const hp=ctx.createBiquadFilter();hp.type="bandpass";hp.frequency.value=1200;
    const g=ctx.createGain();const t=ctx.currentTime;g.gain.setValueAtTime(0.4,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
    src.connect(hp);hp.connect(g);g.connect(sfx);src.start(t);src.stop(t+0.13);}
  function jumpSfx(){ensure();const t=ctx.currentTime;const o=ctx.createOscillator(),g=ctx.createGain();
    o.type="triangle";o.frequency.setValueAtTime(260,t);o.frequency.exponentialRampToValueAtTime(520,t+0.12);
    g.gain.setValueAtTime(0.28,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.13);o.connect(g);g.connect(sfx);o.start(t);o.stop(t+0.14);}
  function power(){ensure();const t=ctx.currentTime;
    for(let i=0;i<4;i++){const o=ctx.createOscillator(),g=ctx.createGain();o.type="sawtooth";
      const f0=180+i*70;o.frequency.setValueAtTime(f0,t+i*0.03);o.frequency.exponentialRampToValueAtTime(f0*3.2,t+0.32+i*0.03);
      g.gain.setValueAtTime(0,t+i*0.03);g.gain.linearRampToValueAtTime(0.16,t+0.02+i*0.03);g.gain.exponentialRampToValueAtTime(0.001,t+0.4+i*0.03);
      o.connect(g);g.connect(sfx);o.start(t+i*0.03);o.stop(t+0.42+i*0.03);}}
  function select(){ensure();const t=ctx.currentTime;const o=ctx.createOscillator(),g=ctx.createGain();
    o.type="square";o.frequency.setValueAtTime(660,t);g.gain.setValueAtTime(0.22,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.08);
    o.connect(g);g.connect(sfx);o.start(t);o.stop(t+0.09);}
  function ko(){ensure();const t=ctx.currentTime;[523,659,784,1046].forEach((f,i)=>{
    const o=ctx.createOscillator(),g=ctx.createGain();o.type="square";o.frequency.setValueAtTime(f,t+i*0.11);
    g.gain.setValueAtTime(0.24,t+i*0.11);g.gain.exponentialRampToValueAtTime(0.001,t+i*0.11+0.28);
    o.connect(g);g.connect(sfx);o.start(t+i*0.11);o.stop(t+i*0.11+0.3);});}
  function lose(){ensure();const t=ctx.currentTime;[392,349,294,220].forEach((f,i)=>{
    const o=ctx.createOscillator(),g=ctx.createGain();o.type="sawtooth";o.frequency.setValueAtTime(f,t+i*0.16);
    g.gain.setValueAtTime(0.2,t+i*0.16);g.gain.exponentialRampToValueAtTime(0.001,t+i*0.16+0.3);
    o.connect(g);g.connect(sfx);o.start(t+i*0.16);o.stop(t+i*0.16+0.32);});}
  function fireSfx(){ensure();const t=ctx.currentTime;
    const src=ctx.createBufferSource();src.buffer=noiseBuf(0.55);
    const bp=ctx.createBiquadFilter();bp.type="bandpass";bp.Q.value=1.1;
    bp.frequency.setValueAtTime(320,t);bp.frequency.exponentialRampToValueAtTime(2600,t+0.30);
    bp.frequency.exponentialRampToValueAtTime(600,t+0.55);
    const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.5,t+0.05);
    g.gain.exponentialRampToValueAtTime(0.001,t+0.55);
    src.connect(bp);bp.connect(g);g.connect(sfx);src.start(t);src.stop(t+0.56);
    const o=ctx.createOscillator(),g2=ctx.createGain();
    o.type="sawtooth";o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(38,t+0.4);
    g2.gain.setValueAtTime(0.28,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.42);
    o.connect(g2);g2.connect(sfx);o.start(t);o.stop(t+0.43);}
  function chargeSfx(dur){ensure();const t=ctx.currentTime,d=dur||0.7;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type="sawtooth";o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(430,t+d);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.20,t+d*0.85);
    g.gain.exponentialRampToValueAtTime(0.001,t+d+0.06);
    const lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=1200;
    o.connect(lp);lp.connect(g);g.connect(sfx);o.start(t);o.stop(t+d+0.08);}
  function vinilSfx(){ensure();const t=ctx.currentTime;
    const src=ctx.createBufferSource();src.buffer=noiseBuf(0.22);
    const bp=ctx.createBiquadFilter();bp.type="bandpass";bp.Q.value=3.5;
    bp.frequency.setValueAtTime(1800,t);bp.frequency.exponentialRampToValueAtTime(420,t+0.22);
    const g=ctx.createGain();g.gain.setValueAtTime(0.42,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.22);
    src.connect(bp);bp.connect(g);g.connect(sfx);src.start(t);src.stop(t+0.23);
    const o=ctx.createOscillator(),g2=ctx.createGain();
    o.type="triangle";o.frequency.setValueAtTime(660,t);o.frequency.exponentialRampToValueAtTime(220,t+0.2);
    g2.gain.setValueAtTime(0.16,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.21);
    o.connect(g2);g2.connect(sfx);o.start(t);o.stop(t+0.22);}
  // ---- trilhas dos creditos finais ----
  const PAT_CRED_NICO={sd:0.146,seed:9,hv:0.20,skv:0,
    prog:[[CH.Am,CH.F],[CH.C,CH.G],[CH.Am,CH.F],[CH.C,CH.G]],
    drop:[0,4,8,12],rim:[6,14],hat:[0,2,4,6,8,10,12,14],perc:[1,3,5,7,9,11,13,15],
    bass:[[0,0,0.14],[2,0,0.10],[4,7,0.14],[6,0,0.10],[8,0,0.14],[10,0,0.10],[12,5,0.14],[14,0,0.10]],
    licks:[[[0,12,0.14],[2,15,0.12],[4,19,0.14],[6,15,0.12],[8,12,0.14],[10,15,0.12],[12,19,0.14],[14,15,0.12]],[],[],[]]};
  const PAT_CRED_ABACAXI={sd:0.190,seed:10,hv:0.16,skv:0,
    prog:[[CH.Dm,CH.Dm],[CH.Bb,CH.C],[CH.Dm,CH.Dm],[CH.A,CH.A]],
    drop:[0,3,6,8,11,14],rim:[8],hat:[2,6,10,14],perc:[0,4,8,12],
    bass:[[0,-12,0.30],[3,-12,0.16],[6,-5,0.24],[8,-12,0.30],[11,-12,0.16],[14,-7,0.24]],
    licks:[[[8,0,0.5]],[],[[8,3,0.5]],[]]};
  PATTERNS.credNico=PAT_CRED_NICO;PATTERNS.credAbacaxi=PAT_CRED_ABACAXI;
  function unlock(){if(started)return;started=true;ensure();}
  // pausa: congela o relogio do audio (musica e efeitos param exatamente onde estavam)
  function pauseAll(){try{if(ctx&&ctx.state==="running")ctx.suspend();}catch(e){}
    if(curCustomKind&&customEls[curCustomKind])customEls[curCustomKind].pause();}
  function resumeAll(){try{if(ctx&&ctx.state==="suspended")ctx.resume();}catch(e){}
    if(curCustomKind&&customEls[curCustomKind]&&!muted)customEls[curCustomKind].play().catch(()=>{});}
  function tem(kind){return !!customEls[kind];}
  return{prepara,tem,pauseAll,resumeAll,unlock,playLoop,stopLoop,toggleMute,punch,kickHit,hurt,jumpSfx,power,select,ko,lose,fireSfx,chargeSfx,vinilSfx,setCustomTrack,setFuryTempo};
})();
document.getElementById('snd').addEventListener('click',e=>{e.preventDefault();AU.unlock();AU.toggleMute();});
addEventListener('touchstart',()=>{AU.unlock();tryFullscreen();},{passive:true});
addEventListener('mousedown',()=>AU.unlock(),{once:true,passive:true});
document.addEventListener('fullscreenchange',()=>setTimeout(fit,150));
document.addEventListener('webkitfullscreenchange',()=>setTimeout(fit,150));
// ================================================================================
let GAME_SPEED=0.72; // 1.0=normal, 0.7=mais lento, 1.3=mais rapido
const W=1280,H=720,cv=document.getElementById('gc'),cx=cv.getContext('2d');cx.imageSmoothingEnabled=false;
const IS_TOUCH = matchMedia('(hover:none)').matches || matchMedia('(pointer:coarse)').matches || ('ontouchstart' in window) || navigator.maxTouchPoints>0;
let EXTRA_SCALE=1;
// MODO DEV: os botoes 🛠️ (admin) e ⚙ (ajuste dos controles) so aparecem pra quem abriu com ?admin=1.
// Fica lembrado no aparelho; ?admin=0 desliga. Jogador comum nunca ve.
const DEV=(function(){let on=false;try{on=localStorage.getItem('mcs_dev')==='1';}catch(e){}
  const m=/[?&#]admin=([01])/.exec(location.search+location.hash);
  if(m){on=m[1]==='1';try{on?localStorage.setItem('mcs_dev','1'):localStorage.removeItem('mcs_dev');}catch(e){}}
  return on;})();
let HUD_R=0; // px do canvas que o lado direito do HUD recua pra nao ficar embaixo dos botoes ⏸ e ♪
function calcHudR(s){try{const st=document.getElementById('stage').getBoundingClientRect(),c=cv.getBoundingClientRect();
  const bx=(st.right-106-c.left)/s;HUD_R=Math.max(0,Math.min(140,Math.ceil(W-12-bx)));}catch(e){HUD_R=0;}}
let HUD_Y=0; // px do canvas cortados no topo pela tela "cobrir" (celular comprido): o HUD desce isso pra nao sumir
function hudTopo(){if(HUD_Y>0){cx.fillStyle="rgba(6,4,10,.62)";cx.fillRect(0,0,W,HUD_Y);cx.translate(0,HUD_Y);}}
function vpW(){return (window.visualViewport?window.visualViewport.width:innerWidth);}
function vpH(){return (window.visualViewport?window.visualViewport.height:innerHeight);}
function fit(){
  const hdr=document.querySelector('header'),ftr=document.querySelector('footer');
  if(IS_TOUCH && vpW()>vpH()){
    // celular/tablet em paisagem: prioridade máxima ao jogo, moldura mínima
    if(hdr)hdr.style.display='none';
    if(ftr)ftr.style.display='none';
    document.body.style.padding='0px';document.body.style.gap='0px';
    const stageEl=document.getElementById('stage'); if(stageEl)stageEl.style.padding='2px';
    const availH=vpH()-4, availW=vpW()-4;
    const containS=Math.min(availW/W,availH/H); // "caber" sem cortar nada
    const coverS=Math.max(availW/W,availH/H);    // "cobrir" tudo, mas pode cortar topo/base do HUD
    // limita o corte: cobre um pouco mais que "caber" pra aproveitar mais a tela
    // (o HUD e desenhado dentro do canvas - quanto maior o canvas exibido, maior o HUD tambem)
    const s=Math.min(coverS,availW/W,containS*1.16)*EXTRA_SCALE;
    const sCap=Math.min(s,3.0);
    cv.style.width=Math.round(W*sCap)+'px';cv.style.height=Math.round(H*sCap)+'px';
    HUD_Y=Math.max(0,Math.ceil((H*sCap-availH)/2/sCap));
    const stageBox=document.getElementById('stage');
    if(stageBox){stageBox.style.width=availW+'px';stageBox.style.height=availH+'px';
      stageBox.style.display='flex';stageBox.style.alignItems='center';stageBox.style.justifyContent='center';
      stageBox.style.overflow='hidden';}
    calcHudR(sCap);
    return;
  }
  HUD_Y=0;
  const chrome=(hdr?hdr.offsetHeight:0)+(ftr?ftr.offsetHeight:0)+56;
  const availH=vpH()-chrome;
  const s=Math.min(vpW()*0.97/W,availH/H,1.4);
  cv.style.width=Math.round(W*s)+'px';cv.style.height=Math.round(H*s)+'px';
  calcHudR(s);
}
fit();addEventListener('resize',fit);
if(IS_TOUCH){
  document.documentElement.style.height='100.3%';document.body.style.overflowY='scroll';
  const hideBar=()=>{window.scrollTo(0,1);setTimeout(()=>{document.body.style.overflowY='hidden';fit();},60);};
  hideBar();addEventListener('load',hideBar);setTimeout(hideBar,300);setTimeout(hideBar,900);
}
if(window.visualViewport)window.visualViewport.addEventListener('resize',fit);
// tela cheia nativa do navegador (some a barra de endereço) — precisa de gesto do usuário
function tryFullscreen(){
  if(!IS_TOUCH||document.fullscreenElement||document.webkitFullscreenElement)return;
  const el=document.documentElement;
  const req=el.requestFullscreen||el.webkitRequestFullscreen||el.mozRequestFullScreen||el.msRequestFullscreen;
  if(req){try{const p=req.call(el,{navigationUI:'hide'});
    // ja em tela cheia: trava na HORIZONTAL (Android/Chrome; iPhone ignora sem erro)
    const trava=()=>{try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{});}catch(e){}};
    if(p&&p.then)p.then(trava).catch(()=>{});else trava();}catch(e){}}
  setTimeout(fit,300);setTimeout(fit,700);
}
addEventListener('orientationchange',()=>{setTimeout(fit,150);setTimeout(fit,400);});
const SCALE_BACK=0.70,SCALE_FRONT=1.03;
function bandFor(pi){const ph=P.phases[pi];return{top:ph.bandTop,bottom:ph.bandBottom};}
// SISTEMA DE 2 FAIXAS: divide a band ao meio; faixa 0=baixo, faixa 1=cima.
// Golpes e projéteis só acertam quem está na MESMA faixa do atacante.
function getLane(y){const b=curBand();const mid=(b.top+b.bottom)/2;return y<mid?1:0;}
function sameLane(a,b){return getLane(a)===getLane(b);}
function curBand(){return bandFor(enemy.pi);}
const dscale=y=>{const b=curBand();return SCALE_BACK+(SCALE_FRONT-SCALE_BACK)*Math.max(0,Math.min(1,(y-b.top)/(b.bottom-b.top)));};
// ---------- mundo rolante ----------
const WORLD_LEN=1600; // comprimento PADRAO do corredor (fases sem worldLen proprio usam este)
let CUR_WORLD_LEN=WORLD_LEN; // comprimento da fase ATUAL - algumas fases podem ser mais curtas
let camX=0;
function screenX(wx){return wx-camX;}
// props do caminho (por fase) — geradas ao iniciar fase

// SUPER BOSS — 3 poderes extras (existiam no painel admin mas nunca tinham config nem disparo real)
let SB_PWR={notas:{dmg:14,cooldown:9},energia:{dmg:18,cooldown:11},paralisia:{dmg:6,dur:1.6,cooldown:14}};
function buildTrack(band){
  // TRILHA DA FASE: so COPOS DE CURA. O Uno saiu da rua e virou a FASE BONUS entre cenarios.
  // Os props ficam numa FILA e so entram no array "track" quando aparecem na tela (streamProps).
  const q=[];let wx=560,n=0;const im=IMG.props.copo,sc=PROP_CFG.copoScale;
  let laneCima=Math.round((band.top+band.bottom)/2-(band.bottom-band.top)*0.18);
  {const dg=(P.phases[phaseIndex]||{}).degrau;if(dg&&((laneCima>dg.yPlat-4&&laneCima<dg.yRua+4)||(dg.yMinFora!==undefined&&laneCima<dg.yMinFora)))laneCima=dg.yRua+10;} // nada na face do degrau nem na parede
  // CARRO UNO estacionado no inicio da fase: plataforma fixa (nao quebra) pra subir e dar SLIDE no teto
  // CARRO: com cenario longo fica ESTACIONADO 1:1 (preso no cenario, da pra subir e dar slide);
  // com fundo de 1 tela vira enfeite de fundo (drawCarroFundo). So nas fases de CARRO_FASES.
  if(CFG.UNO_NA_FASE&&IMG.props.uno&&(CFG.CARRO_FASES||[]).indexOf(phaseIndex)>=0&&ehPanorama(phaseIndex)){
    const u=IMG.props.uno.stages[0],us=CFG.CARRO_ESCALA||0.43,uw=u.w*us,cxw=CUR_WORLD_LEN*(0.2+Math.random()*0.5);
    q.push({type:"uno",wx:cxw,w:uw,h:u.h*us,topH:PROP_CFG.unoTopH*0.75,solidTop:true,grind:true,fixo:true,sc:us,
      y:laneCima,dmg:0,smokeT:0,hp:99,maxhp:99});}
  // SORTEIO DOS OBJETOS DA RUA (banco, caixa de som, lixeira): sem regra fixa.
  // 1) a fase pode ou NAO ter objetos (PROPS_CHANCE_FASE); 2) quantos, tambem e sorteado (PROPS_MIN..PROPS_MAX);
  // 3) tipo, lugar e faixa da calcada sorteados, com um espaco minimo entre eles pra nao empilhar.
  const k=CFG.ESCALA_PROPS||1,iniX=520,fimX=CUR_WORLD_LEN-360;
  const livre=(x,dist)=>q.every(o=>Math.abs(o.wx-x)>dist);
  const sorteiaX=(dist)=>{for(let t=0;t<30;t++){const x=iniX+Math.random()*(fimX-iniX);if(livre(x,dist))return x;}return null;};
  if(Math.random()<CFG.PROPS_CHANCE_FASE){
    const qtd=CFG.PROPS_MIN+Math.floor(Math.random()*(CFG.PROPS_MAX-CFG.PROPS_MIN+1));
    const pesos=[["banco",CFG.PESO_BANCO],["caixa",CFG.PESO_CAIXA],["latao",CFG.PESO_LATAO]],soma=pesos.reduce((a,p)=>a+p[1],0);
    for(let i=0;i<qtd;i++){
      const x=sorteiaX(CFG.PROPS_ESPACO);if(x===null)break;
      let r=Math.random()*soma,tipo="banco";for(const[pt,pw]of pesos){if(r<pw){tipo=pt;break;}r-=pw;}
      const yy=Math.random()<0.5?laneCima:band.bottom-20;
      if(tipo==="banco")q.push({type:"banco",wx:x,w:Math.round(200*k),h:Math.round(95*k),topH:44,topH2:88,solidTop:true,grind:true,y:yy,dmg:0,smokeT:0,hp:1});
      else{const cx_=tipo==="caixa",ci=cx_?IMG.props.caixaSom:IMG.props.lixeira,top_=(cx_?92:74);
        const wArte=ci&&ci.w?Math.round(top_*kZ()/(cx_?0.95:0.98)*ci.w/ci.h*0.85):0;
        q.push({type:cx_?"caixa":"latao",grind:!cx_,wx:x,w:wArte||Math.round((cx_?96:74)*k),h:Math.round((cx_?110:90)*k),topH:top_,solidTop:true,breakable:true,
          hp:CFG.OBST_HP,maxhp:CFG.OBST_HP,y:yy,dmg:0,smokeT:0,flashT:0});}}}
  // COPOS DE CURA: sorteio proprio (a cura nao pode depender da sorte dos objetos)
  {const nc=CFG.COPOS_MIN+Math.floor(Math.random()*(CFG.COPOS_MAX-CFG.COPOS_MIN+1));
   for(let i=0;i<nc;i++){const x=sorteiaX(160);if(x===null)break;
     q.push({type:"copo",wx:x,w:im.w*sc,h:im.h*sc,topH:0,solidTop:false,y:band.bottom-24,dmg:0,smokeT:0,hp:1});}}
  q.sort((a,b)=>a.wx-b.wx); // a fila precisa estar em ordem (entra na tela da esquerda pra direita)
  return q;
}
let track=[],trackQueue=[];
// CULLING DE CAMERA: entra quando aparece pela direita, sai da memoria quando some pela esquerda
function streamProps(){
  while(trackQueue.length&&trackQueue[0].wx-trackQueue[0].w/2<camX+W+40)track.push(trackQueue.shift());
  for(let i=track.length-1;i>=0;i--){const pr=track[i];if(pr.wx+pr.w/2<camX)track.splice(i,1);}
}
// COPO DE CURA: passou por cima (no chao, mesma profundidade) = bebe e cura
function pegaCopos(){const p=player;if(p.z>4)return;
  for(let i=track.length-1;i>=0;i--){const pr=track[i];if(pr.type!=="copo")continue;
    if(Math.abs(pr.wx-p.wx)<Math.max(40,pr.w*0.5)&&Math.abs(pr.y-p.y)<CFG.COPO_Y){
      track.splice(i,1);
      const cura=CFG.COPO_CURA;p.hp=Math.min(p.maxhp,p.hp+cura);
      addDmgNum(p.wx,p.y-190,"+"+cura,true,"#2ec27e");AU.select();
      for(let r=0;r<2;r++)rings.push({wx:pr.wx,y:pr.y,r:12+r*12,t:0.45,c:"#2ec27e"});}}
}
// ---------- save ----------
const SAVE="mcsupremo_save_v4";
let phaseIndex=0, powers={gritaria:false,kickes:false,saidai:false};
let difficulty="normal"; // facil | normal | dificil
let score=0,lastBonusPts=null;
const DIFF_MUL={facil:0.82,normal:1.0,dificil:1.22};
const DIFF_LABEL={facil:"FACIL",normal:"NORMAL",dificil:"DIFICIL"};
// =====================================================================
// FLUXO "DIRETO PRA ACAO"
// 1a vez: TITULO -> toque -> FASE 1 na hora (heroi padrao). Zero menus antes do 1o soco.
// A historia (elenco + mapa da turne) aparece na 1a chegada ao MUSEU, depois da 1a vitoria.
// Quem ja jogava: TITULO -> toque -> MUSEU (troca de MC continua no botao do museu).
// =====================================================================
const FLOW_KEY="mcs_flow_v1";
let flow={jogou:false,historia:false};
try{flow=Object.assign(flow,JSON.parse(localStorage.getItem(FLOW_KEY)||"{}"));}catch(e){}
try{if(localStorage.getItem(SAVE)){flow.jogou=true;flow.historia=true;}}catch(e){} // jogador antigo: nada muda
function flowSalva(){try{localStorage.setItem(FLOW_KEY,JSON.stringify(flow));}catch(e){}}
let introDestino="hub"; // pra onde a historia leva quando acaba
function loadSave(){try{const s=JSON.parse(localStorage.getItem(SAVE)||"null");
  if(s&&typeof s.phaseIndex==="number"){phaseIndex=Math.min(P.phases.length,Math.max(0,s.phaseIndex));
    powers=Object.assign({gritaria:false,kickes:false,saidai:false},s.powers||{});
    if(s.heroKey&&HEROES[s.heroKey])heroKey=s.heroKey;
    if(s.difficulty&&DIFF_MUL[s.difficulty])difficulty=s.difficulty;
    if(typeof s.score==="number")score=s.score;}}catch(e){}}
function saveNow(){try{localStorage.setItem(SAVE,JSON.stringify({phaseIndex,powers,heroKey,difficulty,score}));}catch(e){}}
function resetSave(){phaseIndex=0;score=0;powers={gritaria:false,kickes:false,saidai:false};try{localStorage.removeItem(SAVE);}catch(e){}}
loadSave();
let scene="intro",selIdx=0,selPrevL=0,selPrevR=0,loseIdx=0,losePrevU=0,losePrevD=0,selReturn="hub",introPage=0,epiPage=0,credScroll=0,credDone=false,resultType=null,grantedName=null,phaseResolved=false,fadeT=0.35;
const GRIT_CD=6,KICKES_CD=4,SAIDAI_CD=7;
function newPlayer(band){return{wx:200,y:band.bottom-46,z:0,vz:0,facing:1,state:"idle",anim:0,skAnim:0,
  atkT:0,atkHit:false,kickT:0,kickHit:false,shootT:0,shootCd:0,landT:0,skating:false,
  dashT:0,dashVX:0,dashHit:false,saidaiActive:false,standOn:null,airAtk:false,airHit:false,stompHit:false,jumpsUsed:0,
  hp:HERO().hp,maxhp:HERO().hp,hurtT:0,iframes:0,isInvincible:false,invincibleTimer:0,kbx:0,flashT:0,gritCd:0,kickesCd:0,saidaiCd:0,sizeMul:HERO().sizeMul||1,
  energy:0,maxEnergy:100,energyFull:false,guarding:false,guardT:0,grinding:false,grindSparkT:0,
  guardChain:0,guardChainT:0,airComboN:0,coyoteT:0,wasGrounded:true,bufPunchT:0,bufKickT:0,paralyzedT:0,
  presoT:0,__grabDmg:0,__grabByWx:0,skateComboT:0,
  comboStep:0,lastComboHit:0,atkFinisher:false,throwT:0,throwTgt:null,lastJumpTap:0,escapeUsed:false,escaping:false};}
function newEnemy(hp,pi,band){return{wx:1500,y:band.bottom-30,facing:-1,state:"approach",anim:0,windT:0,atkT:0,atkHit:false,
  z:0,vz:0,
  hurtT:0,cd:0,kbx:0,flashT:0,deadT:0,hp:hp,maxhp:hp,pi:pi,combo:0,guarding:false,guardT:0,fireCd:3.0,fireN:0,vinilCd:6.0,vinilT:0,vinilN:0,vulnT:0,vulnMax:1,recT:0,bossSeqOK:false,meleeType:null,stunT:0,enraged:false,
  sbNotasCd:0,sbEnergiaCd:0,sbParalisiaCd:0,grabCd:0};}
let player=newPlayer(bandFor(0)),enemy=newEnemy(100,0,bandFor(0)),shake=0,sparks=[],rings=[],shots=[],timeLeft=99,tacc=0;
// trilhas (arquivos em assets/musicas, mapa em js/dados.js); musica enviada pelo Admin numa fase tem prioridade
if(typeof MUSICAS!=="undefined")for(const k in MUSICAS)AU.setCustomTrack(k,MUSICAS[k]);
P.phases.forEach((ph,idx)=>{ if(ph.musicSrc) AU.setCustomTrack('p'+idx, ph.musicSrc); });
// ---------- input ----------
const keys={},press={jump:false,punch:false,kick:false,skate:false,shoot:false,mkey:false,confirm:false,reset:false};
const held={punch:false,kick:false,jump:false};
press.jumpTaps=[]; // timestamps (ms, relogio real) de cada toque em ⤴️ - nenhum toque se perde // botao ainda pressionado (slide = ⤴️ + 🦵 segurado)
let seq=[];
function pushSeq(k){const t=performance.now()/1000;seq.push({k,t});seq=seq.filter(s=>t-s.t<1.0);
  if(bossSeqWatch && seqEnds.apply(null, bossSeqWatch.tokens)){
    const w=bossSeqWatch; bossSeqWatch=null; clearTimeout(w.timerId); if(w.onSuccess) w.onSuccess();
  }
}
let bossSeqWatch=null;
function armBossSeqWatch(tokens, timeoutMs, onSuccess, onFail){
  if(bossSeqWatch){ clearTimeout(bossSeqWatch.timerId); }
  const timerId=setTimeout(()=>{ const w=bossSeqWatch; bossSeqWatch=null; if(w&&w.onFail) w.onFail(); }, timeoutMs);
  bossSeqWatch={tokens,onSuccess,onFail,timerId};
}
function clearBossSeqWatch(){ if(bossSeqWatch){ clearTimeout(bossSeqWatch.timerId); bossSeqWatch=null; } }
function seqEnds(){const a=arguments,n=seq.length;if(n<a.length)return false;
  for(let i=0;i<a.length;i++)if(seq[n-a.length+i].k!==a[i])return false;return true;}

// ---------- VIBRACAO (Android; iPhone ignora sem erro) ----------
// Intensidade pelo PESO do evento. Eventos no mesmo instante: vale o mais forte.
let _vibT=0,_vibPeso=0;
function vib(p){
  if(!CFG.VIBRAR||!navigator.vibrate)return;
  const peso=Array.isArray(p)?p.reduce((a,b)=>a+b,0):p;
  const now=performance.now();
  if(now-_vibT<45&&peso<=_vibPeso)return;   // nao empilha: evita zumbido continuo
  _vibT=now;_vibPeso=peso;
  try{navigator.vibrate(p);}catch(e){}
}
// >>> MC SUPREMO · CONFIG DOS 3 BOTOES (editavel no painel admin) <<<
// Escala do mundo deste jogo e maior que o default da skill (alcance de soco = 150px),
// por isso GRAB_X/GRAB_Y e janelas de tempo foram recalibrados.

function renderLegend(){} // sem legenda de teclado: controle e 100% touch por icones
document.querySelectorAll('#tc .tb').forEach(b=>{const k=b.dataset.k;
  const on=e=>{e.preventDefault();AU.unlock();
    b.classList.add('on');vib(6);          // resposta imediata: acende + tique curtinho
    if(k in held)held[k]=true;
    if(k==="jump"){press.jump=true;press.jumpTaps.push(performance.now());press.confirm=true;pushSeq('j');}
    else if(k==="punch"){press.punch=true;pushSeq('z');}
    else if(k==="kick"){press.kick=true;pushSeq('c');}};
  const off=e=>{e.preventDefault();b.classList.remove('on');if(k in held)held[k]=false;if(["up","down","left","right"].includes(k))keys[k]=0;};
  b.addEventListener('touchstart',on,{passive:false});b.addEventListener('touchend',off,{passive:false});
  b.addEventListener('touchcancel',off,{passive:false});b.addEventListener('mousedown',on);
  b.addEventListener('mouseup',off);b.addEventListener('mouseleave',off);});
// ---------- manche virtual ANALOGICO e FLUTUANTE ----------
// - Toque em qualquer ponto da metade esquerda: o manche nasce ali (nao precisa acertar o circulo).
// - Analogico: keys.ax/keys.ay de -1 a 1 (inclinar pouco = andar devagar, diagonais suaves).
// - Se o dedo passa do raio, a base acompanha (nunca "trava" no limite).
// - Cada dedo e rastreado pelo proprio identificador: segurar 🦵 ou 👊 nao confunde o manche.
(function(){
  const stick=document.getElementById('stick'),knob=document.getElementById('stickKnob');
  const zone=document.getElementById('stickZone'),tc=document.getElementById('tc');
  if(!stick||!knob)return;
  let active=false,pid=null,cx0=0,cy0=0,maxR=40,prevL=0,prevR=0;
  keys.ax=0;keys.ay=0;
  function resetKeys(){keys.left=0;keys.right=0;keys.up=0;keys.down=0;keys.ax=0;keys.ay=0;}
  function placeBase(){const r=tc.getBoundingClientRect(),sz=stick.offsetWidth||92;
    stick.style.left=(cx0-r.left-sz/2)+'px';stick.style.top=(cy0-r.top-sz/2)+'px';stick.style.bottom='auto';}
  function update(x,y){
    let dx=x-cx0,dy=y-cy0,dist=Math.hypot(dx,dy);
    const follow=maxR*1.15;
    if(dist>follow){const k=(dist-follow)/dist;cx0+=dx*k;cy0+=dy*k;placeBase();dx=x-cx0;dy=y-cy0;dist=follow;}
    const dead=maxR*0.14;let ax=0,ay=0;
    if(dist>dead){const m=Math.min(1,(dist-dead)/(maxR-dead));ax=dx/dist*m;ay=dy/dist*m;}
    keys.ax=ax;keys.ay=ay;
    keys.right=ax>0.35?1:0;keys.left=ax<-0.35?1:0;keys.down=ay>0.35?1:0;keys.up=ay<-0.35?1:0;
    if(keys.left&&!prevL)pushSeq('l');
    if(keys.right&&!prevR)pushSeq('r');
    prevL=keys.left;prevR=keys.right;
    const cl=Math.min(dist,maxR),n=dist||1;
    knob.style.transform=`translate(${dx/n*cl}px,${dy/n*cl}px)`;}
  function start(e){
    const t=e.changedTouches?e.changedTouches[0]:e;
    if(active&&e.changedTouches)return;             // ja tem um dedo no manche
    pid=e.changedTouches?t.identifier:null;
    const r=stick.getBoundingClientRect();maxR=Math.max(30,r.width*0.42);
    if(stick.contains(e.target)){cx0=r.left+r.width/2;cy0=r.top+r.height/2;}
    else{cx0=t.clientX;cy0=t.clientY;placeBase();}   // manche flutuante
    active=true;update(t.clientX,t.clientY);e.preventDefault();}
  function move(e){
    if(!active)return;
    const t=e.changedTouches?[...e.changedTouches].find(tt=>tt.identifier===pid):e;
    if(!t)return;update(t.clientX,t.clientY);e.preventDefault();}
  function end(e){
    if(!active)return;
    if(e.changedTouches&&![...e.changedTouches].some(tt=>tt.identifier===pid))return; // outro dedo soltou
    active=false;pid=null;resetKeys();knob.style.transform='translate(0,0)';
    stick.style.left='';stick.style.top='';stick.style.bottom='';}
  [stick,zone].forEach(el=>{if(!el)return;
    el.addEventListener('touchstart',start,{passive:false});el.addEventListener('touchmove',move,{passive:false});
    el.addEventListener('touchend',end,{passive:false});el.addEventListener('touchcancel',end,{passive:false});
    el.addEventListener('mousedown',start);});
  addEventListener('mousemove',e=>{if(active&&pid===null)move(e);});
  addEventListener('mouseup',e=>{if(active&&pid===null)end(e);});
  addEventListener('blur',()=>{if(active){active=false;pid=null;resetKeys();knob.style.transform='translate(0,0)';}});
})();
// ---------- painel de ajuste fino (só em toque) ----------
(function(){
  const toggle=document.getElementById('dbgToggle'),panel=document.getElementById('dbgPanel');
  if(!IS_TOUCH||!DEV){return;}
  toggle.style.display='flex';
  toggle.addEventListener('click',()=>{panel.style.display=panel.style.display==='block'?'none':'block';});
  const root=document.documentElement.style;
  const map=[
    ['s_stick','v_stick','--stick-size',''],
    ['s_knob','v_knob','--knob-size',''],
    ['s_stickpos','v_stickpos','--stick-pos',''],
    ['s_btn','v_btn','--btn-size',''],
    ['s_btnpos','v_btnpos','--btn-pos',''],
  ];
  map.forEach(([sliderId,outId,varName])=>{
    const el=document.getElementById(sliderId),out=document.getElementById(outId);
    el.addEventListener('input',()=>{root.setProperty(varName,el.value+'px');out.textContent=el.value;});
  });
  const extraSlider=document.getElementById('s_extra'),extraOut=document.getElementById('v_extra');
  extraSlider.addEventListener('input',()=>{extraOut.textContent=(+extraSlider.value).toFixed(2);EXTRA_SCALE=+extraSlider.value;fit();});
  document.getElementById('dbgCopy').addEventListener('click',()=>{
    const vals=map.map(([s])=>`${s}=${document.getElementById(s).value}`).join(', ')+`, extra=${extraSlider.value}`;
    document.getElementById('dbgOut').textContent=vals;
    if(navigator.clipboard)navigator.clipboard.writeText(vals).catch(()=>{});
  });
})();
const hubGoBtn=document.getElementById('hubGo');
const hubGoTap=e=>{e.preventDefault();press.confirm=true;};
hubGoBtn.addEventListener('touchstart',hubGoTap,{passive:false});
hubGoBtn.addEventListener('mousedown',hubGoTap);
const hubResetBtn=document.getElementById('hubReset');
let resetArm=false,resetArmT=0;
const hubResetTap=e=>{e.preventDefault();
  if(!resetArm){resetArm=true;resetArmT=3;hubResetBtn.textContent="TOQUE DE NOVO PRA CONFIRMAR";}
  else{resetArm=false;hubResetBtn.textContent="ZERAR PROGRESSO";resetSave();AU.select();
    selIdx=Math.max(0,HERO_KEYS.indexOf(heroKey));scene="select";fadeT=0.35;}};
hubResetBtn.addEventListener('touchstart',hubResetTap,{passive:false});
hubResetBtn.addEventListener('mousedown',hubResetTap);
const hubSwapBtn=document.getElementById('hubSwap');
const hubSwapTap=e=>{e.preventDefault();press.punch=true;AU.unlock();};
hubSwapBtn.addEventListener('touchstart',hubSwapTap,{passive:false});
hubSwapBtn.addEventListener('mousedown',hubSwapTap);
const hubDiffBtn=document.getElementById('hubDiff');
function syncDiffBtn(){if(hubDiffBtn)hubDiffBtn.textContent="DIFICULDADE: "+DIFF_LABEL[difficulty];}
const hubDiffTap=e=>{e.preventDefault();
  const order=["facil","normal","dificil"];
  difficulty=order[(order.indexOf(difficulty)+1)%order.length];
  syncDiffBtn();saveNow();AU.select&&AU.select();};
hubDiffBtn&&hubDiffBtn.addEventListener('touchstart',hubDiffTap,{passive:false});
hubDiffBtn&&hubDiffBtn.addEventListener('mousedown',hubDiffTap);
syncDiffBtn();
const padEl=document.getElementById('stick'),actEl=document.querySelector('.act');
// =====================================================================
// PAUSA - botao ⏸ na tela + pausa automatica quando o app vai pro fundo,
// quando a tela perde o foco (ligacao/notificacao) ou o celular gira pra vertical.
// Nunca despausa sozinho: o jogador volta no tempo dele tocando ▶ CONTINUAR.
// =====================================================================
let paused=false;
function pausar(motivo){
  if(paused||!(scene==="phase"||scene==="bonus"))return;
  paused=true;
  // solta tudo: nada fica "preso" (andando sozinho, slide segurado) quando voltar
  for(const k in held)held[k]=false;
  keys.ax=0;keys.ay=0;keys.left=keys.right=keys.up=keys.down=0;
  press.jump=press.punch=press.kick=false;press.jumpTaps.length=0;
  document.querySelectorAll('#tc .tb.on').forEach(b=>b.classList.remove('on'));
  shake=0;AU.pauseAll();
  document.getElementById('pMot').textContent=motivo||"";
  const ps=document.getElementById('pSai');ps.classList.remove('conf');ps.textContent="🏠 SAIR PRO MUSEU";
  document.getElementById('pauseOv').classList.add('show');}
function despausar(){
  if(!paused)return;paused=false;
  document.getElementById('pauseOv').classList.remove('show');
  AU.unlock();AU.resumeAll();last=performance.now();}
(function(){
  const pb=document.getElementById('pauseBtn'),pv=document.getElementById('pVolta'),ps=document.getElementById('pSai');
  const tap=(el,fn)=>{el.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();fn();},{passive:false});
    el.addEventListener('click',e=>{e.preventDefault();fn();});};
  tap(pb,()=>{vib(8);pausar("");});
  tap(pv,()=>{vib(8);despausar();});
  // sair pede 2 toques (evita perder a fase por toque acidental)
  tap(ps,()=>{
    if(!ps.classList.contains('conf')){ps.classList.add('conf');ps.textContent="TOQUE DE NOVO P/ SAIR";return;}
    paused=false;document.getElementById('pauseOv').classList.remove('show');
    AU.resumeAll();AU.stopLoop();bonus=null;mooks=[];waveAtiva=false;toHub();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pausar("O JOGO FOI PRO FUNDO");});
  addEventListener('pagehide',()=>pausar("O JOGO FOI PRO FUNDO"));
  addEventListener('blur',()=>pausar("A TELA PERDEU O FOCO"));
  try{const mq=matchMedia('(max-width:820px) and (orientation:portrait)');
    const f=e=>{if(e.matches)pausar("GIRE O CELULAR PRA VOLTAR");};
    mq.addEventListener?mq.addEventListener('change',f):mq.addListener(f);}catch(e){}
})();
function syncTouchUI(){
  {const sb=document.getElementById('shareBtn');if(sb)sb.classList.toggle('show',scene==="result"&&resultType!=="lose"&&!!notaFase&&(performance.now()-resultT)>900);}
  {const pb=document.getElementById('pauseBtn');if(pb)pb.style.display=((scene==="phase"||scene==="bonus")&&!paused)?'flex':'none';}
  if(tut.ativa&&!(scene==="phase"||scene==="bonus"))tutFecha();
  const combatUI = scene==="phase"||scene==="bonus";
  const loseMenu = scene==="result" && resultType==="lose";
  if(padEl)padEl.style.display=(scene==="select"||loseMenu)?'block':(combatUI?'block':'none');
  if(hubSwapBtn){if(scene==="hub"||scene==="select"||loseMenu){hubSwapBtn.classList.add('show');
      hubSwapBtn.textContent=loseMenu?"► OPCAO":((scene==="select")?"► TROCAR":"TROCAR DE MC");}
    else hubSwapBtn.classList.remove('show');}
  if(hubDiffBtn){if(scene==="hub")hubDiffBtn.classList.add('show');else hubDiffBtn.classList.remove('show');}
  document.body.classList.toggle('hub-scene', !combatUI);
  if(padEl)padEl.style.display=combatUI?'block':'none';
  if(actEl)actEl.style.display=combatUI?'grid':'none';
  if(scene==="hub"){hubResetBtn.classList.add('show');
    if(resetArm){resetArmT-=1/60;if(resetArmT<=0){resetArm=false;hubResetBtn.textContent="ZERAR PROGRESSO";}}
  }else{hubResetBtn.classList.remove('show');resetArm=false;hubResetBtn.textContent="ZERAR PROGRESSO";}
  if(scene==="intro"){hubGoBtn.classList.add('show');
    hubGoBtn.textContent = introPage===0 ? (flow.jogou?"ENTRAR ►":"JOGAR ►") : "IR PRO MUSEU ►";}
  else if(scene==="hub"){hubGoBtn.classList.add('show');
    hubGoBtn.textContent = phaseIndex<P.phases.length ? "ENTRAR ►" : "RECOMEÇAR";}
  else if(scene==="select"){hubGoBtn.classList.add('show');hubGoBtn.textContent="CONFIRMAR ►";}
  else if(scene==="result"){hubGoBtn.classList.add('show');
    hubGoBtn.textContent=(resultType==="lose")?(LOSE_OPTS[loseIdx].label+" ►"):"CONTINUAR ►";}
  else if(scene==="epilogue"){hubGoBtn.classList.add('show');hubGoBtn.textContent="CONTINUAR ►";}
  else if(scene==="credits"){hubGoBtn.classList.add('show');hubGoBtn.textContent="PULAR ►";}
  else hubGoBtn.classList.remove('show');
}
// ---------- fluxo ----------
// =====================================================================
// NOTA DA FASE (S/A/B/C) + RECORDES + CARD PRO WHATSAPP
// Pesos: dano sofrido 35% · tempo 25% · combo maximo 25% · pontos da fase 15%.
// Faixas: S>=90 · A>=75 · B>=55 · C. Usou CONTINUAR na fase = nota maxima A.
// =====================================================================
const est={t:0,dano:0,pts0:0,cont:false};
let notaFase=null,resultT=0,cardBlob=null,cardCarimbou=false;
const REC_KEY="mcs_recordes_v1";
let recordes={};try{recordes=JSON.parse(localStorage.getItem(REC_KEY)||"{}")||{};}catch(e){recordes={};}
const RANK={S:4,A:3,B:2,C:1};
const NOTA_COR={S:"#ffcf33",A:"#2ec27e",B:"#5aa9ff",C:"#bdb3a0"};
const NOTA_GRITO={S:"SUPREMO!",A:"MANDOU BEM!",B:"BOA!",C:"DÁ PRA MAIS!"};
function calculaNota(){
  const maxhp=player.maxhp||100,dp=est.dano/maxhp*100;
  const sD=100*(1-Math.min(1,dp/100));
  const par=CFG.NOTA_TEMPO_PAR,sT=est.t<=par?100:Math.max(0,100*(1-(est.t-par)/(par*1.5)));
  const sC=Math.min(100,combo.max/CFG.NOTA_COMBO_ALVO*100);
  const pts=Math.max(0,score-est.pts0),sP=Math.min(100,pts/(CFG.NOTA_PONTOS_ALVO*(1+phaseIndex*0.25))*100);
  const tot=Math.round(0.35*sD+0.25*sT+0.25*sC+0.15*sP);
  let n=tot>=90?"S":tot>=75?"A":tot>=55?"B":"C";
  if(est.cont&&n==="S")n="A";   // continue: S fica pra quem passa direto
  return {n,tot,dp:Math.round(dp),t:est.t,combo:combo.max,cont:est.cont};}
function registraNota(pi){
  const nf=calculaNota();nf.pi=pi;nf.heroi=HERO().title;
  const r=recordes[pi];
  nf.recorde=!r||RANK[nf.n]>RANK[r.n]||(RANK[nf.n]===RANK[r.n]&&nf.tot>r.tot);
  if(nf.recorde){recordes[pi]={n:nf.n,tot:nf.tot};try{localStorage.setItem(REC_KEY,JSON.stringify(recordes));}catch(e){}}
  notaFase=nf;cardBlob=null;cardCarimbou=false;}
function entraResultado(){resultT=performance.now();cardBlob=null;cardCarimbou=false;
  if(notaFase)geraCard().then(b=>{cardBlob=b;}).catch(()=>{});} // pre-gera: o toque em compartilhar abre na hora
let ckpt=null;
// =====================================================================
// CARREGAMENTO POR FASE
// Na abertura baixa so o essencial (herois, viloes, museu, musica do titulo).
// Fundo e musica de cada fase sao baixados quando ela vai ser jogada; o museu
// ja pede os da PROXIMA fase enquanto o jogador esta la. Cenas finais so no fim.
// =====================================================================
function preparaFase(i){
  i=Math.max(0,Math.min(P.phases.length-1,i|0));
  const I=IMG.phases[i];if(I&&I.bg&&I.bg._carregar)I.bg._carregar();
  AU.prepara("p"+i);
  if(i>=P.phases.length-1){ // ultima fase: adianta o final (epilogo, creditos e trilha)
    [IMG.abacaxiParty,IMG.nicoBeach,IMG.nicoNessa].forEach(im=>im&&im._carregar&&im._carregar());
    AU.prepara("creditos");}
}
function startPhase(){setTimeout(()=>{try{capangaSet(phaseIndex,0);capangaSet(phaseIndex,1);}catch(e){}},60);preparaFase(phaseIndex);ckpt=null;montaPostes();Object.assign(est,{t:0,dano:0,pts0:score,cont:false});combo.max=0;notaFase=null;{const fph=P.phases[phaseIndex]||{};CUR_WORLD_LEN=fph.faseLen||Math.max(fph.worldLen||WORLD_LEN,CFG.FASE_LEN||0);}const band=bandFor(phaseIndex);player=newPlayer(band);enemy=newEnemy(P.phases[phaseIndex].hp,phaseIndex,band);enemy.state="espera";enemy.wx=CUR_WORLD_LEN+400;
  trackQueue=buildTrack(band);track=[];bonus=null;lastBonusPts=null;mooks=[];hudAlvo=null;comboReset();AU.setFuryTempo(false);
  camX=0;sparks=[];rings=[];shots=[];fires=[];vinis=[];seq=[];timeLeft=99;
  invader=null;bannerT=0;agendaInvasao(true);planejaOndas();phaseResolved=false;scene="phase";fadeT=0.35;}
// =====================================================================
// CONTINUAR DO INICIO DA ONDA
// Ao perder, o jogador volta alguns passos antes da ultima onda que comecou
// (ou direto na arena do chefe), com vida cheia e o cronometro zerado.
// Penalidade justa: os pontos voltam pro valor do inicio daquela onda.
// =====================================================================
function continuaDaOnda(){
  const c=ckpt;if(!c){startPhase();return;}
  const e0=Object.assign({},est),cm=combo.max;
  startPhase();ckpt=c;score=c.score;Object.assign(est,e0);est.cont=true;combo.max=cm;
  ondaIdx=c.onda;
  // recua ~200px: o jogador respira e caminha ate a trava, a onda comeca quando ele chega
  camX=Math.max(0,c.x-200);player.wx=camX+W*0.36;
  trackQueue=trackQueue.filter(pr=>pr.wx-pr.w/2>camX+W*0.36+60); // nada nascendo em cima do MC
  avisoHUD(c.boss?"DE VOLTA PRO CHEFE!":"CONTINUA! ONDA "+(c.onda+1)+"/"+ondas.length);}
function toHub(){
  if(!flow.historia){scene="intro";introPage=1;introDestino="hub";fadeT=0.35;return;} // 1a vez no museu: elenco + mapa da turne
  scene="hub";fadeT=0.35;}
function resolveWin(){if(phaseResolved)return;phaseResolved=true;const ph=P.phases[phaseIndex];
  grantedName=null;
  registraNota(phaseIndex);
  const faseVencida=phaseIndex+1;phaseIndex++;saveNow();
  resultType=(phaseIndex>=P.phases.length)?"final":"win";
  if(resultType==="win"){startUnoBonus(ph,faseVencida);return;}   // entre cenarios de POA: bonus do Uno
  scene="result";fadeT=0.35;AU.stopLoop();AU.ko();entraResultado();
}
// (tela antiga de vitoria do BossTouch substituida pelo card de recorde; mantida so por compatibilidade)
function mostraVitoriaBoss(ph,faseVencida){
  if(false&&window.BossTouch && ph && ph.chefe){
    BossTouch.showVictoryScreen({bossName: ph.name || 'o Chefe',phase: faseVencida,gameName: 'MC SUPREMO',url: location.href});
  }
}
function resolveLose(){if(phaseResolved)return;phaseResolved=true;resultType="lose";loseIdx=0;
  LOSE_OPTS=ckpt?[OPT_CONTINUAR].concat(LOSE_BASE):LOSE_BASE; // CONTINUAR vem primeiro e ja selecionado
  scene="result";fadeT=0.35;AU.stopLoop();AU.lose();}
// ---------- combate ----------
let hitStopT=0, flashOverlay=0; let dmgNums=[];
function hitSpark(wx,y,c){for(let i=0;i<7;i++)sparks.push({wx,y,vx:(Math.random()-.5)*260,vy:(Math.random()-.7)*260,t:0.26,c:c||"#ffe36a"});}
function impactBurst(wx,y,c,big){
  const n=big?14:9, len=big?46:30;
  for(let i=0;i<n;i++){
    const ang=(i/n)*6.283+Math.random()*0.3;
    bursts.push({wx,y,ang,len,t:big?0.24:0.18,maxT:big?0.24:0.18,c:c||"#ffe36a"});
  }
  hitSpark(wx,y,c);
  if(big){flashOverlay=Math.max(flashOverlay,0.22);}
}
function addDmgNum(wx,y,val,crit,cor){dmgNums.push({wx,y,val,t:0.75,vy:-120,crit:!!crit,cor:cor});}
function doHitStop(ms){hitStopT=Math.max(hitStopT,ms);}
let bursts=[];
function inReach(a,d,reach,depth){const dx=d.wx-a.wx;return Math.sign(dx)===a.facing&&Math.abs(dx)<reach*kX()&&Math.abs(d.y-a.y)<depth&&sameLane(a.y,d.y);}
// ---- lista de alvos: o vilao da fase e, se estiver na tela, o chefe invasor ----
function alvos(){const a=[];
  if(enemy&&enemy.state!=="dead"&&enemy.state!=="espera")a.push(enemy);
  for(const m of mooks)if(m.state!=="dead")a.push(m);
  if(invader&&invader.state!=="dead"&&invader.state!=="saindo")a.push(invader);
  return a;}
// escolhe o alvo valido mais proximo dentro do alcance do golpe
// Filtro justo pra tela de toque: colado em X mas longe na profundidade da calcada = soco no vazio
function noQuadranteDoSoco(p,t){
  const dx=t.wx-p.wx,dy=t.y-p.y,dz=(t.z||0)-(p.z||0);
  const aFrente=Math.abs(dx)<1||Math.sign(dx)===p.facing;
  return aFrente&&Math.abs(dx)<=CFG.PUNCH_RANGE_X*kX()&&Math.abs(dy)<=CFG.PUNCH_RANGE_Y&&Math.abs(dz)<=CFG.PUNCH_RANGE_Z;}
function alvoDoSoco(p){let best=null,bd=1e9;
  for(const t of alvos()){if(t.grabbed||!noQuadranteDoSoco(p,t))continue;
    const d=Math.abs(t.wx-p.wx);if(d<bd){bd=d;best=t;}}
  return best;}
function alvoEmAlcance(p,reach,depth){let best=null,bd=1e9;
  for(const t of alvos()){if(!inReach(p,t,reach,depth))continue;
    const d=Math.abs(t.wx-p.wx);if(d<bd){bd=d;best=t;}}
  return best;}
function emSequencia(e){return e.state==="breathwind"||e.state==="breath"
  ||e.state==="vinilwind"||e.state==="vinil";}
function damageEnemy(dmg,kb,stun,tag,alvo,kind){const e=alvo||enemy;
  if(!e||e.state==="dead"||e.state==="espera")return;
  if(e.getupT>0&&!e.grabbed)return;                         // deitado/levantando: invulneravel
  if((kb||0)>=CFG.FINISHER_KB)e.derrubado=true;               // golpe forte derruba: vai ficar deitado ao cair
  hudAlvo=e;
  // DEFESA do vilao/boss (so fora da brecha)
  if(e.guarding&&e.vulnT<=0&&e.state!=="dead"){
    shake=Math.max(shake,4);
    impactBurst((player.wx+e.wx)/2,e.y-100,"#5599ff",false);
    addDmgNum(e.wx,e.y-140,"GUARD!",false,"#5599ff");
    doHitStop(0.03);
    e.guarding=false;e.guardT=0;
    if(kind==='chute')e.kbx=(Math.sign(e.wx-player.wx)||1)*(kb||190)*0.8; // 🦵 abre espaco mesmo na guarda
    return;
  }
  // (anti-spam removido: o combo automatico de 3 socos e o golpe base do jogo)
  // LOGICA SIMPLES: o boss so leva dano DEPOIS de acertar o combo dele (brecha
  // aberta, vulnT>0). Fora da brecha, qualquer golpe so bate e nao faz nada -
  // precisa acertar a sequencia de novo pra abrir outra chance de dano.
  const isBossFight=(e===enemy && P.phases[e.pi] && P.phases[e.pi].chefe);
  // Boss recebe dano SEMPRE. Quando paralisado (stunT>0) fica imóvel e o dano é DOBRADO.
  if(isBossFight && e.stunT>0) dmg=Math.round(dmg*2);
  AU.hurt();e.hp-=dmg;e.flashT=0.14;shake=Math.max(shake,7);score+=dmg*10;
  vib((kb||0)>=1000||dmg>=10?28:12);   // hit leve 12ms · hit final/arremesso 28ms
  comboHit();if(kind==='chute')tut.chutou=true;
  e.kbx=(Math.sign(e.wx-player.wx)||1)*(kb||190)*(CFG.KB_MUL||1.5);
  const big=(dmg>=20);
  impactBurst((player.wx+e.wx)/2,e.y-120,big?"#fff2c0":"#ffe36a",big);
  addDmgNum(e.wx,e.y-160,dmg,big);
  doHitStop(big?0.09:0.045);
  e.combo=tag==="combo"?(e.combo||0)+1:0;
  if(e.hp<=0){e.hp=0;e.state="dead";e.deadT=1.4;doHitStop(0.14);flashOverlay=Math.max(flashOverlay,0.3);
    if(e.mook){score+=200;addDmgNum(e.wx,e.y-210,"+200",false,"#ffe36a");}
    if(e===enemy){clearBossSeqWatch();hideBossSeqHint();if(window.BossTouch)BossTouch.stopHitCounter();}}
  else{
    // JANELA DE 5s: enquanto a brecha estiver aberta ela NAO fecha ao levar
    // golpe - o vilao cambaleia mas continua vulneravel ate o tempo acabar.
    if(e.vulnT>0){
      e.state="hurt";e.hurtT=Math.min(stun||0.26,0.18);
      e.__voltaBrecha=true;   // ao sair do "hurt" volta pra "recuperando"
    } else {
      e.state="hurt";e.hurtT=stun||0.26;e.vulnT=0;
      if(e===enemy){clearBossSeqWatch();hideBossSeqHint();e.bossSeqOK=false;e.meleeType=null;}
    }
  }}
// PORTAO UNICO DE DANO: fogo, disco, soco, chute e agarrao dos viloes passam por aqui
function derrubaMC(ox){const p=player;
  p.seqHits=0;p.downT=CFG.QUEDA_CHAO;p.hurtT=0;p.kbx=(Math.sign(p.wx-ox)||-1)*420;
  p.isInvincible=true;p.invincibleTimer=CFG.QUEDA_CHAO/GAME_SPEED+CFG.LEVANTA_INVENCIVEL; // no chao + levantando: ninguem bate
  p.atkT=p.kickT=p.throwT=p.segT=0;p.grindMode=null;p.grinding=false;p.airAtk=false;p.escaping=false;
  shake=Math.max(shake,12);vib([40,30,60]);addDmgNum(p.wx,p.y-200,"CAIU!",true,"#ff5a4a");}
function damagePlayer(dmg,deWx){if(player.hurtT>0||player.iframes>0||player.isInvincible||player.downT>0)return;
  if(player.guarding&&player.z===0){
    // REGRA: guarda nao pode ser segurada pra sempre. A cada bloqueio consecutivo
    // conta um "elo"; no 4o elo seguido a guarda quebra (dano reduzido passa e cambaleia).
    player.guardChain=(player.guardChain||0)+1;player.guardChainT=2.0;
    if(player.guardChain>=4){
      player.guardChain=0;player.guarding=false;player.guardT=0;
      const chip=Math.max(1,Math.round(dmg*0.35));
      AU.hurt();player.hp-=chip;player.flashT=0.12;
      const oxb=(deWx===undefined)?enemy.wx:deWx;
      shake=Math.max(shake,7);player.kbx=(Math.sign(player.wx-oxb)||-1)*110;player.hurtT=0.2;
      impactBurst((player.wx+oxb)/2,player.y-90,"#ff5252",false);
      addDmgNum(player.wx,player.y-150,"GUARDA QUEBRADA!",false,"#ff5252");
      if(player.hp<=0){player.hp=0;resolveLose();}
      return;
    }
    shake=Math.max(shake,5);
    impactBurst((player.wx+(deWx||player.wx))/2,player.y-80,"#5599ff",false);
    addDmgNum(player.wx,player.y-120,"GUARD!",false,"#5599ff");
    return;
  }
  AU.hurt();player.hp-=dmg;player.flashT=0.12;vib([30,40,30]);comboFecha(true);tut.levouDano=true;est.dano+=dmg; // levou dano: padrao duplo, diferente de bater
  const ox=(deWx===undefined)?enemy.wx:deWx;
  shake=Math.max(shake,8);player.kbx=(Math.sign(player.wx-ox)||-1)*170;player.hurtT=0.32;
  if(player.throwTgt){player.throwTgt.grabbed=false;player.throwTgt=null;player.segT=0;player.throwT=0;}
  // ANTI-PRISAO: 3 golpes seguidos (ou um muito forte) derrubam o MC; ele levanta invencivel
  {const now=performance.now();player.seqHits=(now-(player.ultHitT||0)<CFG.QUEDA_JANELA*1000)?(player.seqHits||0)+1:1;player.ultHitT=now;
   if(player.seqHits>=CFG.QUEDA_HITS||dmg>=CFG.QUEDA_DANO)derrubaMC(ox);}
  impactBurst((player.wx+ox)/2,player.y-120,"#ff9b7a",dmg>=15);
  addDmgNum(player.wx,player.y-160,dmg,false);
  doHitStop(dmg>=15?0.07:0.04);
  if(player.hp<=0){player.hp=0;resolveLose();}}
// ================= JATOS DE FOGO (viloes-dragao) =================
// >>> BLOCO DE AJUSTE FINO: mexa so aqui pra calibrar a dificuldade <<<
//  dmg      = energia tirada por jato que acerta
//  speed    = velocidade do jato (px/s). Mais alto = menos tempo de reacao
//  telegraph= aviso na tela ANTES do primeiro jato (segundos)
//  gap      = intervalo entre um jato e o proximo da mesma sequencia
//  cooldown = descanso do vilao depois de terminar a sequencia
//  pattern  = ordem dos jatos:
//               "low"  -> jato rasteiro, pega a faixa inteira. ESCAPA PULANDO.
//               "lane" -> coluna de fogo mirada na sua profundidade atual.
//                         ESCAPA ANDANDO PRA CIMA/BAIXO (sair da faixa).
const FIRE={dmg:9,speed:440,life:3.0,telegraph:0.80,gap:0.55,cooldown:5.0,
  minRange:160,maxRange:1050,lowZ:80,laneHalf:38,hitHalfX:48,reaim:false,
  pattern:["low","lane","low"]};
// configuracao por vilao (sobrescreve o FIRE acima)
P.phases[0].fire={pattern:["low","lane","low"],telegraph:0.90,gap:0.62,cooldown:5.8,
  dmg:7,speed:400,minRange:150,maxRange:1000};                 // JAY (primeiro contato: leve)
(function(){ // todos os chefes cospem fogo; o DJ e o mais pesado, OLD T e o mais rapido
  const iDJ=P.phases.findIndex(ph=>ph.name==="MAZAROPE");
  if(iDJ>=0)P.phases[iDJ].fire={pattern:["lane","low","lane","low","low"],telegraph:0.70,
    gap:0.50,cooldown:5.0,dmg:11,speed:480,minRange:150,maxRange:1100,reaim:true,recover:1.5};
  const iOLDT=P.phases.findIndex(ph=>ph.name==="MÃO DE PEDRA");
  if(iOLDT>=0)P.phases[iOLDT].fire={pattern:["low","lane","low"],telegraph:0.65,gap:0.48,
    cooldown:5.4,dmg:9,speed:520,minRange:150,maxRange:1050,recover:1.5};
})();

// ================= DISCOS DE VINIL =================
// >>> AJUSTE FINO DOS DISCOS <<<
//  kinds: "lane" -> disco na altura do peito, mirado na sua faixa de
//                   profundidade. ESCAPA saindo da faixa (cima/baixo).
//         "low"  -> disco quicando rente ao chao. ESCAPA PULANDO.
//  Todo disco pode ser DESTRUIDO com soco, chute, manobra aerea ou tiro.
const VINIL={dmg:8,speed:520,life:3.4,telegraph:0.55,gap:0.42,cooldown:5.4,
  minRange:200,maxRange:1150,lowZ:78,laneHalf:40,hitHalfX:44,recover:1.6,
  pattern:["lane","low","lane"]};
(function(){
  const iJAY=P.phases.findIndex(ph=>ph.name==="JAY");
  const iDJ =P.phases.findIndex(ph=>ph.name==="MAZAROPE");
  const iOLDT=P.phases.findIndex(ph=>ph.name==="MÃO DE PEDRA");
  if(iJAY>=0)P.phases[iJAY].vinil={pattern:["lane","low"],telegraph:0.62,gap:0.50,
    cooldown:6.2,dmg:7,speed:470,recover:1.8};
  if(iDJ >=0)P.phases[iDJ ].vinil={pattern:["lane","low","lane","low"],telegraph:0.48,
    gap:0.38,cooldown:4.6,dmg:9,speed:560,recover:1.4};
  // OLD T: discos de vinil da colecao dele - padrao intermediario entre JAY e DJ
  if(iOLDT>=0)P.phases[iOLDT].vinil={pattern:["lane","low","lane"],telegraph:0.55,
    gap:0.44,cooldown:5.6,dmg:8,speed:500,recover:1.6};
})();
// TODOS OS VILOES USAM TODOS OS MOVIMENTOS: quem nao tiver fogo/disco proprio
// recebe agora um padrao base, entao nenhuma fase fica so no corpo-a-corpo.
(function(){
  P.phases.forEach((ph,i)=>{
    if(!ph.fire)  ph.fire ={pattern:["low","lane","low"],telegraph:0.80,gap:0.55,
      cooldown:5.6,dmg:7,speed:440,minRange:150,maxRange:1000,recover:1.6};
    if(!ph.vinil) ph.vinil={pattern:["lane","low","lane"],telegraph:0.58,gap:0.46,
      cooldown:5.8,dmg:7,speed:500,recover:1.6};
  });
})();
function vinilCfg(pi){const v=P.phases[pi]&&P.phases[pi].vinil;return v?Object.assign({},VINIL,v):null;}
const VILLAIN_ICON={'JAY':'🏀','MAZAROPE':'⚽','PM DE BONÉ':'🪓','O SKATER':'🔥',
  'OLD T':'💨','MÃO DE PEDRA':'💿','WALESKA':'💇','CABEÇA DE ABACAXI':'🎤'};
function iconForPhase(pi){const n=P.phases[pi]&&P.phases[pi].name;return VILLAIN_ICON[n]||'🔥';}
let vinis=[];
function spawnVinil(e,kind,cfg){
  const ox=e.wx+e.facing*54;
  if(kind==="lane"&&(cfg.reaim||e.aimY===undefined))e.aimY=aimLane(e,cfg);
  vinis.push({pi:e.pi,wx:ox,y:(kind==="lane")?e.aimY:e.y,dir:e.facing,vx:e.facing*cfg.speed,
    kind,t:cfg.life,age:0,hit:false,morto:false,ang:0,
    dmg:cfg.dmg,lowZ:cfg.lowZ,laneHalf:cfg.laneHalf,hx:cfg.hitHalfX,
    cor:(kind==="lane")?"#c9a0ff":"#ffb03a"});
  AU.vinilSfx();
}
// soco/chute/manobra quebram os discos que estiverem no alcance
function quebraVinis(p,reach){
  let n=0;
  for(const v of vinis){
    if(v.morto||v.hit)continue;
    if(Math.abs(v.wx-p.wx)>reach*0.85)continue;
    if(Math.abs(v.y-p.y)>78)continue;
    v.morto=true;n++;
    impactBurst(v.wx,v.y-(v.kind==="low"?40:104),"#e6d6ff",false);
    addDmgNum(v.wx,v.y-150,"QUEBROU",false);
    AU.punch();shake=Math.max(shake,5);
  }
  return n;
}
// golpe acerta o carro Uno: cada hit aumenta o dano ate o maximo (destruido), depois so da feedback
function unoExplode(pr){
  if(pr.exploded)return;
  pr.exploded=true;
  shake=Math.max(shake,30);
  flashOverlay=Math.max(flashOverlay,0.7);
  AU.ko();
  for(let i=0;i<24;i++){
    const ang=Math.random()*Math.PI*2,sp=300+Math.random()*550;
    sparks.push({wx:pr.wx,y:pr.y-pr.h/2,
      vx:Math.cos(ang)*sp,vy:-Math.abs(Math.sin(ang))*sp*0.8,
      t:1.4+Math.random()*0.5,c:["#ff8c00","#ffcf33","#ff3300","#bbb"][Math.floor(Math.random()*4)]});
  }
  rings.push({wx:pr.wx,y:pr.y,r:0,maxR:640,t:0.8,col:"#ff8c00"});
  rings.push({wx:pr.wx,y:pr.y,r:0,maxR:420,t:0.55,col:"#ffcf33"});
  // (sem auto-dano: a explosao do Uno nunca tira vida do MC)
  if(bonus&&pr===bonus.car)bonus.pts+=CFG.UNO.ptsDestroy;
}
function quebraObst(pr){
  pr.hp--;pr.flashT=0.12;vib(pr.hp>0?10:25);pr.dmg=pr.hp<=pr.maxhp/3?2:(pr.hp<=pr.maxhp*2/3?1:0);
  shake=Math.max(shake,5);AU.punch();
  for(let i=0;i<6;i++)sparks.push({wx:pr.wx,y:pr.y-pr.topH*0.6,vx:(Math.random()-.5)*300,vy:-80-Math.random()*200,t:0.4,c:pr.type==="caixa"?"#333":"#8a9a8a"});
  if(pr.hp>0)return;
  tut.quebrou=true;const i=track.indexOf(pr);if(i>=0)track.splice(i,1);
  AU.kickHit();shake=Math.max(shake,10);impactBurst(pr.wx,pr.y-pr.topH*0.5,"#fff2c0",true);
  for(let k=0;k<14;k++)sparks.push({wx:pr.wx,y:pr.y-pr.topH*0.5,vx:(Math.random()-.5)*520,vy:-150-Math.random()*300,t:0.7,c:["#222","#444","#ffcf33","#2ec27e","#c0392b"][k%5]});
  if(Math.random()<CFG.OBST_DROP_CURA){const im=IMG.props.copo,sc=PROP_CFG.copoScale;
    track.push({type:"copo",wx:pr.wx,w:im.w*sc,h:im.h*sc,topH:0,solidTop:false,y:pr.y,dmg:0,smokeT:0,hp:1});
    addDmgNum(pr.wx,pr.y-150,"COPO!",false,"#2ec27e");}
  else{score+=300;addDmgNum(pr.wx,pr.y-150,"+300",false,"#ffe36a");}
}
function bateNoCarro(p,reach){
  let hit=false;
  for(const pr of track.slice()){
    if(pr.breakable){
      const dx=pr.wx-p.wx;
      if(Math.abs(dx)>reach*0.9+pr.w*0.4||!sameLane(pr.y,p.y)||Math.abs(pr.y-p.y)>60)continue;
      if(Math.abs(dx)>20&&Math.sign(dx)!==p.facing)continue;
      hit=true;quebraObst(pr);continue;}
    if(pr.type!=="uno"||pr.exploded||pr.fixo)continue;
    if(Math.abs(pr.wx-p.wx)>reach*0.9+pr.w*0.32)continue;
    if(Math.abs(pr.y-p.y)>100)continue;
    hit=true;
    pr.hp=(pr.hp!=null?pr.hp:9)-1;
    const mx=pr.maxhp||9,crit=pr.hp<=mx/3;
    if(bonus&&pr===bonus.car){comboHit();bonus.pts+=CFG.UNO.ptsHit;addDmgNum(pr.wx+(Math.random()-.5)*80,pr.y-200,"+"+CFG.UNO.ptsHit,false,"#ffe36a");}
    const lbl=pr.hp<=0?"EXPLODINDO!":crit?"CRÍTICO!":"AMASSOU";
    addDmgNum(pr.wx,pr.y-150,lbl,crit,"#ffd27a");
    impactBurst(p.wx,p.y-70,crit?"#ff4400":"#ffd27a",crit);
    pr.dmg=pr.hp<=mx/3?2:(pr.hp<=mx*2/3?1:0);
    if(pr.hp<=0)unoExplode(pr);
    AU.punch();shake=Math.max(shake,6);
  }
  return hit;
}
function checkFireHitsUno(fx){
  for(const pr of track){
    if(pr.type!=="uno"||pr.exploded||pr.fixo)continue;
    if(Math.abs(fx.wx-pr.wx)>pr.w*0.55+50)continue;
    if(Math.abs(fx.y-pr.y)>pr.h*0.65)continue;
    pr.hp=(pr.hp!=null?pr.hp:9)-1;
    impactBurst(pr.wx,pr.y-80,"#ff8c00",true);
    addDmgNum(pr.wx,pr.y-160,pr.hp<=0?"EXPLODINDO!":pr.hp<=3?"CRÍTICO!":"AMASSOU",pr.hp<=3,"#ffd27a");
    pr.dmg=Math.min(2,3-Math.ceil(Math.max(0,pr.hp)/3));
    if(pr.hp<=0)unoExplode(pr);
    fx.hit=true;
    return;
  }
}
function updateVinis(dt){
  const p=player;
  for(const v of vinis){
    v.wx+=v.vx*dt;v.t-=dt;v.age+=dt;v.ang+=dt*(v.kind==="low"?16:11)*(v.dir>0?1:-1);
    if(v.hit||v.morto)continue;
    checkFireHitsUno(v);
    if(Math.abs(v.wx-p.wx)>v.hx)continue;
    const laneOk=sameLane(v.y,p.y);
    if(!laneOk)continue;
    if(v.kind==="low"&&(p.z>=v.lowZ||p.__onProp))continue; // pulou OU esta em cima do Uno: escapou
    v.hit=true;damagePlayer(v.dmg,v.wx);
  }
  vinis=vinis.filter(v=>!v.morto&&!v.hit&&v.t>0&&Math.abs(screenX(v.wx))<W+500);
}
function drawVinis(){
  for(const v of vinis){
    const sx=screenX(v.wx),sc=dscale(v.y);
    const quique=(v.kind==="low")?Math.abs(Math.sin(v.age*9))*26:0;
    const cy=v.y-(v.kind==="low"?(20+quique):104);
    const R=27*sc, r2=R*Math.max(0.22,Math.abs(Math.cos(v.ang)));  // gira mostrando o perfil
    // sombra
    cx.save();cx.globalAlpha=0.28;cx.fillStyle="#000";cx.beginPath();
    cx.ellipse(sx,v.y,R*0.8,9*sc,0,0,6.283);cx.fill();cx.restore();
    cx.save();
    cx.fillStyle="#15121a";cx.beginPath();cx.ellipse(sx,cy,r2,R,0,0,6.283);cx.fill();
    cx.strokeStyle="#3b3446";cx.lineWidth=Math.max(1,2*sc);
    for(let k=1;k<=3;k++){cx.beginPath();cx.ellipse(sx,cy,r2*(1-k*0.17),R*(1-k*0.17),0,0,6.283);cx.stroke();}
    cx.fillStyle=v.cor;cx.beginPath();cx.ellipse(sx,cy,r2*0.34,R*0.34,0,0,6.283);cx.fill();
    cx.fillStyle="#15121a";cx.beginPath();cx.ellipse(sx,cy,r2*0.09,R*0.09,0,0,6.283);cx.fill();
    // rastro
    cx.globalAlpha=0.35;cx.strokeStyle=v.cor;cx.lineWidth=3*sc;
    cx.beginPath();cx.moveTo(sx-v.dir*R*1.2,cy);cx.lineTo(sx-v.dir*R*3.0,cy);cx.stroke();
    cx.restore();
  }
  // ICONE TEMATICO sobre cada disco em voo
  for(const v of vinis){if(!v.pi&&v.pi!==0)continue;
    const sx=screenX(v.wx),sc=dscale(v.y);
    const quique=(v.kind==="low")?Math.abs(Math.sin(v.age*9))*26:0;
    const cy=v.y-(v.kind==="low"?(20+quique):104);
    cx.save();cx.font=Math.round(26*sc)+'px serif';cx.textAlign='center';cx.textBaseline='middle';
    cx.globalAlpha=0.90;cx.fillText(iconForPhase(v.pi),sx,cy);cx.restore();}
}
function fireCfg(pi){const f=P.phases[pi]&&P.phases[pi].fire;return f?Object.assign({},FIRE,f):null;}
let fires=[];
function aimLane(e,cfg){ // trava a faixa alvo, garantindo espaco de fuga nas bordas
  const b=curBand(),margem=90;
  let y=player.y;
  if(y-b.top<margem&&b.bottom-b.top>margem*2)y=b.top+margem*0.5;
  if(b.bottom-y<margem&&b.bottom-b.top>margem*2)y=b.bottom-margem*0.5;
  return y;}
function spawnJet(e,kind,cfg){
  const ox=e.wx+e.facing*56;
  if(kind==="lane"&&(cfg.reaim||e.aimY===undefined))e.aimY=aimLane(e,cfg);
  fires.push({pi:e.pi,wx:ox,y:(kind==="lane")?e.aimY:e.y,dir:e.facing,vx:e.facing*cfg.speed,
    kind,t:cfg.life,age:0,hit:false,dmg:cfg.dmg,lowZ:cfg.lowZ,laneHalf:cfg.laneHalf,hx:cfg.hitHalfX});
  AU.fireSfx();shake=Math.max(shake,6);
  for(let i=0;i<5;i++)sparks.push({wx:ox,y:e.y-110,vx:e.facing*(120+Math.random()*180),
    vy:(Math.random()-.6)*160,t:0.28,c:"#ff9b2a"});
}
// ---------- SUPER BOSS: 3 poderes extras (antes so existiam no admin, sem disparo real) ----------
function fireSBNotas(e){
  // "Notas em chamas": rajada de 4 notas cobrindo faixas diferentes da banda,
  // obriga o jogador a escolher uma faixa livre ou pular.
  const b=curBand(),n=4,ox=e.wx+e.facing*56;
  for(let i=0;i<n;i++){
    const y=b.top+(b.bottom-b.top)*((i+0.5)/n);
    fires.push({pi:e.pi,wx:ox,y,dir:e.facing,vx:e.facing*430,
      kind:"lane",t:2.2,age:0,hit:false,dmg:SB_PWR.notas.dmg,lowZ:0,laneHalf:44,hx:46});
  }
  e.sbNotasCd=SB_PWR.notas.cooldown;
  AU.fireSfx();shake=Math.max(shake,10);
  for(let i=0;i<10;i++)sparks.push({wx:ox,y:e.y-100,vx:e.facing*(140+Math.random()*200),
    vy:(Math.random()-0.6)*200,t:0.32,c:"#d4af37"});
}
function fireSBEnergia(e){
  // "Bola de energia": um unico tiro forte, rapido, mirado na altura exata do heroi.
  const ox=e.wx+e.facing*60;
  fires.push({pi:e.pi,wx:ox,y:player.y,dir:e.facing,vx:e.facing*620,
    kind:"lane",t:2.0,age:0,hit:false,dmg:SB_PWR.energia.dmg,lowZ:0,laneHalf:60,hx:58});
  e.sbEnergiaCd=SB_PWR.energia.cooldown;
  AU.power();shake=Math.max(shake,14);flashOverlay=Math.max(flashOverlay,0.15);
  for(let i=0;i<14;i++)sparks.push({wx:ox,y:player.y-90,vx:e.facing*(160+Math.random()*260),
    vy:(Math.random()-0.5)*220,t:0.36,c:"#7cf0ff"});
}
function fireSBParalisia(e){
  // "Paralisia": projetil baixo (pulavel) - dano menor, mas se acertar trava os
  // comandos do heroi por alguns segundos. Marca f.paralisia pra updateFires aplicar o efeito.
  const ox=e.wx+e.facing*56,y=aimLane(e,{});
  fires.push({pi:e.pi,wx:ox,y,dir:e.facing,vx:e.facing*300,
    kind:"low",t:2.4,age:0,hit:false,dmg:SB_PWR.paralisia.dmg,lowZ:78,laneHalf:50,hx:50,paralisia:true});
  e.sbParalisiaCd=SB_PWR.paralisia.cooldown;
  AU.chargeSfx(0.3);shake=Math.max(shake,8);
}
function updateFires(dt){
  const p=player;
  for(const f of fires){
    f.wx+=f.vx*dt;f.t-=dt;f.age+=dt;
    if(f.hit)continue;
    // CENARIO COMO PARTICIPANTE: se o Uno estiver inteiro no caminho, o jato bate nele
    // e nao passa pro heroi - o carro serve de cobertura, igual ja acontecia com os discos.
    checkFireHitsUno(f);
    if(f.hit)continue;
    if(Math.abs(f.wx-p.wx)>f.hx)continue;
    const laneOk=(f.kind==="lane")?sameLane(f.y,p.y):
      (f.kind==="low"?sameLane(f.y,p.y):sameLane(f.y,p.y));
    if(!laneOk)continue;
    if(f.kind==="low"&&(p.z>=f.lowZ||p.__onProp))continue;   // pulou OU esta em cima do Uno: escapou
    f.hit=true;damagePlayer(f.dmg,f.wx);
    if(f.paralisia)player.paralyzedT=Math.max(player.paralyzedT||0,SB_PWR.paralisia.dur);
  }
  fires=fires.filter(f=>f.t>0&&Math.abs(screenX(f.wx))<W+500);
}
function drawFires(){
  cx.save();cx.globalCompositeOperation="lighter";
  for(const f of fires){
    const sx=screenX(f.wx),sc=dscale(f.y);
    const low=f.kind==="low";
    const cy=f.y-(low?26:96);
    for(let i=0;i<8;i++){
      const back=-f.dir*i*16*sc;
      const fl=Math.sin(f.age*24+i*1.2)*3.5*sc;
      const k=1-i/9;
      const rw=(low?26:18)*sc*k*(1+0.14*Math.sin(f.age*30+i));
      const rh=(low?15:52)*sc*k*(1+0.10*Math.cos(f.age*26+i));
      const g=cx.createRadialGradient(sx+back,cy+fl,1,sx+back,cy+fl,Math.max(3,Math.max(rw,rh)*1.6));
      g.addColorStop(0,"rgba(255,248,205,0.95)");
      g.addColorStop(0.30,"rgba(255,176,44,0.72)");
      g.addColorStop(0.65,"rgba(233,74,12,0.35)");
      g.addColorStop(1,"rgba(150,20,0,0)");
      cx.fillStyle=g;cx.beginPath();cx.ellipse(sx+back,cy+fl,rw*1.7,rh*1.7,0,0,6.283);cx.fill();
    }
  }
  cx.restore();
  // ICONE TEMATICO sobre cada jato de fogo
  for(const f of fires){if(!f.pi&&f.pi!==0)continue;
    const sx=screenX(f.wx),sc=dscale(f.y);
    const cy=f.kind==='low'?f.y-28:f.y-92;
    cx.save();cx.font=Math.round(32*sc)+'px serif';cx.textAlign='center';cx.textBaseline='middle';
    cx.globalAlpha=0.90;cx.fillText(iconForPhase(f.pi),sx,cy);cx.restore();}
  // sombra/marca do fogo no chao, ajuda a ler a profundidade
  for(const f of fires){const sx=screenX(f.wx),sc=dscale(f.y);
    cx.save();cx.globalAlpha=0.30;cx.fillStyle="#ff7a1a";cx.beginPath();
    cx.ellipse(sx,f.y,34*sc,9*sc,0,0,6.283);cx.fill();cx.restore();}
}
// aviso visual: mostra COMO escapar antes do primeiro jato/disco sair
function drawFireTelegraph(){for(const e of [enemy,invader])if(e)drawAvisoDe(e);}
function drawAvisoDe(e){
  const disco=(e.state==="vinilwind");
  if(e.state!=="breathwind"&&!disco)return;
  const cfg=disco?vinilCfg(e.pi):fireCfg(e.pi);if(!cfg)return;
  const kind=cfg.pattern[0]||"low";
  const sx=screenX(e.wx),sc=dscale(e.y),pr=1-Math.max(0,e.windT)/cfg.telegraph;
  // brilho crescente na boca
  cx.save();cx.globalCompositeOperation="lighter";
  const mx=sx+e.facing*46*sc,my=e.y-96*sc;
  const r=(10+26*pr)*sc;
  const g=cx.createRadialGradient(mx,my,1,mx,my,r);
  g.addColorStop(0,"rgba(255,250,210,"+(0.5+0.5*pr)+")");
  g.addColorStop(0.4,"rgba(255,150,30,0.6)");g.addColorStop(1,"rgba(200,30,0,0)");
  cx.fillStyle=g;cx.beginPath();cx.arc(mx,my,r,0,6.283);cx.fill();cx.restore();
  // faixa alvo (jato de faixa) ou linha rasteira (jato baixo)
  cx.save();cx.globalAlpha=0.30+0.35*Math.abs(Math.sin(pr*14));
  cx.strokeStyle=disco?"#c9a0ff":"#ff6a1a";cx.lineWidth=3;cx.setLineDash([14,10]);
  if(kind==="lane"){const ly=(e.aimY!==undefined)?e.aimY:player.y;cx.beginPath();
    cx.moveTo(sx,ly);cx.lineTo(sx+e.facing*W,ly);cx.stroke();}
  else{cx.beginPath();cx.moveTo(sx,e.y-14);cx.lineTo(sx+e.facing*W,e.y-14);cx.stroke();}
  cx.setLineDash([]);cx.restore();
  // texto de instrucao
  const msg=disco?(kind==="lane"?"DISCO NA FAIXA - SAIA!":"DISCO RASTEIRO - PULE!")
                 :(kind==="lane"?"SAIA DA FAIXA!":"PULE!");
  cx.save();cx.textAlign="center";cx.font='14px "Press Start 2P",monospace';
  cx.globalAlpha=0.55+0.45*Math.abs(Math.sin(pr*16));
  cx.strokeStyle="#000";cx.lineWidth=4;cx.strokeText(msg,sx,e.y-330*sc);
  cx.fillStyle="#ffd24a";cx.fillText(msg,sx,e.y-330*sc);cx.restore();
  // barra de carregamento
  const bw=110*sc;cx.save();cx.fillStyle="rgba(0,0,0,.7)";cx.fillRect(sx-bw/2,e.y-306*sc,bw,7);
  cx.fillStyle=disco?"#c9a0ff":"#ff6a1a";cx.fillRect(sx-bw/2,e.y-306*sc,bw*pr,7);cx.restore();
}
// ---------- BRECHA: janela em que o chefe fica aberto pro contra-ataque ----------
function drawBrechas(){
  for(const e of [enemy,invader]){
    // mostra a brecha SEMPRE que vulnT>0 (inclusive enquanto o vilao cambaleia
    // em "hurt" levando os golpes - antes o indicador sumia a cada acerto)
    if(!e||e.vulnT<=0||e.state==="dead"||e.state==="saindo")continue;
    const sx=screenX(e.wx),sc=dscale(e.y),pul=0.5+0.5*Math.sin(performance.now()/90);
    cx.save();cx.globalCompositeOperation="lighter";
    const g=cx.createRadialGradient(sx,e.y-110*sc,4,sx,e.y-110*sc,150*sc);
    g.addColorStop(0,"rgba(255,226,120,"+(0.20+0.16*pul)+")");
    g.addColorStop(1,"rgba(255,180,40,0)");
    cx.fillStyle=g;cx.beginPath();cx.arc(sx,e.y-110*sc,150*sc,0,6.283);cx.fill();cx.restore();
    cx.save();cx.textAlign="center";cx.font='15px "Press Start 2P",monospace';
    cx.globalAlpha=0.6+0.4*pul;
    cx.strokeStyle="#000";cx.lineWidth=5;cx.strokeText("BRECHA! ATACA!",sx,e.y-320*sc);
    cx.fillStyle="#ffe36a";cx.fillText("BRECHA! ATACA!",sx,e.y-320*sc);cx.restore();
    // barrinha mostrando quanto tempo de brecha ainda resta
    const bw=130*sc,bx=sx-bw/2,by=e.y-298*sc;
    cx.save();cx.fillStyle="rgba(0,0,0,.7)";cx.fillRect(bx,by,bw,7);
    cx.fillStyle="#ffe36a";cx.fillRect(bx,by,bw*Math.max(0,e.vulnT/(e.vulnMax||1)),7);cx.restore();
  }
}
// ---------- GOLPES DOS 3 BOTOES (todos com o skate) ----------
// Especiais de input combinado (Gritaria, Kick Es, Sai Dai, Poder, Tiro, Defesa) foram EXCLUIDOS.
// "Colado" = |dx|<=GRAB_X E |dy|<=GRAB_Y (profundidade 2.5D conta).
function alvoColado(p){let best=null,bd=1e9;
  for(const t of alvos()){
    if(t.state==="entrando"||t.state==="saindo"||(t.z||0)>6||t.grabbed)continue;
    const dx=Math.abs(t.wx-p.wx),dy=Math.abs(t.y-p.y);
    if(dx<=CFG.GRAB_X*kX()&&dy<=CFG.GRAB_Y&&dx<bd){bd=dx;best=t;}}
  return best;}
// 👊 no chao: colado = agarrao; longe = proximo hit do combo automatico
function socoNoChao(p){const t=alvoColado(p);if(t)return startGrabThrow(p,t);startComboHit(p);}
function startComboHit(p){
  const now=performance.now();
  p.comboStep=(p.comboStep>0&&p.comboStep<CFG.COMBO_HITS&&now-p.lastComboHit<CFG.COMBO_WINDOW_MS)?p.comboStep+1:1;
  p.atkFinisher=p.comboStep>=CFG.COMBO_HITS;
  p.state="attack";p.atkT=0.30;p.atkHit=false;p.skAnim=0;p.atkId=(p.atkId||0)+1;AU.punch();}
// AGARRAO + ARREMESSO DE RUA: segura, gira o skate e joga o vilao por cima da cabeca
// AGARRAO (Final Fight): segura -> 👊 = JOELHADA (ate JOELHADAS_MAX; a ultima arremessa)
//   🕹️ pra TRAS + 👊 = arremesso pra tras · 🕹️ pra FRENTE + 👊 (ou 🦵) = arremesso pra frente
//   demorou (GRAB_HOLD) = arremessa pra tras sozinho. Levar golpe solta o vilao.
function startGrabThrow(p,t){
  tut.agarrou=true;p.comboStep=0;p.throwT=0;p.segT=CFG.GRAB_HOLD;p.joelhadas=0;p.joelhaT=0;p.throwDir="tras";
  p.throwTgt=t;p.state="throw";p.skAnim=0;p.mvx=0;p.mvy=0;
  p.iframes=Math.max(p.iframes,0.25);
  p.facing=(t.wx>=p.wx)?1:-1;
  t.grabbed=true;t.guarding=false;t.guardT=0;t.state="hurt";t.hurtT=CFG.GRAB_HOLD+CFG.THROW_T+0.3;t.kbx=0;t.vz=0;
  addDmgNum(t.wx,t.y-170,"AGARRÃO!",false,"#ffcf33");AU.jumpSfx();shake=Math.max(shake,4);}
function iniciaArremesso(p,dir){p.segT=0;p.throwDir=dir;p.throwT=CFG.THROW_T;p.iframes=Math.max(p.iframes,CFG.THROW_T+0.1);
  addDmgNum(p.wx,p.y-210,dir==="frente"?"ARREMESSO PRA FRENTE!":"ARREMESSO!",true,"#ffcf33");}
function soltaArremesso(p){const t=p.throwTgt;p.throwTgt=null;
  if(!t)return;t.grabbed=false;
  damageEnemy(Math.round(HERO().dmgSoco*3),CFG.THROW_KB,1.0,null,t,'arremesso');
  if(t.state!=="dead")t.vz=Math.max(t.vz||0,480);
  t.flyT=0.7;t.flyHit=[];
  shake=Math.max(shake,14);doHitStop(0.08);impactBurst(t.wx,t.y-60,"#fff2c0",true);
  for(let r=0;r<2;r++)rings.push({wx:t.wx,y:t.y,r:14+r*16,t:0.5,c:"#ffcf33"});}
// ⤴️ + 👊/🦵 no ar: VOADORA SIMPLES em linha reta (prancha na frente)
function startFlyingKick(p){
  // saindo do Salto de Fuga: por padrao o ataque encerra a invencibilidade (ESCAPE_ATK_IFRAMES=0)
  if(p.escaping&&!CFG.ESCAPE_ATK_IFRAMES){p.isInvincible=false;p.invincibleTimer=0;}
  p.escaping=false;
  p.airAtk=true;p.airHit=false;p.skating=true;p.state="skate";p.skAnim=0;p.comboStep=0;
  tut.voadora=true;p.airStep=1;p.airFinisher=CFG.AIR_COMBO_HITS<=1;p.airBuf=false;p.airNextT=0;
  p.mvx=p.facing*CFG.FLYKICK_VX;AU.kickHit();}
// 👊/🦵 NO AR: 1o toque = voadora; toques seguidos depois de acertar = hits do COMBO AEREO (ultimo derruba)
function golpeNoAr(p){
  if(!p.airAtk){startFlyingKick(p);return;}
  if(p.airHit&&!p.airFinisher&&(p.airStep||1)<CFG.AIR_COMBO_HITS){
    p.airStep=(p.airStep||1)+1;p.airFinisher=p.airStep>=CFG.AIR_COMBO_HITS;
    p.airHit=false;p.airBuf=false;p.airNextT=CFG.AIR_CHAIN_DELAY;p.skAnim=0;
    p.vz=Math.max(p.vz,CFG.AIR_HANG_VZ);p.mvx=p.facing*140;AU.kickHit();}
  else if(!p.airHit)p.airBuf=true;   // tocou antes do hit conectar: encadeia assim que acertar
}
// ⤴️⤴️: SALTO DE FUGA - sobe alto por cima do cerco, com i-frames
function startEscapeJump(p,dx){
  const dir=dx||p.facing;p.facing=dir;
  p.vz=CFG.ESCAPE_VZ;p.jumpsUsed=2;p.escapeUsed=true;p.escaping=true;p.state="jump";p.__onProp=null;
  tut.fugiu=true;p.isInvincible=true;p.invincibleTimer=CFG.ESCAPE_IFRAME_SEC; // hitbox de dano desligada
  p.mvx=dir*CFG.ESCAPE_VX;AU.jumpSfx();
  for(let i=0;i<10;i++)sparks.push({wx:p.wx,y:p.y-p.z-20,vx:(Math.random()-0.5)*260,vy:-Math.random()*180,t:0.4,c:"#bfe8ff"});
  rings.push({wx:p.wx,y:p.y,r:12,t:0.35,c:"#bfe8ff"});}
// ===== SLIDE (GRIND): ⤴️ + 🦵 com o chute SEGURADO =====
// Superficies: meio-fio (bordas de cima/baixo da calcada), banco de praca, carro Uno e cabeca do vilao.
// Solta o 🦵 = sai do slide. ⤴️ durante o slide = ollie pra fora.
// =====================================================================
// DEGRAU (ex.: plataforma do Trensurb): a calcada de cima e mais alta que a rua.
// Subir: SO PULANDO (altura suficiente). Descer: anda e cai. A borda inteira e
// grindavel (slide por todo o degrau, sem limite de tempo).
// Dados da fase: degrau:{yPlat: borda da plataforma, yRua: pe do degrau na rua}
// =====================================================================
function degrauFase(){const ph=P.phases[enemy?enemy.pi:phaseIndex];return ph&&ph.degrau||null;}
// degrau pode valer so num trecho da fase (xIni..xFim, ex.: palco da Concha Acustica).
// Fora do trecho, ninguem passa acima de yMinFora (a parede/fundo do cenario).
function degrauAtivo(dg,x){return dg.xIni===undefined||(x>=dg.xIni&&x<=dg.xFim);}
function aplicaDegrau(e,prevY,ehVilao,alvoY){
  const dg=degrauFase();if(!dg)return;
  const yP=dg.yPlat,yR=dg.yRua,dz=(yR-yP)/kZ();
  if(!degrauAtivo(dg,e.wx)){                             // fora do trecho do degrau
    const lim=dg.yMinFora!==undefined?dg.yMinFora:yR;
    if(e.y<lim){
      if(prevY<=yP+0.5){e.y=lim;e.z=(e.z||0)+(lim-yP)/kZ();if(e.vz>0)e.vz=0;} // saiu pela ponta da plataforma: cai
      else e.y=lim;}
    return;}
  if(e.y>yP&&e.y<yR){                                   // na face do degrau
    if(prevY<=yP+0.5){e.y=yR;e.z=(e.z||0)+dz;if(e.vz>0)e.vz=0;}          // desceu da plataforma: cai
    else if((e.z||0)>=dz+2&&prevY>=yR-0.5){e.y=yP;e.z-=dz;}               // pulou alto: sobe
    else{e.y=yR;                                                          // bateu no degrau
      if(ehVilao&&(e.z||0)<=0&&e.vz===0&&(alvoY===undefined||alvoY<=yP+1))e.vz=CFG.DEGRAU_PULO_VILAO;}}}
function pertoDegrau(p){const dg=degrauFase();return !!dg&&degrauAtivo(dg,p.wx)&&(Math.abs(p.y-dg.yPlat)<=CFG.CURB_MARGIN||Math.abs(p.y-dg.yRua)<=CFG.CURB_MARGIN);}
function pertoMeioFio(p){const b=curBand();return pertoDegrau(p)||Math.min(Math.abs(p.y-b.top),Math.abs(p.y-b.bottom))<=CFG.CURB_MARGIN;}
function alturaCabeca(t){const fr=enFrame(t);const porte=t.sizeMul||(IMG.phases[t.pi]&&IMG.phases[t.pi].sizeMul)||1;
  return (fr?Math.max(80,fr.h*dscale(t.y)*escalaChar()*porte*0.9):160)/kZ();}
function startGrind(p,mode,tgt){
  p.grindMode=mode;p.grindTgt=tgt||null;p.grindT=0;p.grindDir=p.facing||1;p.grindTick=0.05;p.grindHits=0;p.grindHitSet=[];
  p.grinding=true;p.skating=true;p.state="skate";p.airAtk=false;p.airHit=false;p.escaping=false;p.vz=0;p.mvy=0;p.skAnim=0;
  p.comboStep=0;p.atkT=0;p.kickT=0;
  Object.assign(p,{manobra:null,manobraUlt:null,manobraN:0,manobraCd:0,manobraSet:{},manobraBonus:false,hopT:0,grindExtra:0});
  p.grindDegrau=false;
  if(mode==="meiofio"&&pertoDegrau(p)){p.y=degrauFase().yPlat;p.z=0;p.__onProp=null;p.grindDegrau=true;} // slide na borda do degrau
  else if(mode==="meiofio"){const b=curBand();p.y=(Math.abs(p.y-b.top)<Math.abs(p.y-b.bottom))?b.top:b.bottom;p.z=0;p.__onProp=null;}
  else if(mode==="prop"){p.z=p.grindZ||tgt.topH;p.__onProp=tgt;p.y=tgt.y;}
  else if(mode==="cabeca"){p.grindOff=p.wx-tgt.wx;p.y=tgt.y;p.z=alturaCabeca(tgt);p.__onProp=null;}
  tut.slide=true;shake=Math.max(shake,4);AU.jumpSfx();vib(15);addDmgNum(p.wx,p.y-p.z-120,"SLIDE!",false,"#bfe8ff");}
function endGrind(p,ollie){const m=p.grindMode;p.grindZ=null;p.grindMode=null;p.grindTgt=null;p.grinding=false;p.manobra=null;p.hopT=0;
  if(ollie){p.vz=CFG.JUMP_VZ*0.9;p.jumpsUsed=1;p.escapeUsed=false;p.lastJumpTap=performance.now();p.state="jump";AU.jumpSfx();}
  else if(m==="cabeca"){p.vz=CFG.GRIND_HOP_VZ;p.jumpsUsed=1;p.state="jump";}
  else if(m==="meiofio"){p.skating=false;p.state="land";p.landT=0.12;p.jumpsUsed=0;}
  else if(m==="prop"&&p.__onProp){p.skating=false;p.state="idle";}   // soltou em cima do banco/carro: fica em pe
  p.mvx=p.grindDir*(ollie?240:120);}
// =====================================================================
// MANOBRAS NO SLIDE (⤴️ + 🦵 segurado + manche)
// Durante o slide, cada DIRECAO do manche e uma manobra diferente no mesmo combo:
//   ↑ OLLIE NO TRILHO (pulinho)   ↓ CROOKED (agachado, tromba mais forte)
//   → NOSEGRIND (acelera)         ← TAILSLIDE (freia: mais tempo pra manobrar)
// Regras: sem sequencia de comandos - e so apontar o manche. Pontua a manobra
// NOVA (repetir a mesma seguida nao conta); cada uma soma 1 hit no contador de
// combo e da mais tempo no meio-fio. As 4 no mesmo slide = COMBO DE MANOBRAS.
// =====================================================================
const MANOBRAS={
  cima:  {nome:"OLLIE NO TRILHO!",cor:"#5aa9ff",quadro:"slideCima"},
  baixo: {nome:"CROOKED!",        cor:"#ff8c00",quadro:"slideBaixo"},
  frente:{nome:"NOSEGRIND!",      cor:"#2ec27e",quadro:"slideFrente"},
  tras:  {nome:"TAILSLIDE!",      cor:"#ff5a9a",quadro:"slideTras"}};
function direcaoManobra(p){
  const ax=keys.ax||((keys.right?1:0)-(keys.left?1:0)),ay=keys.ay||((keys.down?1:0)-(keys.up?1:0)),lim=0.5;
  if(Math.abs(ay)>=Math.abs(ax)){if(ay<-lim)return "cima";if(ay>lim)return "baixo";return null;}
  const fx=ax*p.grindDir;if(fx>lim)return "frente";if(fx<-lim)return "tras";return null;}
function atualizaManobra(p,dt){
  if(p.manobraCd>0)p.manobraCd-=dt;
  if(p.hopT>0)p.hopT-=dt;
  const dir=direcaoManobra(p);
  p.manobra=dir;                                   // pose segue o manche; solto = slide normal
  if(!dir||dir===p.manobraUlt||p.manobraCd>0)return;
  const M=MANOBRAS[dir];
  p.manobraUlt=dir;p.manobraCd=CFG.MANOBRA_INTERVALO;p.manobraN++;p.manobraSet[dir]=1;
  const pts=CFG.MANOBRA_PTS*p.manobraN;score+=pts;comboHit();vib(12);tut.manobra=true;
  addDmgNum(p.wx,p.y-p.z-175,M.nome,true,M.cor);addDmgNum(p.wx+30,p.y-p.z-140,"+"+pts,false,"#ffe36a");
  for(let i=0;i<8;i++)sparks.push({wx:p.wx,y:p.y-p.z-30,vx:(Math.random()-.5)*300,vy:-80-Math.random()*160,t:0.4,c:M.cor});
  if(p.grindMode==="meiofio")p.grindExtra=Math.min(CFG.MANOBRA_TEMPO_MAX,(p.grindExtra||0)+CFG.MANOBRA_TEMPO_EXTRA);
  if(dir==="cima")p.hopT=0.32;
  if(p.grindMode==="cabeca"&&p.grindTgt&&p.grindTgt.state!=="dead")      // na cabeca do vilao: manobra tambem bate
    damageEnemy(Math.max(1,Math.round(HERO().dmgAr*0.5)),1,0.45,null,p.grindTgt);
  if(Object.keys(p.manobraSet).length===4&&!p.manobraBonus){p.manobraBonus=true;score+=CFG.MANOBRA_BONUS4;
    addDmgNum(p.wx,p.y-p.z-215,"COMBO DE MANOBRAS! +"+CFG.MANOBRA_BONUS4,true,"#ffcf33");shake=Math.max(shake,8);vib([20,30,20]);}
}
function pulinhoManobra(p){return p.hopT>0?Math.sin(Math.PI*(1-p.hopT/0.32))*28:0;}
function updateGrind(p,dt){
  if(press.jump){press.jump=false;press.jumpTaps.length=0;endGrind(p,true);return;}
  press.punch=false;press.kick=false;
  if(!held.kick){endGrind(p,false);return;}
  p.grindT+=dt;p.skAnim+=dt;p.facing=p.grindDir;score+=Math.round(dt*120);
  atualizaManobra(p,dt);
  const velMul=p.manobra==="frente"?CFG.MANOBRA_VEL_FRENTE:(p.manobra==="tras"?CFG.MANOBRA_VEL_TRAS:1);
  const sp=CFG.GRIND_SPEED*p.grindDir*velMul;
  if(p.grindMode==="cabeca"){const t=p.grindTgt;
    if(!t||t.state==="dead"||t.grabbed||t.state==="saindo"){endGrind(p,false);return;}
    p.grindOff+=sp*0.35*dt;p.wx=t.wx+p.grindOff;p.y=t.y;p.z=alturaCabeca(t)+pulinhoManobra(p);t.kbx=0;
    p.grindTick-=dt;
    if(p.grindTick<=0){p.grindTick=CFG.GRIND_HEAD_TICK;p.grindHits++;
      const fin=p.grindHits>=CFG.GRIND_HEAD_HITS;
      damageEnemy(fin?HERO().dmgAr*2:HERO().dmgAr,fin?CFG.FINISHER_KB:1,fin?0.95:0.45,null,t);
      if(fin){if(t.state!=="dead")t.vz=Math.max(t.vz||0,380);endGrind(p,false);return;}}
    if(Math.abs(p.grindOff)>70){endGrind(p,false);return;}
  }else{
    const alvoX=p.wx+sp*dt;p.wx=alvoX;clampPlayerX(p);
    if(Math.abs(p.wx-alvoX)>0.5){endGrind(p,false);return;}          // bateu na borda da tela
    if(p.grindMode==="prop"){const pr=p.grindTgt;
      if(!pr||track.indexOf(pr)<0||pr.exploded||Math.abs(p.wx-pr.wx)>pr.w*0.42){p.__onProp=null;p.airAtk=false;endGrind(p,false);return;}
      p.z=(p.grindZ||pr.topH)+pulinhoManobra(p);p.__onProp=pr;
    }else{ // meio-fio: tromba e empurra quem estiver no caminho
      for(const t of alvos()){if(p.grindHitSet.includes(t))continue;
        if(Math.abs(t.wx-p.wx)<70*kX()&&Math.abs(t.y-p.y)<40&&(t.z||0)<20){p.grindHitSet.push(t);
          damageEnemy(Math.round(HERO().dmgChute*(p.manobra==="baixo"?1.5:1)),CFG.KICK_KNOCKBACK,0.6,null,t,'chute');}}
      p.z=pulinhoManobra(p);
      if(!p.grindDegrau&&p.grindT>CFG.GRIND_MAX_MEIOFIO+(p.grindExtra||0)){endGrind(p,false);return;} // no degrau: slide por toda a borda
      if(p.grindDegrau&&!degrauAtivo(degrauFase(),p.wx)){endGrind(p,false);return;}                     // acabou a borda: cai
    }
  }
  p.grindSparkT=(p.grindSparkT||0)-dt;
  if(p.grindSparkT<=0){p.grindSparkT=0.04;
    sparks.push({wx:p.wx-p.facing*16,y:p.y-p.z-6,vx:-p.facing*(90+Math.random()*80),vy:-30-Math.random()*80,t:0.24,c:"#ffe36a"});}
}
function clampPlayerX(p){
  if(bonus){p.wx=Math.max(bonus.minX,Math.min(bonus.maxX,p.wx));return;}
  p.wx=Math.max(Math.max(150,camX+70),Math.min(CUR_WORLD_LEN-150,camX+W-70,p.wx));}
// =====================================================================
// ESTRUTURA FINAL FIGHT: fase longa com scroll -> TRAVA de tela -> onda de
// CAPANGAS -> limpou = "VAI! ►" e o cenario volta a rolar -> CHEFE no fim.
// =====================================================================
let mooks=[],ondas=[],ondaIdx=0,waveAtiva=false,bossSpawned=false,goT=0,spawnFila=[],hudAlvo=null;
const APELIDOS=["BAGUAL","XIRU","PIÁ","GUDI","CUSCO","TCHÊ","BRETE","GURI","GAUDÉRIO","CHINELÃO","PILCHA","BOMBACHA"];
function planejaOndas(){
  ondas=[];const n=Math.max(0,CFG.ONDAS|0),span=CUR_WORLD_LEN-W;
  for(let i=1;i<=n;i++)ondas.push({x:Math.round(span*i/(n+1)),qtd:Math.min(CFG.ONDA_MAX||8,CFG.ONDA_BASE+Math.floor(phaseIndex/2)+(i-1)+(i===n?1:0))});
  ondaIdx=0;waveAtiva=false;bossSpawned=false;goT=0;spawnFila=[];mooks=[];
  vetPtr=Math.floor(Math.random()*Math.max(1,phaseIndex));}
function camLimite(){
  if(waveAtiva)return camX;
  if(ondaIdx<ondas.length)return ondas[ondaIdx].x;
  return CUR_WORLD_LEN-W;}
// capanga = membro da gangue do chefe da fase, com a roupa em outra cor (pele preservada pelo mkTint)
const _capSets={};
function capangaSet(pi,v){
  v=v?1:0;const chave=pi+"_"+v;
  if(_capSets[chave])return _capSets[chave];
  const ph=P.phases[pi],base=ph.tint||{};
  const cores=[[0.45,0.8,0.45],[0.95,0.8,0.3],[0.9,0.4,0.35]]; // verde, amarelo, vermelho do reggae
  const t={shift:((base.shift||0)+140)%360,sat:(base.sat===undefined?1:base.sat)*0.9,val:(base.val===undefined?1:base.val)*0.82,neutro:cores[(pi+v)%3]};
  const I=IMG.phases[pi];
  return _capSets[chave]={bg:I.bg,port:I.port,idle:fset(ph.idle,t),guard:fset(ph.guard,t)||fset(ph.idle,t),attack:fset(ph.attack,t),
    attack2:fset(ph.attack2,t)||fset(ph.attack,t),attack3:null,taunt:fset(ph.taunt,t)||fset(ph.idle,t),
    idleA:fsA(ph.idleA,t),walkA:fsA(ph.walkA,t),socoA:fsA(ph.socoA,t),chuteA:fsA(ph.chuteA,t),puloA:fsA(ph.puloA,t),danoA:fsA(ph.danoA,t),
    tauntA:null,mksA:null,victoryA:null,koPose:fset(ph.koPose,t),sizeMul:I.sizeMul};}
// =====================================================================
// VETERANOS: viloes das fases ANTERIORES voltam como inimigos comuns nas
// fases seguintes (fase 1 = so a gangue do chefe; fase 2 = +JAY; fase 3 = +JAY
// e o chefe da fase 2...). Regras de equilibrio:
//  - ~40% de cada onda (VETERANOS_PCT), no maximo VETERANOS_MAX_ONDA por onda;
//  - rodizio entre os viloes anteriores: todos aparecem, nenhum repete demais;
//  - intercalados na fila de entrada (nao chegam todos juntos);
//  - aparencia original (reconheciveis) e porte 90%; vida = capanga x1,3;
//  - sem especiais (fogo/vinil/paralisia): so corpo a corpo, como todo capanga.
// =====================================================================
let vetPtr=0;
function qtdVeteranos(qtd){
  if(phaseIndex<=0)return 0;
  return Math.min(CFG.VETERANOS_MAX_ONDA,Math.round(qtd*CFG.VETERANOS_PCT),qtd-1); // sempre sobra 1 da gangue da fase
}
function proximoVeterano(){const n=phaseIndex;return n>0?(vetPtr++)%n:null;}
// fila da onda: veteranos espalhados de forma uniforme entre os capangas
function montaFilaOnda(qtd){
  const v=qtdVeteranos(qtd),vetPos=new Set();
  for(let k=0;k<v;k++)vetPos.add(Math.floor((k+0.5)*qtd/v));
  const fila=[];
  for(let i=0;i<qtd;i++)fila.push({t:i===0?0.2:(i<4?0.35:0.9),lado:(i%2===0)?1:-1,vet:vetPos.has(i)?proximoVeterano():null});
  return fila;}
function novoCapanga(lado,vetPi){
  const b=curBand(),ehVet=(vetPi!==null&&vetPi!==undefined&&P.phases[vetPi]&&IMG.phases[vetPi]);
  const pi=ehVet?vetPi:enemy.pi;
  const base=CFG.CAPANGA_HP+phaseIndex*4,hp=ehVet?Math.round(base*CFG.VETERANO_HP_MUL):base;
  const m=newEnemy(hp,pi,b);
  if(ehVet){
    Object.assign(m,{mook:true,vet:true,entered:false,nome:P.phases[vetPi].name,imgSet:null,
      sizeMul:(IMG.phases[vetPi].sizeMul||1)*0.9,dmMul:0.85,dmgMul:0.7,cd:0.8+Math.random()*0.8,fireCd:1e9,vinilCd:1e9,grabCd:6+Math.random()*4,
      wx:lado>0?camX+W+90+Math.random()*80:camX-90-Math.random()*60,y:b.top+Math.random()*(b.bottom-b.top),facing:-lado});
    mooks.push(m);return;}
  Object.assign(m,{mook:true,entered:false,nome:APELIDOS[(Math.random()*APELIDOS.length)|0],imgSet:capangaSet(pi,(Math.random()*2)|0),
    sizeMul:(IMG.phases[pi].sizeMul||1)*(0.84+Math.random()*0.08),dmMul:0.8,dmgMul:0.6,cd:0.8+Math.random()*0.8,fireCd:1e9,vinilCd:1e9,grabCd:6+Math.random()*4,
    wx:lado>0?camX+W+90+Math.random()*80:camX-90-Math.random()*60,y:b.top+Math.random()*(b.bottom-b.top),facing:-lado});
  mooks.push(m);}
function atacantes(e){let n=0;for(const o of alvos())if(o!==e&&(o.state==="windup"||o.state==="attack"))n++;return n;}
function atualizaOndas(dt){
  if(goT>0)goT-=dt;
  if(spawnFila.length){spawnFila[0].t-=dt;if(spawnFila[0].t<=0){const f=spawnFila.shift();novoCapanga(f.lado,f.vet);}}
  if(!waveAtiva&&ondaIdx<ondas.length&&camX>=ondas[ondaIdx].x-2){
    waveAtiva=true;const o=ondas[ondaIdx];spawnFila=[];
    ckpt={onda:ondaIdx,x:o.x,boss:false,score};   // CHECKPOINT: se perder, volta aqui
    // chegam em grupos: primeiro 2 de cada lado, depois reforcos em sequencia
    spawnFila=montaFilaOnda(o.qtd); // capangas da fase + veteranos das fases anteriores
    avisoHUD("CAPANGAS!");AU.chargeSfx&&AU.chargeSfx(0.5);}
  if(waveAtiva&&!spawnFila.length&&mooks.length===0){
    waveAtiva=false;ondaIdx++;goT=2.8;timeLeft=99;AU.power();}
  if(!bossSpawned&&ondaIdx>=ondas.length&&!waveAtiva&&camX>=CUR_WORLD_LEN-W-4){
    bossSpawned=true;const b=curBand();
    ckpt={onda:ondas.length,x:CUR_WORLD_LEN-W,boss:true,score}; // CHECKPOINT do chefe
    Object.assign(enemy,{state:"approach",wx:camX+W+140,y:(b.top+b.bottom)/2,entered:false,cd:1.2,fireCd:3});
    timeLeft=99;bannerT=2.4;bannerNome=P.phases[enemy.pi].name;bannerCor=P.phases[enemy.pi].accent;
    AU.power();shake=Math.max(shake,12);}
  // capangas nao se empilham no mesmo ponto
  const L=alvos();
  for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],c=L[j];
    if(a.grabbed||c.grabbed)continue;
    if(Math.abs(a.wx-c.wx)<55*kX()&&Math.abs(a.y-c.y)<16){const sg=(a.y<=c.y)?-1:1,b=curBand();
      a.y=Math.max(b.top,Math.min(b.bottom,a.y+sg*40*dt));c.y=Math.max(b.top,Math.min(b.bottom,c.y-sg*40*dt));}}
}

// ---------- colisão com props (obstáculo/plataforma) ----------
function propUnder(wx,y){
  for(const pr of track){
    if(wx>pr.wx-pr.w*0.42&&wx<pr.wx+pr.w*0.42){
      // se y fornecido, so bloqueia se estiver na mesma faixa do prop
      if(y!==undefined&&pr.y!==undefined&&Math.abs(y-pr.y)>CFG.PROP_PROF)continue; // ocupa so a propria faixa de profundidade
      return pr;
    }
  }
  return null;
}
// (removido: resolvePropsX era um placeholder morto e com bug de precedência)
// BLOQUEIO NO EIXO Y: subir/descer na calcada nao atravessa banco, lixeira, caixa ou carro
// (so passa por cima quem estiver alto o bastante: pulando ou em cima dele)
function bloqueiaY(ent,prevY){
  if(ent.y===prevY)return;
  for(const pr of track){
    if(!pr.solidTop||pr.exploded)continue;
    if(Math.abs(ent.wx-pr.wx)>=pr.w*0.42)continue;
    const dentro=Math.abs(ent.y-pr.y)<=CFG.PROP_PROF,antes=Math.abs(prevY-pr.y)<=CFG.PROP_PROF;
    if(dentro&&!antes&&(ent.z||0)<pr.topH*0.55){ent.y=prevY;return;}}}
function applyPropCollision(ent,dxWorld){
  // ent: player/enemy com {wx,y,z}
  const target=ent.wx+dxWorld;
  const pr=propUnder(target, ent.y);
  if(pr){
    const topH=pr.solidTop?pr.topH:0;
    // histerese: se já estava subindo/em cima, usa limiar mais baixo pra não "piscar" bloqueado/livre entre frames
    const wasClimbing = ent.__climbing===pr;
    const climbGate = wasClimbing ? topH*0.35 : topH*0.55;
    if(pr.solidTop && ent.z>=climbGate){ ent.wx=target; ent.__climbing=pr;
      if(ent.z<topH&&ent.vz<=0){ent.z=topH;ent.vz=0;ent.__onProp=pr;} return; }
    if(!pr.solidTop){ ent.wx=target; return; } // props baixos (trash/copo/speaker) não bloqueiam, so decoram... exceto speaker
    // bloqueado: parede
    ent.__climbing=null;
    const bordaE=pr.wx-pr.w*0.42-1, bordaD=pr.wx+pr.w*0.42+1;
    // Se o personagem JA esta dentro do prop, empurrar pelo sentido do movimento
    // prende ele (indo pra direita joga pra borda esquerda e vice-versa).
    // Nesse caso ejeta sempre pela borda MAIS PROXIMA e libera a passagem.
    if(propUnder(ent.wx)===pr){
      ent.wx=(Math.abs(ent.wx-bordaE)<=Math.abs(ent.wx-bordaD))?bordaE:bordaD;
    } else {
      ent.wx=(dxWorld>0)?bordaE:bordaD;
    }
  } else { ent.wx=target; ent.__climbing=null; if(ent.__onProp){const stillOn=propUnder(ent.wx)===ent.__onProp;if(!stillOn)ent.__onProp=null;} }
}
// ---------- update ----------

// Sequencia obrigatoria da MANOBRA DE SKATE (botao skate so responde apos ela)

// Duracao da JANELA DE DANO (brecha) do vilao/boss, em segundos.
let BRECHA_DUR=5.0;
// aviso curto no centro da tela (feedback de "sem poder" / "faca o combo")
let avisoT=0,avisoTxt="";
function avisoHUD(t){avisoTxt=t;avisoT=0.9;}

BOSS_SEQ['SUPER BOSS']=['z','c','z'];
const TOKEN_ICON={j:'⤴️',m:'⚡',x:'🛹',c:'🦵',l:'⬅️',r:'➡️',z:'👊',v:'📣'};
let bossSeqHintEl=null;
function showBossSeqHint(tokens){
  hideBossSeqHint();
  const el=document.createElement('div');
  el.id='bossSeqHint';
  el.style.cssText='position:fixed;left:50%;top:38%;transform:translate(-50%,-50%);z-index:70;text-align:center;pointer-events:none;font-family:"Press Start 2P",monospace;color:#fff;text-shadow:2px 2px 0 #000;';
  el.innerHTML='<div style="font-size:11px;margin-bottom:6px">QUEBRE A DEFESA!</div><div style="font-size:28px;letter-spacing:8px">'+tokens.map(t=>TOKEN_ICON[t]||t).join(' ')+'</div>';
  document.body.appendChild(el);
  bossSeqHintEl=el;
}
function hideBossSeqHint(){ if(bossSeqHintEl){ bossSeqHintEl.remove(); bossSeqHintEl=null; } }
function seqEndsCustom(key){const s=POWER_SEQ[key];return seqEnds(s[0],s[1],s[2]);}
function updateCombat(dt){est.t+=dt/GAME_SPEED;updatePlayer(dt);updateEnemy(dt);
  for(const m of mooks)updateEnemy(dt,m);
  mooks=mooks.filter(m=>!(m.state==="dead"&&m.deadT<=0));
  for(const pr of track)if(pr.flashT>0)pr.flashT-=dt;
  atualizaOndas(dt);
  tentaInvasao(dt);updateShots(dt);updateFires(dt);updateVinis(dt);updateSmoke(dt);
  if(enemy.state==="dead"&&enemy.deadT<=0)resolveWin();
  if(scene!=="phase")return;
  {const targetCam=Math.max(0,Math.min(camLimite(),CUR_WORLD_LEN-W,player.wx-W*0.36));
   camX=Math.max(camX,camX+(targetCam-camX)*Math.min(1,10*dt));} // scroll so pra frente, estilo Final Fight
  streamProps();pegaCopos();
}
function updatePlayer(dt){const p=player;
  if(p.iframes>0)p.iframes-=dt;if(p.flashT>0)p.flashT-=dt;p.skAnim+=dt;
  // relogio REAL: dt do jogo ja vem multiplicado por GAME_SPEED (0.72), entao divide de volta
  if(p.isInvincible){p.invincibleTimer-=dt/GAME_SPEED;if(p.invincibleTimer<=0){p.isInvincible=false;p.invincibleTimer=0;}}
  if(p.guardChainT>0){p.guardChainT-=dt;if(p.guardChainT<=0)p.guardChain=0;}
  if(p.skateComboT>0)p.skateComboT-=dt; // janela curta de pulo+ataque = manobra de skate
  if(p.kbx!==0){applyPropCollision(p,p.kbx*dt);p.kbx*=Math.pow(0.0001,dt);if(Math.abs(p.kbx)<6)p.kbx=0;}
  clampPlayerX(p);
  if(p.dashT>0){p.dashT-=dt;applyPropCollision(p,p.dashVX*dt);p.dashVX*=Math.pow(0.02,dt);
    quebraVinis(p,130);if(bateNoCarro(p,130))p.dashHit=true;
    if(!p.dashHit){const alvo=alvos().find(t=>Math.abs(t.wx-p.wx)<95&&Math.abs(t.y-p.y)<58);
      if(alvo){p.dashHit=true;damageEnemy(18,340,0.5,null,alvo);}}
    if(p.dashT<=0)p.skating=false;p.anim+=dt;return;}
  if(p.guardT>0){p.guardT-=dt;if(p.guardT<=0){p.guarding=false;p.guardT=0;}}
  // MC NO CHAO: sem controle ate levantar (o manche e os botoes voltam quando ele fica de pe)
  if(p.downT>0){p.downT-=dt;if(p.kbx!==0){applyPropCollision(p,p.kbx*dt);p.kbx*=Math.pow(0.0001,dt);if(Math.abs(p.kbx)<6)p.kbx=0;}clampPlayerX(p);
    press.punch=press.kick=press.jump=false;press.jumpTaps.length=0;p.state="idle";p.anim+=dt;
    if(p.downT<=0){p.downT=0;addDmgNum(p.wx,p.y-200,"DE PÉ!",false,"#2ec27e");}return;}
  if(p.hurtT>0){p.hurtT-=dt;p.anim+=dt;press.punch=press.kick=false;p.bufPunchT=0;p.comboStep=0;
    if(p.grindMode){p.grindMode=null;p.grindTgt=null;p.grinding=false;p.__onProp=null;}
    if(p.throwTgt){p.throwTgt.grabbed=false;p.throwTgt=null;p.throwT=0;}return;}
  // PARALISIA (SUPER BOSS): trava os comandos, igual ao stun que o vilao leva
  if(p.paralyzedT>0){p.paralyzedT-=dt;p.anim+=dt;p.flashT=0.08;press.punch=press.kick=press.skate=press.shoot=press.mkey=press.jump=false;return;}
  // PRESO (AGARRAO): golpe imbloqueavel te pegou - trava tudo, depois solta com o dano forte
  if(p.presoT>0){
    p.presoT-=dt;p.anim+=dt;p.flashT=0.1;
    press.punch=press.kick=press.skate=press.shoot=press.mkey=press.jump=false;
    if(p.presoT<=0){
      const dmg=p.__grabDmg||10,byWx=p.__grabByWx!==undefined?p.__grabByWx:p.wx;
      p.__grabDmg=0;
      damagePlayer(dmg,byWx);
    }
    return;
  }
  if(p.grindMode){updateGrind(p,dt);p.anim+=dt;return;}
  // ===== AGARRAO: SEGURANDO O VILAO =====
  if(p.segT>0){const t=p.throwTgt;
    p.segT-=dt/GAME_SPEED;if(p.joelhaT>0)p.joelhaT-=dt;
    if(!t||t.state==="dead"||!t.grabbed){p.segT=0;p.throwTgt=null;p.state="idle";}
    else{
      t.wx=p.wx+p.facing*38*kX();t.y=p.y;t.z=0;t.kbx=0;t.facing=-p.facing;
      const ax=keys.ax||((keys.right?1:0)-(keys.left?1:0)),dirX=ax*p.facing;
      if(press.kick){press.kick=false;iniciaArremesso(p,"frente");}
      else if(press.punch){press.punch=false;
        if(dirX<-0.5)iniciaArremesso(p,"tras");
        else if(dirX>0.5)iniciaArremesso(p,"frente");
        else if(p.joelhaT<=0){p.joelhadas++;p.joelhaT=0.13;tut.joelhada=true;
          damageEnemy(Math.max(1,Math.round(HERO().dmgSoco*0.8)),1,0.6,null,t,'joelhada');
          if(t.state!=="dead"){t.grabbed=true;t.state="hurt";t.hurtT=Math.max(t.hurtT,p.segT+CFG.THROW_T+0.3);}
          AU.punch();shake=Math.max(shake,5);impactBurst(t.wx,t.y-110,"#fff2c0",false);
          addDmgNum(t.wx,t.y-230,p.joelhadas+"ª JOELHADA",false,"#ffe36a");
          if(p.joelhadas>=CFG.JOELHADAS_MAX)iniciaArremesso(p,"tras");}}
      if(p.segT>0&&p.segT<=0.001)iniciaArremesso(p,"tras");
      if(p.segT<0)iniciaArremesso(p,"tras");}
    press.jump=false;press.jumpTaps.length=0;p.anim+=dt;return;}
  // ===== 🦵 CHUTE: golpe unico de afastamento (shuv-it). Nao entra em combo, nao derruba =====
  if(press.kick){press.kick=false;
    const noAr=(p.z>(p.__onProp?p.__onProp.topH:0)+1)||p.vz>0;
    if(noAr)golpeNoAr(p);
    else if(p.atkT<=0&&p.kickT<=0&&p.throwT<=0){p.comboStep=0;p.bufPunchT=0;p.state="kick";p.kickT=0.34;p.kickHit=false;p.skAnim=0;p.atkId=(p.atkId||0)+1;AU.kickHit();}}
  // ===== 👊 SOCO: longe = combo automatico com o skate; colado (X e Y) = agarrao + arremesso =====
  if(press.punch){press.punch=false;
    const noAr=(p.z>(p.__onProp?p.__onProp.topH:0)+1)||p.vz>0;
    if(noAr)golpeNoAr(p);
    else if(p.atkT<=0&&p.kickT<=0&&p.throwT<=0)socoNoChao(p);
    else if(p.atkT>0&&p.atkT<0.22)p.bufPunchT=1;}   // apertou durante o hit: encadeia o proximo automaticamente
  // ===== BUFFER DE PULO (golpe em andamento) =====
  // ⤴️ tocado durante soco/chute/agarrao nao se perde: fica guardado (JUMP_BUFFER_S, tempo real).
  // Soco e chute podem ser CANCELADOS na recuperacao (depois da janela de acerto) pra pular na hora.
  // O agarrao nao cancela: o pulo sai assim que o arremesso termina.
  if((p.throwT>0||p.atkT>0||p.kickT>0)&&(press.jump||press.jumpTaps.length)){
    p.jumpBufT=Math.max(CFG.JUMP_BUFFER_S,p.throwT>0?p.throwT/GAME_SPEED+0.15:0); // agarrao: guarda ate o arremesso acabar
    press.jump=false;press.jumpTaps.length=0;}
  if(p.jumpBufT>0){
    p.jumpBufT-=dt/GAME_SPEED;
    const recSoco=p.atkT>0&&p.atkT<0.08,recChute=p.kickT>0&&p.kickT<0.10;
    if(recSoco||recChute){p.atkT=0;p.kickT=0;p.bufPunchT=0;p.comboStep=0;p.atkFinisher=false;p.state="idle";}
  }
  // ===== AGARRAO EM ANDAMENTO =====
  if(p.throwT>0){p.throwT-=dt;const t=p.throwTgt;
    if(t&&t.grabbed&&t.state!=="dead"){
      const k=Math.min(1,1-p.throwT/CFG.THROW_T);
      if(p.throwDir==="frente"){t.wx=p.wx+p.facing*(40+70*k)*kX();t.z=60*Math.sin(Math.PI*Math.min(1,k));}
      else{t.wx=p.wx+p.facing*(40-110*k)*kX();t.z=110*Math.sin(Math.PI*Math.min(1,k*1.1));}
      t.y=p.y;t.facing=-p.facing;t.kbx=0;}
    if(p.throwT<=0){p.throwT=0;soltaArremesso(p);p.state="idle";}
    p.anim+=dt;return;}
  // ===== COMBO AUTOMATICO TERRESTRE (3 hits; o ultimo derruba) =====
  if(p.atkT>0){p.atkT-=dt;
    if(!p.atkHit&&p.atkT<0.20&&p.atkT>0.08){
      if(quebraVinis(p,HERO().reachSoco))p.atkHit=true;
      if(bateNoCarro(p,CFG.PUNCH_RANGE_X*kX()))p.atkHit=true;
      const alvo=alvoDoSoco(p);   // so conecta dentro do quadrante 50x15
      if(alvo){p.atkHit=true;p.lastComboHit=performance.now();
        if(p.atkFinisher){
          damageEnemy(Math.round(HERO().dmgSoco*2),CFG.FINISHER_KB,0.95,"combo",alvo,'soco');
          if(alvo.state!=="dead")alvo.vz=Math.max(alvo.vz||0,420);
          shake=Math.max(shake,12);impactBurst(alvo.wx,alvo.y-100,"#fff2c0",true);
        }else{
          // hits 1 e 2: empurrao minimo pro vilao continuar dentro dos 50px do soco,
          // e o MC da meio passo a frente (igual Final Fight) pro combo fechar
          damageEnemy(HERO().dmgSoco,30,0.40,"combo",alvo,'soco');
          if(Math.abs(alvo.wx-p.wx)>CFG.PUNCH_RANGE_X*kX()*0.6)applyPropCollision(p,p.facing*8);}}
      else if(p.atkHit&&!alvo)p.lastComboHit=performance.now(); // acertou disco/carro: combo segue
    }
    if(p.atkT<=0){
      const eraFinal=p.atkFinisher;
      if(eraFinal){p.comboStep=0;p.atkFinisher=false;}
      if(!p.atkHit)p.comboStep=0;                               // errou: combo zera
      // COMBO AUTOMATICO: 1 toque engatilha; se o hit conectou, o proximo sai sozinho ate o hit que derruba
      const encadeia=p.atkHit&&!eraFinal&&p.comboStep>0;
      if((p.bufPunchT>0||encadeia)&&p.z===0){p.bufPunchT=0;if(encadeia)startComboHit(p);else socoNoChao(p);}
      else{p.bufPunchT=0;p.state="idle";}
    }
    p.anim+=dt;return;}
  // ===== CHUTE (shuv-it) =====
  if(p.kickT>0){p.kickT-=dt;
    if(!p.kickHit&&p.kickT<0.24&&p.kickT>0.10){
      if(quebraVinis(p,HERO().reachChute))p.kickHit=true;
      if(bateNoCarro(p,HERO().reachChute))p.kickHit=true;
      const alvo=alvoEmAlcance(p,HERO().reachChute,HERO().depthChute);
      if(alvo){p.kickHit=true;damageEnemy(HERO().dmgChute,CFG.KICK_KNOCKBACK,0.30,null,alvo,'chute');}}
    if(p.kickT<=0)p.state="idle";
    p.anim+=dt;return;}
  const _py0=p.y; // pra saber se estava subindo ou descendo no degrau
  let ax=keys.ax||0,ay=keys.ay||0;
  if(!ax&&!ay){ax=(keys.right?1:0)-(keys.left?1:0);ay=(keys.down?1:0)-(keys.up?1:0);}
  const amag=Math.hypot(ax,ay);if(amag>1){ax/=amag;ay/=amag;}
  let dx=Math.abs(ax)>0.25?Math.sign(ax):0,dy=Math.abs(ay)>0.25?Math.sign(ay):0;
  if(dx!==0)p.facing=dx<0?-1:1;
  // >>> AJUSTE FINO DO SALTO <<<
  // JUMP_V   = impulso do 1o salto (chao)
  // DJUMP_V  = impulso do 2o salto (no ar) - some ao pousar
  // Um so salto ja teria altura de sobra pra escapar do fogo/disco baixo
  // (lowZ dos chefes fica em 78-80; o 1o salto sozinho passa de 130).
  // O salto duplo existe pra ganhar TEMPO NO AR: numa sequencia com varios
  // jatos/discos seguidos, ele deixa o heroi flutuando por mais tempo entre
  // um ataque e o proximo, sem precisar pousar e arriscar tomar o seguinte.
  // pulo guardado no buffer: dispara assim que o MC esta livre e com o pe no chao
  if(p.jumpBufT>0&&p.atkT<=0&&p.kickT<=0&&p.throwT<=0&&p.z<=(p.__onProp?p.__onProp.topH:0)+1&&p.vz<=0){
    p.jumpBufT=0;press.jumpTaps.push(performance.now());}
  // ⤴️: processa TODOS os toques do frame, cada um com o instante real em que o dedo tocou
  if(press.jump||press.jumpTaps.length){
    const taps=press.jumpTaps.length?press.jumpTaps.splice(0):[performance.now()];
    press.jump=false;
    for(const tapT of taps){
      const jumpFloorZ=p.__onProp?p.__onProp.topH:0;
      const grounded=p.z<=jumpFloorZ+1&&p.vz<=0;
      // no chao SEMPRE pode pular (mesmo que algum estado tenha deixado jumpsUsed sujo: fim de slide, agarrao, paralisia)
      if(grounded||(p.coyoteT>0&&p.jumpsUsed===0)){
        // 1o toque: pulo normal, guarda o instante pra medir o toque duplo
        p.vz=CFG.JUMP_VZ;p.state="jump";p.jumpsUsed=1;p.grinding=false;p.coyoteT=0;
        p.escapeUsed=false;p.lastJumpTap=tapT;AU.jumpSfx();}
      else if(p.jumpsUsed===1&&!p.escapeUsed&&!p.airAtk&&tapT-p.lastJumpTap<=CFG.DOUBLE_TAP_MS){
        // 2o toque em ate 250 ms: SALTO DE FUGA
        startEscapeJump(p,dx);}
      // no ar e fora da janela da fuga: guarda pro POUSO (tocou um pouquinho antes de encostar no chao)
      else if(!p.escapeUsed||p.jumpsUsed>=1)p.jumpBufT=CFG.JUMP_BUFFER_POUSO_S;
    }
  }
  press.jump=false;
  const sc=dscale(p.y),air=(p.z>0||p.vz>0);
  if(p.mvx===undefined){p.mvx=0;p.mvy=0;}
  const ACCEL=3400,FRIC=3800; // resposta rapida: arranca e para sem deslizar
  if(air){
    if(p.escaping){ // SALTO DE FUGA: manche muda a direcao no ar
      if(dx!==0&&CFG.ESCAPE_STEER){const tgt=dx*CFG.ESCAPE_VX;
        p.mvx+=Math.max(-ACCEL*1.6*dt,Math.min(ACCEL*1.6*dt,tgt-p.mvx));}
    }else if(!p.airAtk){ // voadora segue em linha reta
      const tgt=ax*330*0.85*HERO().spd*(CFG.VEL_MUL||1.4);
      p.mvx+=Math.max(-ACCEL*dt,Math.min(ACCEL*dt,tgt-p.mvx));
    }
    applyPropCollision(p,p.mvx*dt);
  }else{
    p.jumpsUsed=0;p.escaping=false; // pisando no chao: pulo sempre liberado
    const vm=CFG.VEL_MUL||1.4; // personagem maior anda proporcionalmente mais rapido
    const tgtX=ax*330*sc*HERO().spd*vm,tgtY=ay*235*sc*HERO().spd*vm; // subir/descer a calcada mais agil
    const acX=Math.abs(ax)>0.05?ACCEL:FRIC, acY=Math.abs(ay)>0.05?ACCEL:FRIC;
    p.mvx+=Math.max(-acX*dt,Math.min(acX*dt,tgtX-p.mvx));
    p.mvy+=Math.max(-acY*dt,Math.min(acY*dt,tgtY-p.mvy));
    applyPropCollision(p,p.mvx*dt);p.y+=p.mvy*dt;
    const moving=Math.abs(p.mvx)>18||Math.abs(p.mvy)>18;
    if(dx||dy){if(p.state!=="land")p.state="run";}else if(p.state==="run"&&!moving)p.state="idle";
  }
  clampPlayerX(p);{const b=curBand();p.y=Math.max(b.top,Math.min(b.bottom,p.y));}
  bloqueiaY(p,_py0);
  aplicaDegrau(p,_py0,false);
  {const dg=degrauFase();if(dg){const dz=(dg.yRua-dg.yPlat)/kZ();   // no ar, manche pra CIMA encostado no degrau: sobe
    if(degrauAtivo(dg,p.wx)&&Math.abs(p.y-dg.yRua)<2&&ay<-0.35&&p.z>=dz+2){p.y=dg.yPlat;p.z-=dz;}}}
  // ---- ATAQUE AEREO: manobra de skate (X) e soco/chute no ar acertam ----
  // ATERRISSAGEM NA CABECA: descendo (vz<0) em cima de um vilao/boss = dano.
  // Cada queda em cima conta um acerto novo (airHit e rearmado a cada pulo).
  if(p.z>0&&p.vz<0&&(p.skating||p.airAtk)&&!p.stompHit){
    const h=HERO();
    const vit=alvos().find(t=>t.state!=="dead"&&Math.abs(t.wx-p.wx)<h.reachAr*kX()*0.9&&Math.abs(t.y-p.y)<h.depthAr&&sameLane(p.y,t.y));
    if(vit&&held.kick&&p.skating){startGrind(p,"cabeca",vit);p.anim+=dt;return;}
    if(vit){
      p.stompHit=true;p.airHit=true;
      // DECAIMENTO DE COMBO AEREO: cada acerto no ar vale menos que o anterior (evita combo infinito de graca)
      const decMul=Math.max(0.5,1-0.2*(p.airComboN||0));p.airComboN=(p.airComboN||0)+1;
      damageEnemy(Math.max(1,Math.round(h.dmgAr*decMul)),300,0.34,null,vit);
      p.vz=420;                            // quique fixo pra cima ao pisar na cabeca
      shake=Math.max(shake,10);AU.kickHit();
    }
  }
  if(p.z>34&&(p.skating||p.airAtk)){
    const h=HERO();
    if(!p.airHit)quebraVinis(p,h.reachAr);
    if(!p.airHit&&bateNoCarro(p,h.reachAr))p.airHit=true;
    if(p.airNextT>0)p.airNextT-=dt;
    const alvo=!p.airHit&&!(p.airNextT>0)&&alvos().find(t=>Math.abs(t.wx-p.wx)<h.reachAr*kX()&&Math.abs(t.y-p.y)<h.depthAr);
    if(alvo){p.airHit=true;
      const decMul=Math.max(0.5,1-0.2*(p.airComboN||0));p.airComboN=(p.airComboN||0)+1;
      const dmgA=Math.max(1,Math.round(h.dmgAr*decMul));
      if(p.airFinisher){                                  // ultimo hit do combo aereo: derruba
        p.vz=Math.min(p.vz,-60);
        damageEnemy(dmgA*2,CFG.FINISHER_KB,0.95,null,alvo);
        if(alvo.state!=="dead")alvo.vz=Math.max(alvo.vz||0,420);
        shake=Math.max(shake,12);impactBurst(alvo.wx,alvo.y-110,"#fff2c0",true);
      }else{                                              // hit intermediario: segura o alvo e fica no ar
        p.vz=Math.max(p.vz,CFG.AIR_HANG_VZ*0.5);p.mvx=p.facing*60;
        damageEnemy(dmgA,200,0.55,null,alvo);
        if(p.airBuf)golpeNoAr(p);}
    }
  }
  // SLIDE EM BANCO/CARRO: caindo com 🦵 segurado por cima de superficie grindavel = encaixa no slide
  if(held.kick&&p.skating&&p.vz<=0&&p.z>0){
    for(const pr of track){if(!pr.grind||pr.exploded)continue;
      // banco: vindo por TRAS (profundidade menor que o banco) = encosto; pela FRENTE = assento
      const nivel=(pr.topH2&&p.y<pr.y-4&&p.z>=pr.topH2-12)?pr.topH2:pr.topH;
      if(Math.abs(p.wx-pr.wx)<pr.w*0.45&&Math.abs(p.y-pr.y)<=CFG.PROP_PROF*1.6&&p.z>=nivel-10&&p.z<=nivel+80){p.grindZ=nivel;startGrind(p,"prop",pr);p.anim+=dt;return;}}}
  const noAr=(p.z>0||p.vz!==0);   // recalculado AGORA (o pisao pode ter mudado vz)
  if(noAr){p.z+=p.vz*dt;p.vz-=2000*dt;
    const floorZ=p.__onProp?p.__onProp.topH:0;
    if(p.z<=floorZ&&p.vz<=0){p.z=floorZ;p.vz=0;p.airAtk=false;p.airHit=false;p.stompHit=false;p.jumpsUsed=0;p.airComboN=0;p.airStep=0;p.airFinisher=false;p.airBuf=false;p.airNextT=0;
      // MANOBRA DE GRIND: se estava de skate ao alcançar o teto do Uno, desliza por cima
      // em vez de simplesmente "pousar" (mantem o estado de skate e ativa o rastro de faiscas).
      const grindProp=p.__onProp&&p.__onProp.grind&&p.skating&&held.kick;
      const grindMF=!p.__onProp&&p.skating&&held.kick&&pertoMeioFio(p);
      if(grindProp)startGrind(p,"prop",p.__onProp);
      else if(grindMF)startGrind(p,"meiofio");
      else{
        p.landT=0.14;p.state="land";p.skating=false;p.grinding=false;
      }
      p.mvy=0;if(p.escaping){p.isInvincible=false;p.invincibleTimer=0;}p.escaping=false; // tocou o chao: fim da invencibilidade
    }}
  else{const floorZ=p.__onProp?p.__onProp.topH:0;if(Math.abs(p.z-floorZ)>1)p.z=floorZ;}
  // TRAVA DE SEGURANCA: se por qualquer motivo o jogador ficar preso no alto,
  // forca a queda apos 2.5s de voo continuo.
  {const pisoZ=p.__onProp?p.__onProp.topH:0;
   if(p.z>pisoZ+1){p.arT=(p.arT||0)+dt; if(p.arT>2.5&&p.vz>-50)p.vz=-900;} else p.arT=0;}
  // COYOTE TIME: saiu do chao/plataforma andando (sem pular) ainda pode pular por ~0.1s
  {const pisoZ2=p.__onProp?p.__onProp.topH:0,groundedNow=(p.z<=pisoZ2+0.5);
   if(p.wasGrounded&&!groundedNow&&p.jumpsUsed===0)p.coyoteT=0.10;
   if(p.coyoteT>0)p.coyoteT-=dt;
   p.wasGrounded=groundedNow;}
  // BONUS DE TRAJETO: recompensa desviar/passar por cima de props usando pulo ou skate.
  // Cada prop so paga bonus uma vez. Da um pouco de energia (poder) + feedback visual/sonoro.
  if(p.z>40){
    for(const pr of track){
      if(pr.bonusGiven||pr.hp<=0)continue;
      if(Math.abs(p.wx-pr.wx)<(pr.w||60)*0.6){
        pr.bonusGiven=true;score+=50;
        shake=Math.max(shake,2);
        for(let i=0;i<5;i++)sparks.push({wx:pr.wx,y:p.y-p.z-10,vx:(Math.random()-0.5)*160,
          vy:-60-Math.random()*80,t:0.3,c:"#ffe36a"});
        AU.select();
      }
    }
  }
  if(p.landT>0){p.landT-=dt;if(p.landT<=0&&p.state==="land")p.state="idle";}
  // rastro de faiscas do skate deslizando por cima do Uno
  if(p.grinding&&!p.grindMode) p.grinding=false;
  if(p.grinding){
    p.grindSparkT=(p.grindSparkT||0)-dt;
    if(p.grindSparkT<=0){
      p.grindSparkT=0.045;
      sparks.push({wx:p.wx-p.facing*16,y:p.y-p.z-8,
        vx:-p.facing*(90+Math.random()*60),vy:-30-Math.random()*70,t:0.22,c:"#ffe36a"});
    }
  }else{p.grindSparkT=0;}
  const spdN=Math.min(1.4,Math.hypot(p.mvx,p.mvy)/330);
  p.anim+=dt*(0.55+spdN*0.85);}
function diffMult(pi){
  const t=[0.42,0.58,0.82,1.05,1.20,1.34,1.50]; // 7 fases ativas (JAY -> DJ MAO DE PEDRA)
  const base=t[pi]!==undefined?t[pi]:1.04;
  return base*(DIFF_MUL[difficulty]||1);
}
// Fecha uma sequencia de chefe e abre a BRECHA: ele para, fica exposto e leva
// 50% a mais de dano. E o momento desenhado pro heroi entrar e revidar.
function abreBrecha(e,cfg,tipo){
  // JANELA DE DANO: 5s de base; se o boss estiver em FURIA (HP<=40%), a brecha
  // fica mais curta - regra de "fases de HP" dando menos tempo de punir no fim da luta.
  const dur=BRECHA_DUR*((e===enemy&&e.enraged)?0.7:1);
  e.state="recuperando";e.recT=dur;e.vulnT=dur;e.vulnMax=dur;
  if(tipo==="fogo")e.fireCd=cfg.cooldown;
  else if(tipo==="disco")e.vinilCd=cfg.cooldown;
  e.fireCd=Math.max(e.fireCd||0,dur+1.2);
  e.vinilCd=Math.max(e.vinilCd||0,dur+1.2);
  e.cd=Math.max(e.cd||0,0.4);
  if(window.BossTouch && e===enemy && P.phases[e.pi] && P.phases[e.pi].chefe){
    BossTouch.startHitCounter(5,{
      timeout: Math.max(0.6, dur-0.25),
      onComplete: ()=>{ if(e.state==="recuperando") damageEnemy(16,160,0.2,null,e); },
      onTimeout: ()=>{}
    });
  }
}
function outroChefe(e){return (e===enemy)?invader:enemy;}
// escolhe a proxima sequencia do chefe (fogo ou disco), respeitando distancia
function tentaSequencia(e,dx){
  if(e.mook)return false; // capanga so briga no corpo a corpo
  // REGRA: nunca dispara sequencia de fora da tela - o aviso tem que ser visivel
  {const sx=screenX(e.wx);if(sx<60||sx>W-60)return false;}
  // REGRA DE JUSTICA: so um chefe ataca por vez. Se o outro esta no meio de uma
  // sequencia OU na brecha dele, este aqui espera - senao o heroi ficaria preso
  // entre dois bombardeios e a brecha do outro nao daria pra aproveitar.
  const o=outroChefe(e);
  if(o&&o.state!=="dead"&&o.state!=="saindo"&&(emSequencia(o)||o.vulnT>0))return false;
  const f=fireCfg(e.pi),v=vinilCfg(e.pi),ad=Math.abs(dx);
  const podeF=f&&e.fireCd<=0&&ad>f.minRange&&ad<f.maxRange;
  const podeV=v&&(e.vinilCd||0)<=0&&ad>v.minRange&&ad<v.maxRange;
  // SUPER BOSS: usa TODOS os movimentos - alem de fogo/disco, os 3 poderes extras
  // (notas, energia, paralisia) entram na mesma roleta de escolha, respeitando cooldown proprio.
  const isSuperBoss=e===enemy&&P.phases[e.pi]&&P.phases[e.pi].name==='SUPER BOSS';
  const podeN=isSuperBoss&&(e.sbNotasCd||0)<=0;
  const podeE=isSuperBoss&&(e.sbEnergiaCd||0)<=0;
  const podeP=isSuperBoss&&(e.sbParalisiaCd||0)<=0&&ad<420;
  if(!podeF&&!podeV&&!podeN&&!podeE&&!podeP)return false;
  const opts=[];
  if(podeF)opts.push("fogo");
  if(podeV)opts.push("disco");
  if(podeN)opts.push("notas");
  if(podeE)opts.push("energia");
  if(podeP)opts.push("paralisia");
  let escolha=opts[Math.floor(Math.random()*opts.length)];
  if(opts.length>1&&escolha===e.ultSeq){ // nunca repete o ultimo movimento se houver alternativa
    const alt=opts.filter(o2=>o2!==e.ultSeq);
    escolha=alt[Math.floor(Math.random()*alt.length)];
  }
  e.ultSeq=escolha;
  if(escolha==="fogo"){e.state="breathwind";e.windT=f.telegraph;e.fireN=0;
    e.aimY=aimLane(e,f);AU.chargeSfx(f.telegraph);}
  else if(escolha==="disco"){e.state="vinilwind";e.windT=v.telegraph;e.vinilN=0;
    e.aimY=aimLane(e,v);AU.chargeSfx(v.telegraph);}
  else{ // notas / energia / paralisia: telegraph generico via mesmo estado "breathwind"
    e._sbNext=escolha;e.state="breathwind";e.windT=0.9;
    e.aimY=aimLane(e,{});AU.chargeSfx(0.9);}
  if(e===enemy && P.phases[e.pi] && P.phases[e.pi].chefe){
    armBossQTE(e, Math.max(0.8, e.windT-0.2));
  }
  return true;
}
// Arma a janela do combo do boss (mesma logica usada por fogo, disco e golpes
// corpo-a-corpo): so libera a brecha/5-hits se o jogador acertar a tempo.
function armBossQTE(e, timeoutSec){
  // Sequencia de botoes do boss foi EXCLUIDA (input combinado). A brecha abre sozinha ao fim do ataque.
  e.bossSeqOK=true;
}
function updateEnemy(dt,ent){const e=ent||enemy,p=player;if(e.state==="espera")return;const dm=diffMult(e.pi)*(e.dmMul||1);
  // FASES DE HP (regra: boss deve ter 2-3 estagios dentro da propria luta, nao so entre fases).
  // Estagio 1 (60% vida): fica um pouco mais rapido. Estagio 2 (30%): furioso de vez +
  // musica acelera (mesma faixa, so o playbackRate) - reforca que "agora e serio".
  const isBossHere=(e===enemy&&P.phases[e.pi]&&P.phases[e.pi].chefe);
  if(isBossHere&&!e.furyStage1&&e.hp>0&&e.hp<=e.maxhp*0.6&&e.state!=="dead"){
    e.furyStage1=true;shake=Math.max(shake,8);
    avisoHUD("ATENTO!");
    for(let i=0;i<2;i++)rings.push({wx:e.wx,y:e.y,r:14+i*16,t:0.5,c:"#ffcf33"});
  }
  if(isBossHere&&!e.enraged&&e.hp>0&&e.hp<=e.maxhp*0.3&&e.state!=="dead"){
    e.enraged=true;shake=Math.max(shake,16);flashOverlay=Math.max(flashOverlay,0.22);
    avisoHUD("FURIOSO!");AU.power();AU.setFuryTempo(true);
    for(let i=0;i<3;i++)rings.push({wx:e.wx,y:e.y,r:14+i*16,t:0.6,c:"#ff3b3b"});
  }
  const furyMul=(isBossHere&&e.enraged)?1.35:(isBossHere&&e.furyStage1)?1.15:1;
  if(e.flashT>0)e.flashT-=dt;
  if(e.deitadoT>0)e.deitadoT-=dt;if(e.getupT>0)e.getupT-=dt;
  if(e.grabbed){e.kbx=0;e.vz=0;e.anim+=dt;return;} // preso no agarrao do MC
  // ARREMESSADO vira projetil: derruba quem estiver no caminho (Final Fight)
  if(e.flyT>0){e.flyT-=dt;
    for(const o of alvos()){if(o===e||e.flyHit.includes(o))continue;
      if(Math.abs(o.wx-e.wx)<80&&Math.abs(o.y-e.y)<40){e.flyHit.push(o);
        damageEnemy(CFG.ARREMESSO_COLATERAL,700,0.8,null,o);if(o.state!=="dead")o.vz=Math.max(o.vz||0,300);}}}
  // GRAVIDADE/PULO: vilao pode pular pra subir no Uno ou escapar de canto.
  if(e.z>0||e.vz!==0){
    e.z+=e.vz*dt;e.vz-=2000*dt;
    const floorZ=e.__onProp?e.__onProp.topH:0;
    if(e.z<=floorZ&&e.vz<=0){e.z=floorZ;e.vz=0;
      if(e.derrubado&&e.state!=="dead"){e.derrubado=false;e.deitadoT=CFG.DEITADO_T;e.getupT=CFG.DEITADO_T+CFG.LEVANTA_INVULN;
        e.state="hurt";e.hurtT=Math.max(e.hurtT||0,CFG.DEITADO_T+0.15);shake=Math.max(shake,5);}}
  }
  // DEFESA IA: chance aleatória ao receber ataque perto
  if(e.guardT>0){e.guardT-=dt;if(e.guardT<=0){e.guarding=false;e.guardT=0;}}
  if(!e.guarding&&e.state==="approach"&&(player.atkT>0||player.kickT>0)&&e.__guardRoll!==player.atkId){
    e.__guardRoll=player.atkId;
    const primeiroHit=player.kickT>0||player.comboStep<=1; // combo iniciado nao e bloqueado no meio
    if(primeiroHit&&Math.abs(e.wx-player.wx)<180&&sameLane(e.y,player.y)&&Math.random()<0.25){
      e.guarding=true;e.guardT=0.25+Math.random()*0.3;
    }
  }
  if(e.kbx!==0){e.wx+=e.kbx*dt;e.kbx*=Math.pow(0.0001,dt);if(Math.abs(e.kbx)<6)e.kbx=0;}
  if(!e.entered&&screenX(e.wx)>40&&screenX(e.wx)<W-40)e.entered=true;
  {const minX=e.invasor?150:(e.entered?Math.max(150,camX+60):-1e9);
   const maxX=e.invasor?CUR_WORLD_LEN+400:(e.entered?Math.min(CUR_WORLD_LEN-150,camX+W-60):1e9);
   e.wx=Math.max(minX,Math.min(maxX,e.wx));}
  e.anim+=dt;if(e.cd>0)e.cd-=dt;e.facing=(p.wx<e.wx)?-1:1;
  if(e.fireCd>0)e.fireCd-=dt;
  if(e.vinilCd>0)e.vinilCd-=dt;
  if(e.sbNotasCd>0)e.sbNotasCd-=dt;
  if(e.sbEnergiaCd>0)e.sbEnergiaCd-=dt;
  if(e.sbParalisiaCd>0)e.sbParalisiaCd-=dt;
  if(e.grabCd>0)e.grabCd-=dt;
  if(e.state==="dead"){e.deadT-=dt;return;}
  if(e.state==="hurt"){e.hurtT-=dt;if(e.hurtT<=0)e.state="approach";return;}
  // BRECHA: parado e vulneravel, dando espaco pro heroi atacar
  // a contagem da brecha corre mesmo enquanto o vilao cambaleia (state "hurt")
  if(e.state==="hurt"&&e.vulnT>0){
    e.vulnT-=dt;e.recT-=dt;
    if(e.hurtT<=0){
      if(e.vulnT>0&&e.__voltaBrecha){e.state="recuperando";e.__voltaBrecha=false;}
      else {e.vulnT=0;e.__voltaBrecha=false;}
    }
  }
  if(e.stunT>0){
    e.stunT-=dt;
    // paralisado: nao ataca, nao se move, pisca
    e.flashT=0.08;
    if(e.stunT<=0){e.stunT=0;e.state="approach";}
    return;
  }
  if(e.state==="recuperando"){e.recT-=dt;e.vulnT-=dt;
    if(e.recT<=0){e.state="approach";e.vulnT=0;}return;}
  if(e.state==="breathwind"){e.windT-=dt;
    if(e.windT<=0){
      if(e._sbNext){const a=e._sbNext;e._sbNext=null;
        if(a==='notas')fireSBNotas(e);
        else if(a==='energia')fireSBEnergia(e);
        else fireSBParalisia(e);
        e.state='recuperando';e.recT=1.2;e.vulnT=1.2;e.vulnMax=1.2;return;}
      e.state="breath";e.fireT=0;e.fireN=0;}return;}
  if(e.state==="breath"){const cfg=fireCfg(e.pi);
    if(!cfg){e.state="approach";return;}
    e.fireT-=dt;
    if(e.fireT<=0){
      if(e.fireN<cfg.pattern.length){spawnJet(e,cfg.pattern[e.fireN],cfg);e.fireN++;e.fireT=cfg.gap;}
      else{
        if(e===enemy && P.phases[e.pi] && P.phases[e.pi].chefe && !e.bossSeqOK){
          e.state="approach";e.fireCd=Math.max(e.fireCd||0,cfg.cooldown||3);
        } else abreBrecha(e,cfg,"fogo");
      }}
    return;}
  if(e.state==="vinilwind"){e.windT-=dt;
    if(e.windT<=0){e.state="vinil";e.vinilT=0;e.vinilN=0;}return;}
  if(e.state==="vinil"){const cfg=vinilCfg(e.pi);
    if(!cfg){e.state="approach";return;}
    e.vinilT-=dt;
    if(e.vinilT<=0){
      if(e.vinilN<cfg.pattern.length){spawnVinil(e,cfg.pattern[e.vinilN],cfg);e.vinilN++;e.vinilT=cfg.gap;}
      else{
        if(e===enemy && P.phases[e.pi] && P.phases[e.pi].chefe && !e.bossSeqOK){
          e.state="approach";e.vinilCd=Math.max(e.vinilCd||0,cfg.cooldown||3);
        } else abreBrecha(e,cfg,"disco");
      }}
    return;}
  if(e.state==="approach"){const dx=p.wx-e.wx,dy=p.y-e.y;
    e.esperaVez=!!e.mook&&atacantes(e)>=CFG.MAX_ATACANTES; // no maximo N batendo ao mesmo tempo
    if(tentaSequencia(e,dx))return;
    if(Math.abs(dx)<=(CFG.ENEMY_HIT_X-5)*kX()&&Math.abs(dy)<=CFG.ENEMY_ATK_Y&&e.cd<=0&&e.entered!==false&&!e.esperaVez){
      const isBossFight=(e===enemy && P.phases[e.pi] && P.phases[e.pi].chefe);
      e.state="windup";
      // AGARRAO: opcao rara de golpe imbloqueavel, com cooldown proprio (e.grabCd).
      const canGrab=(e.grabCd||0)<=0;
      const pool=canGrab?['jump','punch','kick','grab']:['jump','punch','kick'];
      let mt=pool[Math.floor(Math.random()*pool.length)];
      if(mt==='grab'&&Math.random()>0.4)mt='punch'; // deixa ainda mais raro sem tirar do pool
      e.meleeType=mt;
      if(mt==='grab')e.grabCd=9/dm;
      if(isBossFight){
        e.windT=(mt==='grab'?1.5:1.1)/dm/furyMul; // telegraph maior pra dar tempo do combo de 3 passos (menor se furioso)
        armBossQTE(e, Math.max(0.9, e.windT-0.15));
      } else {
        e.windT=(mt==='grab'?0.55:0.34)/dm/furyMul;
      }
      e.windT=Math.max(e.windT,CFG.TELEGRAPH_FRAMES/60); // janela limpa pra reagir com 🦵 ou ⤴️⤴️
      if(mt==='grab'){
        // telegraph proprio, vermelho - golpe imbloqueavel precisa de aviso claro
        for(let i=0;i<3;i++)rings.push({wx:e.wx,y:e.y-60,r:10+i*14,t:e.windT+0.1,c:"#ff3b3b"});
      } else {
        // PADRAO DE COR: golpe bloqueavel sempre pisca azul/amarelo, nunca vermelho
        // (vermelho fica reservado so pro que nao da pra bloquear, ensina o padrao uma vez so)
        rings.push({wx:e.wx,y:e.y-60,r:14,t:e.windT+0.1,c:"#5599ff"});
      }
    }
    else{let sp=150*dm*furyMul*(CFG.VEL_MUL_VILAO||1.3);
      if(e.mook)sp=Math.max(sp,175);          // capanga nunca anda em camera lenta
      if(e.entered===false)sp=Math.max(sp,280); // entrando pela borda: chega logo na tela
      // ZIGUEZAGUE 2.5D: longe, aproxima pela diagonal alternando flanco (cima/baixo da calcada);
      // perto, alinha a profundidade pra atacar - sempre com telegraph antes do golpe.
      e.zzT=(e.zzT||0)-dt;
      if(e.zzT<=0){e.flankSide=(e.flankSide===1?-1:1);e.zzT=0.7+Math.random()*0.5;}
      const b=curBand(),amp=Math.min(70,(b.bottom-b.top)*0.4),far=Math.abs(dx)>220;
      const ty=far?Math.max(b.top,Math.min(b.bottom,p.y+e.flankSide*amp)):p.y;
      if(e.esperaVez){ // aguardando a vez: cerca a uns 200px, sem colar
        const d=Math.abs(dx);
        if(d>230*kX())applyPropCollision(e,Math.sign(dx)*sp*dt);
        else if(d<170*kX())applyPropCollision(e,-Math.sign(dx)*sp*0.6*dt);
      }else if(Math.abs(dx)>CFG.ENEMY_STOP_DIST*kX()){ // para dentro do alcance do soco do MC
        const ahead=propUnder(e.wx+Math.sign(dx)*90,e.y);
        if(ahead&&ahead.solidTop&&e.z<=0&&e.vz===0)e.vz=620;
        applyPropCollision(e,Math.sign(dx)*sp*dt);
      }
      {const py0=e.y,dyT=ty-e.y;e.y+=Math.sign(dyT)*Math.min(Math.abs(dyT),sp*0.8*dt);e.y=Math.max(b.top,Math.min(b.bottom,e.y));bloqueiaY(e,py0);aplicaDegrau(e,py0,true,p.y);}}}
  else if(e.state==="windup"){e.windT-=dt;if(e.windT<=0){e.state="attack";e.atkT=0.32;e.atkHit=false;}}
  else if(e.state==="attack"){e.atkT-=dt;
    if(!e.atkHit&&e.atkT<0.22&&e.atkT>0.08){
      const phD=P.phases[e.pi];
      // Pulo usa o mesmo valor de Soco (não tem campo próprio no admin)
      const dmgSoco=(phD&&phD.dmgSoco!=null)?phD.dmgSoco:((phD&&phD.dmg!=null)?phD.dmg:Math.min(19,9+e.pi*2));
      const dmgChute=(phD&&phD.dmgChute!=null)?phD.dmgChute:dmgSoco;
      if(e.meleeType==='grab'){
        // AGARRAO: golpe IMBLOQUEAVEL - so escapa com esquiva/i-frames, guarda nao adianta.
        // Fecha o triangulo ataque > guarda > agarrao > esquiva > ataque.
        if(inReach(e,p,CFG.ENEMY_HIT_X+10,CFG.ENEMY_HIT_Y+1)){
          e.atkHit=true;
          if(p.iframes>0||p.isInvincible){
            e.cd=Math.max(e.cd||0,0.6); // errou o agarrao: fica mais exposto
          }else{
            p.guarding=false;p.guardChain=0;p.grinding=false;
            p.presoT=0.5;p.state="presa";p.mvx=0;p.mvy=0;p.vz=0;p.z=0;
            p.__grabDmg=Math.max(1,Math.round(dmgSoco*1.6*(e.dmgMul||1)));p.__grabByWx=e.wx;
            shake=Math.max(shake,10);AU.hurt();
          }
        }
      } else if(inReach(e,p,CFG.ENEMY_HIT_X,CFG.ENEMY_HIT_Y+1)){e.atkHit=true;
        const dmgV=(e.meleeType==='kick')?dmgChute:dmgSoco;
        damagePlayer(Math.max(1,Math.round(dmgV*(e.dmgMul||1))),e.wx);
      }
    }
    if(e.atkT<=0){
      if(e===enemy && P.phases[e.pi] && P.phases[e.pi].chefe && e.meleeType){
        const golpeOk=e.bossSeqOK; e.meleeType=null;
        if(golpeOk) abreBrecha(e,{recover:1.4},"melee");
        else{e.state="approach";e.cd=0.55/dm/furyMul;}
      } else {e.state="approach";e.cd=0.55/dm/furyMul;}
    }}
  e.prevWx=e.__pw||e.wx;e.__pw=e.wx;}

// =====================================================================
// INVASAO DOS CHEFES: JAY e DJ MAO DE PEDRA aparecem no meio das outras fases
// =====================================================================
// >>> AJUSTE FINO DA INVASAO <<<
const INVASAO={
  primeira:[16,26],   // segundos ate a 1a invasao da fase (sorteia no intervalo)
  proxima:[26,40],    // intervalo ate a invasao seguinte
  permanencia:18,     // quanto tempo o chefe fica antes de ir embora
  vida:110,           // energia do chefe invasor
  forca:0.85,         // multiplicador de agressividade (velocidade/cadencia)
  curaAoDerrotar:14   // vida devolvida ao heroi se ele derrubar o invasor
};
let invader=null,invadeT=0,bannerT=0,bannerNome="",bannerCor="#ffcf33";
function sorteia(par){return par[0]+Math.random()*(par[1]-par[0]);}
function agendaInvasao(primeira){
  // REGRA: curva de dificuldade tambem no RITMO, nao so em dano/velocidade -
  // em fases mais avancadas as invasoes do boss cameo ficam mais frequentes.
  const mul=Math.max(0.6,1-phaseIndex*0.06);
  invadeT=sorteia(primeira?INVASAO.primeira:INVASAO.proxima)*mul;
}
function tentaInvasao(dt){
  if(scene!=="phase"||phaseResolved)return;
  if(invader){atualizaInvader(dt);return;}
  if(waveAtiva)return; // chefe cameo nao invade no meio de uma onda de capangas
  invadeT-=dt;if(invadeT>0)return;
  const cands=idxChefes().filter(i=>i!==enemy.pi);
  if(!cands.length){invadeT=9999;return;}
  const pi=cands[(Math.random()*cands.length)|0];
  const b=curBand();
  // entra pelo lado que tiver mais espaco de tela
  const peloDireito=(screenX(player.wx)<W*0.6);
  const wx=peloDireito?(camX+W+150):(camX-150);
  invader={pi,wx,y:b.top+(b.bottom-b.top)*(0.35+Math.random()*0.4),
    facing:peloDireito?-1:1,state:"entrando",anim:0,windT:0,atkT:0,atkHit:false,
    hurtT:0,cd:0,kbx:0,flashT:0,deadT:0,hp:INVASAO.vida,maxhp:INVASAO.vida,
    combo:0,fireCd:1.2,vinilCd:2.4,fireT:0,fireN:0,vinilT:0,vinilN:0,
    vulnT:0,vulnMax:1,recT:0,ficaT:INVASAO.permanencia,dmMul:INVASAO.forca*(1+phaseIndex*0.05),
    invasor:true};
  bannerT=2.4;bannerNome=P.phases[pi].name;bannerCor=P.phases[pi].accent;
  AU.power();flashOverlay=Math.max(flashOverlay,0.28);shake=Math.max(shake,14);
}
function atualizaInvader(dt){
  const e=invader,p=player;
  if(e.state!=="entrando"&&e.state!=="dead"&&!e.grabbed&&screenX(e.wx)<-160){invader=null;agendaInvasao(false);return;}
  if(e.state==="dead"){e.deadT-=dt;
    if(e.deadT<=0){ // recompensa por derrubar o chefe invasor
      player.hp=Math.min(player.maxhp,player.hp+INVASAO.curaAoDerrotar);
      for(const r of[0,1,2])rings.push({wx:e.wx,y:e.y,r:20+r*16,t:0.8,c:"#2ec27e"});
      addDmgNum(player.wx,player.y-200,"+"+INVASAO.curaAoDerrotar,true);
      invader=null;agendaInvasao(false);}
    return;}
  if(e.state==="entrando"){
    const alvoX=p.wx+(e.facing<0?420:-420);
    e.wx+=Math.sign(alvoX-e.wx)*260*dt;
    e.facing=(p.wx<e.wx)?-1:1;e.anim+=dt;
    if(Math.abs(e.wx-alvoX)<40)e.state="approach";
    e.prevWx=e.__pw||e.wx;e.__pw=e.wx;return;}
  if(e.state==="saindo"){
    e.wx+=(e.facing<0?1:-1)*300*dt;e.anim+=dt;
    e.prevWx=e.__pw||e.wx;e.__pw=e.wx;
    if(Math.abs(screenX(e.wx))>W+220){invader=null;agendaInvasao(false);}
    return;}
  e.ficaT-=dt;
  // so vai embora entre sequencias, nunca no meio de uma
  if(e.ficaT<=0&&(e.state==="approach"||e.state==="recuperando")){
    e.state="saindo";bannerT=1.4;bannerNome=P.phases[e.pi].name+" SUMIU";bannerCor="#8d8471";return;}
  updateEnemy(dt,e);
}
function drawBannerInvasao(dt){
  if(bannerT<=0)return;bannerT-=dt;
  const a=Math.min(1,bannerT/0.4);
  cx.save();cx.globalAlpha=a;
  cx.fillStyle="rgba(6,4,10,.82)";cx.fillRect(0,150,W,86);
  cx.fillStyle=bannerCor;cx.fillRect(0,150,W,4);cx.fillRect(0,232,W,4);
  cx.textAlign="center";
  cx.fillStyle=bannerCor;cx.font='12px "Press Start 2P",monospace';
  cx.fillText("CHEFE NA AREA",W/2,180);
  cx.fillStyle="#fff";cx.font='26px "Press Start 2P",monospace';
  cx.fillText(bannerNome,W/2,216);
  cx.restore();cx.textAlign="left";
}
function updateShots(dt){for(const s of shots){s.wx+=s.vx*dt;s.t-=dt;
    const alvo=alvos().find(t=>Math.abs(s.wx-t.wx)<58&&Math.abs(s.depthY-t.y)<52&&sameLane(s.depthY,t.y));
    if(alvo){damageEnemy(12,150,0.2,null,alvo,'tiro');s.t=0;continue;}
    for(const v of vinis){if(!v.morto&&Math.abs(v.wx-s.wx)<44&&Math.abs(v.y-s.depthY)<60){
      v.morto=true;impactBurst(v.wx,v.y-70,"#c9a0ff",false);s.t=0;break;}}}
  shots=shots.filter(s=>s.t>0);}
// ---------- desenho ----------
function skIdx(){const S=HIMG();return cyc(S.skate,player.skAnim*((CFG.FPS&&CFG.FPS.skate)||10))||S.jump[0];}
function seqFrame(arr,prog){ // prog 0..1 -> índice do frame
  if(!arr||!arr.length)return null;
  const i=Math.min(arr.length-1,Math.max(0,Math.floor((prog||0)*arr.length)));return arr[i];}
function cyc(arr,i){if(!arr||!arr.length)return null;return arr[((Math.floor(i)%arr.length)+arr.length)%arr.length];}
function mcFrame(){const p=player,S=HIMG(),F=CFG.FPS||{};
  const has=a=>a&&a.length;
  if(p.hurtT>0&&has(S.dano))return S.dano[Math.min(S.dano.length-1,p.hurtT>0.16?0:1)];
  if(p.segT>0){const f=S.throw;return has(f)?(p.joelhaT>0?f[Math.min(1,f.length-1)]:f[0]):skIdx();} // segurando / joelhada
  if(p.throwT>0){const f=S.throw;if(!has(f))return skIdx();                                    // arremesso
    const sub=p.throwDir==="frente"?[f[Math.min(1,f.length-1)],f[f.length-1]]:f.slice(Math.min(2,f.length-1));
    return seqFrame(sub,1-p.throwT/CFG.THROW_T);}
  if(p.downT>0&&has(S.dano))return S.dano[S.dano.length-1];                                  // no chao
  if(p.grindMode){const q=p.manobra&&MANOBRAS[p.manobra]?S[MANOBRAS[p.manobra].quadro]:null;   // pose da manobra
    if(has(q))return cyc(q,p.skAnim*(F.slide||12));
    return has(S.slide)?cyc(S.slide,p.skAnim*(F.slide||12)):skIdx();}                         // slide
  if(p.atkT>0&&p.atkFinisher)return has(S.comboFinal)?seqFrame(S.comboFinal,1-p.atkT/0.30):skIdx(); // hit final
  if(p.atkT>0)return seqFrame(S.attack,1-p.atkT/0.30);                                           // soco
  if(p.kickT>0)return seqFrame(S.kick,1-p.kickT/0.34);                                           // shuv-it
  if(p.z>0&&p.airAtk)return has(S.voadora)?cyc(S.voadora,p.skAnim*(F.voadora||10)):skIdx();     // voadora
  if(p.z>0&&p.escaping&&has(S.fuga)){const f=S.fuga;return p.vz>180?f[0]:(p.vz>-180?f[Math.min(1,f.length-1)]:f[f.length-1]);}
  if(p.dashT>0)return skIdx();
  if(p.skating||(p.state==="skate"&&p.z>0))return skIdx();
  if(p.z>0){const j=S.jump; // subindo / apice / caindo
    if(p.vz>180)return j[0];
    if(p.vz>-180)return j[Math.min(1,j.length-1)];
    return j[Math.min(2,j.length-1)];}
  if(p.state==="land"&&has(S.land))return S.land[Math.min(S.land.length-1,p.landT>0.07?0:1)];
  if(p.state==="run")return cyc(S.run,p.anim*(F.run||12));
  return cyc(S.idle,p.anim*(F.idle||4));
}
function enFrame(ent){const e=ent||enemy,S=e.imgSet||IMG.phases[e.pi];
  const anim=!!S.walkA; // vilão animado quadro-a-quadro?
  if(e.state==="dead"&&S.koPose)return S.koPose[0];
  if(e.state==="attack"){
    if(e.meleeType && anim){
      const arr=(e.meleeType==='kick')?S.chuteA:(e.meleeType==='jump'?(S.puloA||S.socoA):S.socoA);
      return seqFrame(arr,1-e.atkT/0.32);
    }
    if(anim){
      if(S.attack3){const i=e.combo%3,arr=i===0?S.socoA:(i===1?S.chuteA:[S.attack3[0]]);return seqFrame(arr,1-e.atkT/0.32);}
      const arr=(e.combo%2===0||!S.chuteA)?S.socoA:S.chuteA;return seqFrame(arr,1-e.atkT/0.32);}
    if(S.attack3){const i=e.combo%3;return i===0?S.attack[0]:(i===1?S.attack2[0]:S.attack3[0]);}
    return e.combo%2===0?S.attack[0]:S.attack2[0];}
  if(e.state==="breathwind"||e.state==="vinilwind")return anim&&S.socoA?S.socoA[0]:(S.taunt?S.taunt[0]:S.idle[0]);
  if(e.state==="breath"||e.state==="vinil")return anim&&S.socoA?S.socoA[S.socoA.length-1]:(S.attack?S.attack[0]:S.idle[0]);
  if(e.state==="recuperando")return anim&&S.danoA?S.danoA[0]:(S.taunt?S.taunt[0]:S.idle[0]);
  if(e.state==="entrando"||e.state==="saindo"){
    if(anim&&S.walkA)return cyc(S.walkA,e.anim*((CFG.FPS&&CFG.FPS.walkV)||10));
    return S.idle[0];}
  if(e.state==="windup"){
    if(e.meleeType && anim){
      const arr=(e.meleeType==='kick')?S.chuteA:(e.meleeType==='jump'?(S.puloA||S.socoA):S.socoA);
      return arr[0];
    }
    return anim?S.socoA[0]:S.guard[0];
  }
  if(e.state==="hurt")return anim&&S.danoA?S.danoA[e.hurtT>0.16?0:Math.min(1,S.danoA.length-1)]:S.taunt[0];
  // approach: se está andando (mudou de x recentemente), toca walk; senão idle
  if(anim){
    if(e.state==="approach"&&Math.abs(e.wx-(e.prevWx||e.wx))>0.4)return cyc(S.walkA,e.anim*((CFG.FPS&&CFG.FPS.walkV)||10));
    if(S.idleA)return cyc(S.idleA,e.anim*((CFG.FPS&&CFG.FPS.idleV)||4));
  }
  return S.idle[0];}
// =====================================================================
// GUIA DE ALINHAMENTO NA CALCADA (hitbox 50 x 15 visivel)
// - Anel DOURADO no chao do vilao = mesma faixa da calcada (|dY| <= 15): da pra acertar.
// - Anel VERDE DUPLO = dentro do quadrante do soco AGORA (👊 conecta).
// - Seta no pe do MC = vilao perto em X mas fora da faixa: mostra se sobe ou desce.
// So aparece com o MC no chao e vilao por perto: nada de poluicao visual.
// =====================================================================
function drawAlinhamento(){
  if(!CFG.GUIA_ALINHAMENTO)return;
  const p=player;if(p.z>5||scene!=="phase")return;
  const puls=0.6+0.4*Math.sin(performance.now()/140);
  let setaDir=0,setaDist=1e9;
  for(const t of alvos()){
    if(t.state==="dead"||t.grabbed||t.state==="espera")continue;
    const dx=t.wx-p.wx,ady=Math.abs(t.y-p.y);
    if(Math.abs(dx)>320)continue;
    if(ady>CFG.PUNCH_RANGE_Y){
      // perto em X mas desalinhado: candidato a seta de subir/descer
      if(Math.abs(dx)<=(CFG.PUNCH_RANGE_X+40)*kX()&&ady<=70&&Math.abs(dx)<setaDist){setaDist=Math.abs(dx);setaDir=Math.sign(t.y-p.y);}
      continue;}
    const acerta=noQuadranteDoSoco(p,t);
    const sx=screenX(t.wx),sc=dscale(t.y),rx=44*sc*(t.sizeMul||1),ry=12*sc;
    cx.save();cx.lineWidth=3;
    if(acerta){
      cx.fillStyle="rgba(46,194,126,.30)";cx.strokeStyle="rgba(80,255,160,"+(0.7+0.3*puls)+")";
      cx.beginPath();cx.ellipse(sx,t.y,rx,ry,0,0,6.283);cx.fill();cx.stroke();
      cx.lineWidth=2;cx.beginPath();cx.ellipse(sx,t.y,rx+8*sc,ry+4*sc,0,0,6.283);cx.stroke(); // anel duplo
    }else{
      cx.fillStyle="rgba(255,207,51,.12)";cx.strokeStyle="rgba(255,207,51,"+(0.4+0.35*puls)+")";
      cx.beginPath();cx.ellipse(sx,t.y,rx,ry,0,0,6.283);cx.fill();cx.stroke();}
    cx.restore();}
  if(setaDir){ // seta no pe do MC apontando pra faixa do vilao
    const sx=screenX(p.wx),sc=dscale(p.y),y=p.y+setaDir*(22*sc),h=12*sc,w=11*sc;
    cx.save();cx.fillStyle="rgba(255,207,51,"+(0.55+0.45*puls)+")";cx.strokeStyle="#000";cx.lineWidth=2;
    cx.beginPath();cx.moveTo(sx,y+setaDir*h);cx.lineTo(sx-w,y);cx.lineTo(sx+w,y);cx.closePath();cx.fill();cx.stroke();
    cx.restore();}
}
// MC com fantasma translucido enquanto os i-frames do Salto de Fuga estao ativos
function drawPlayerActor(){const p=player;
  if(p.isInvincible){cx.save();cx.globalAlpha=(performance.now()%120<60)?0.45:0.8;drawActor(p,mcFrame(),p.z,false);cx.restore();}
  else drawActor(p,mcFrame(),p.z,false);}
function drawShadow(sx,y,sc,z){const w=112*sc*(1-Math.min(z/260,0.4));cx.save();
  cx.globalAlpha=0.32*(1-Math.min(z/300,0.6));cx.fillStyle="#000";cx.beginPath();
  cx.ellipse(sx,y,w*0.5,14*sc,0,0,6.283);cx.fill();cx.restore();}
// TAMANHO DOS PERSONAGENS na tela (Admin → Controles → Escala dos personagens). 0.80 era pequeno demais pro cenario.
function escalaChar(){return CFG.ESCALA_PERSONAGENS||1.7;}
// distancias horizontais de golpe acompanham o tamanho na tela (valores do Admin valem pra escala 0.8 original)
function kX(){return escalaChar()/0.8;}
// altura na tela (pulo, voadora, fuga, props): mesmo tempo de pulo, desenho mais alto
function kZ(){return CFG.ESCALA_ALTURA||1.6;}
function drawActor(a,fr,z,dead){if(!fr||!fr.img)return;
  const porte=(a&&a.sizeMul!==undefined)?a.sizeMul:((a&&a.pi!==undefined&&IMG.phases[a.pi])?(IMG.phases[a.pi].sizeMul||1):1);
  z=(z||0)*kZ();
  const sc=dscale(a.y)*escalaChar()*porte,dw=fr.w*sc,dh=fr.h*sc,sx=screenX(a.wx),dx=sx-dw/2,dy=(a.y-z)-dh;
  drawShadow(sx,a.y,sc,z);cx.save();
  const deitado=(a.downT>0)||(a.deitadoT>0&&a.state!=="dead");
  {const agora=performance.now(),zAnt=a._pz||0;
    if(zAnt>6&&z<=0)a._sqT=agora;                       // acabou de pousar
    const subindo=z>zAnt+0.5;a._pz=z;
    if(!deitado&&!dead){let kx=1,ky=1;const d=a._sqT?(agora-a._sqT)/150:1;
      if(d<1){const f=(1-d)*(1-d);kx=1+0.143*f;ky=1-0.143*f;}
      else if(subindo){kx=0.945;ky=1.066;}
      if(kx!==1){cx.translate(sx,a.y-z);cx.scale(kx,ky);cx.translate(-sx,-(a.y-z));}}}
  if(deitado){cx.translate(sx,a.y);cx.rotate(-Math.PI/2*(a.facing<0?-1:1));cx.translate(-sx,-a.y+dw*0.18);}
  else if((a.getupT>0||(a===player&&a.isInvincible&&!a.escaping))&&(performance.now()%140)<70)cx.globalAlpha=0.45;
  if(a.facing<0){cx.translate(sx,0);cx.scale(-1,1);cx.translate(-sx,0);}
  if(dead)cx.globalAlpha=Math.max(0.15,a.deadT/1.4);
  if(fr.img.ok){try{cx.drawImage(fr.img,dx,dy,dw,dh);}catch(e){}}else{cx.fillStyle="#c0392b";cx.fillRect(dx,dy,dw,dh);}
  if(a.flashT>0){const fl=flashOf(fr);if(fl){cx.globalAlpha=Math.min(1,a.flashT/0.14);cx.drawImage(fl,dx,dy,dw,dh);}}
  cx.restore();}
// banco de praca desenhado no codigo (ferro verde + ripas de madeira), sem arte externa
// PROPS COM ARTE (assets/props): banco, caixa de som e lixeira desenhados pela IA.
// A altura na tela segue a altura de colisao (topH), entao subir/dar slide bate com o desenho.
function drawPropImg(pr,sx,im,alturaTela,ratioTopo){
  const H=alturaTela/ratioTopo,Wd=H*(im.naturalWidth||im.width)/(im.naturalHeight||im.height);
  const tilt=pr.dmg>=2?0.05:0;
  drawShadow(sx,pr.y,Wd/120,0);
  cx.save();cx.translate(sx,pr.y);cx.rotate(tilt);cx.translate(-sx,-pr.y);
  if(pr.flashT>0&&"filter" in cx)cx.filter="brightness(2.6)";
  try{cx.drawImage(im,sx-Wd/2,pr.y-H,Wd,H);}catch(e){}
  cx.filter="none";
  if(pr.dmg>=1){const x0=sx-Wd/2,top=pr.y-H;cx.strokeStyle="rgba(255,255,255,.6)";cx.lineWidth=2;cx.beginPath();
    cx.moveTo(x0+Wd*0.3,top+H*0.2);cx.lineTo(x0+Wd*0.45,top+H*0.45);cx.lineTo(x0+Wd*0.38,top+H*0.7);
    if(pr.dmg>=2){cx.moveTo(x0+Wd*0.7,top+H*0.3);cx.lineTo(x0+Wd*0.58,top+H*0.55);cx.lineTo(x0+Wd*0.68,top+H*0.9);}cx.stroke();}
  cx.restore();}
function drawBanco(pr,sx,sc){
  {const im=IMG.props.banco;if(im&&im.img&&im.img.ok){drawPropImg(pr,sx,im.img,pr.topH*kZ(),0.5);return;}} // assento = metade da altura do desenho
  const w=pr.w*sc,top=pr.y-pr.topH*kZ(),x0=sx-w/2,ferro="#1f5a3a",ferroL="#2f7a52",mad="#8a5a2b",madL="#b07a40";
  drawShadow(sx,pr.y,sc*1.6,0);
  cx.save();
  cx.fillStyle=ferro;cx.fillRect(x0+w*0.08,top,7*sc,pr.y-top);cx.fillRect(x0+w*0.92-7*sc,top,7*sc,pr.y-top);
  cx.fillRect(x0+w*0.08,top-38*sc,6*sc,38*sc);cx.fillRect(x0+w*0.92-6*sc,top-38*sc,6*sc,38*sc);
  cx.fillStyle=mad;cx.fillRect(x0+w*0.04,top-34*sc,w*0.92,9*sc);cx.fillRect(x0+w*0.04,top-21*sc,w*0.92,9*sc);
  cx.fillStyle=madL;cx.fillRect(x0+w*0.04,top-34*sc,w*0.92,2*sc);cx.fillRect(x0+w*0.04,top-21*sc,w*0.92,2*sc);
  cx.fillStyle=mad;cx.fillRect(x0,top-4*sc,w,10*sc);
  cx.fillStyle=madL;cx.fillRect(x0,top-4*sc,w,3*sc);
  cx.fillStyle=ferroL;cx.fillRect(x0-2*sc,top-10*sc,8*sc,16*sc);cx.fillRect(x0+w-6*sc,top-10*sc,8*sc,16*sc);
  cx.restore();}
function drawObst(pr,sx,sc){
  {const im=pr.type==="caixa"?IMG.props.caixaSom:IMG.props.lixeira;
   if(im&&im.img&&im.img.ok){drawPropImg(pr,sx,im.img,pr.topH*kZ(),pr.type==="caixa"?0.95:0.98);return;}}
  const w=pr.w*sc,top=pr.y-pr.topH*kZ(),x0=sx-w/2,h=pr.topH*kZ(),tilt=pr.dmg>=2?0.05:0;
  drawShadow(sx,pr.y,sc*(pr.w/110),0);
  cx.save();cx.translate(sx,pr.y);cx.rotate(tilt);cx.translate(-sx,-pr.y);
  if(pr.type==="caixa"){ // caixa de som do sound system
    cx.fillStyle="#141214";cx.fillRect(x0,top,w,h);
    cx.fillStyle="#2a262a";cx.fillRect(x0+3*sc,top+3*sc,w-6*sc,h-6*sc);
    cx.fillStyle="#2ec27e";cx.fillRect(x0,top,w,4*sc);cx.fillStyle="#ffcf33";cx.fillRect(x0,top+4*sc,w,3*sc);cx.fillStyle="#c0392b";cx.fillRect(x0,top+7*sc,w,3*sc);
    const r1=Math.min(w,h)*0.26;
    [[0.66,r1],[0.3,r1*0.55]].forEach(([fy,r])=>{cx.fillStyle="#0a0a0a";cx.beginPath();cx.arc(sx,top+h*fy,r,0,6.283);cx.fill();
      cx.strokeStyle="#555";cx.lineWidth=2*sc;cx.beginPath();cx.arc(sx,top+h*fy,r*0.8,0,6.283);cx.stroke();
      cx.fillStyle="#333";cx.beginPath();cx.arc(sx,top+h*fy,r*0.28,0,6.283);cx.fill();});
  }else{ // latao de lixo
    cx.fillStyle="#3c5a44";cx.fillRect(x0,top+6*sc,w,h-6*sc);
    cx.fillStyle="#2c4432";for(let i=1;i<4;i++)cx.fillRect(x0,top+h*i/4,w,3*sc);
    cx.fillStyle="#5f8a6a";cx.fillRect(x0+w*0.15,top+8*sc,4*sc,h-12*sc);
    cx.fillStyle="#6b7d70";cx.beginPath();cx.ellipse(sx,top+6*sc,w/2+2*sc,7*sc,0,0,6.283);cx.fill();}
  if(pr.dmg>=1){cx.strokeStyle="rgba(255,255,255,.55)";cx.lineWidth=1.5;cx.beginPath();
    cx.moveTo(x0+w*0.2,top+h*0.2);cx.lineTo(x0+w*0.45,top+h*0.45);cx.lineTo(x0+w*0.35,top+h*0.7);
    if(pr.dmg>=2){cx.moveTo(x0+w*0.8,top+h*0.3);cx.lineTo(x0+w*0.6,top+h*0.55);cx.lineTo(x0+w*0.75,top+h*0.9);}cx.stroke();}
  if(pr.flashT>0){cx.globalAlpha=0.6;cx.fillStyle="#fff";cx.fillRect(x0,top,w,h);}
  cx.restore();}
function drawProps(){for(const pr of track)drawProp(pr);drawSmoke();}
function drawProp(pr){{const sx=screenX(pr.wx);if(sx<-150||sx>W+150)return;
    const sc=dscale(pr.y);
    if(pr.exploded)return;
    if(pr.type==="banco"){drawBanco(pr,sx,sc);return;}
    if(pr.breakable){drawObst(pr,sx,sc);return;}
    const im=(pr.type==="uno")?IMG.props.uno.stages[Math.min(pr.dmg||0,2)]:IMG.props[pr.type];
    // pr.w/pr.h ja tem a escala do admin aplicada (copoScale/unoScale * imagem original)
    // basta normalizar pelo tamanho original e multiplicar por dscale
    const propSc=pr.sc||(pr.type==="uno"?PROP_CFG.unoScale:PROP_CFG.copoScale);
    const dw=im.w*propSc*sc,dh=im.h*propSc*sc,dx=sx-dw/2,dy=pr.y-dh;
    drawShadow(sx,pr.y,sc*propSc,0);
    if(im.img.ok){try{cx.drawImage(im.img,dx,dy,dw,dh);}catch(e){}}else{cx.fillStyle="#333";cx.fillRect(dx,dy,dw,dh);}}
}
// fumaca continua saindo do motor do Uno quando ele esta no dano maximo (destruido) - nunca some
let smokes=[];
function updateSmoke(dt){
  for(const pr of track){
    if(pr.type!=="uno"||pr.dmg<2)continue;
    pr.smokeT=(pr.smokeT||0)-dt;
    if(pr.smokeT<=0){
      pr.smokeT=0.3+Math.random()*0.25;
      smokes.push({wx:pr.wx-pr.w*0.16,y:pr.y-pr.h*0.60,t:1.5,maxT:1.5,
        vy:-28-Math.random()*14,vx:(Math.random()-0.5)*10,r:7+Math.random()*5});
    }
  }
  for(let i=smokes.length-1;i>=0;i--){const s=smokes[i];
    s.t-=dt;s.y+=s.vy*dt;s.wx+=s.vx*dt;s.r+=dt*16;
    if(s.t<=0)smokes.splice(i,1);}
}
function drawSmoke(){for(const s of smokes){const sx=screenX(s.wx);const a=Math.max(0,s.t/s.maxT)*0.5;
  cx.save();cx.globalAlpha=a;cx.fillStyle="#888";cx.beginPath();
  cx.ellipse(sx,s.y,s.r,s.r*0.8,0,0,6.283);cx.fill();cx.restore();}}
function drawRings(){for(const r of rings){const sx=screenX(r.wx);cx.save();cx.globalAlpha=Math.max(0,r.t/0.95);cx.strokeStyle=r.c;
  cx.lineWidth=5;cx.beginPath();cx.ellipse(sx,r.y,r.r,r.r*0.34,0,0,6.283);cx.stroke();cx.restore();}}
function drawShots(){for(const s of shots){const sx=screenX(s.wx);cx.save();cx.globalAlpha=Math.max(.2,s.t/1.4);cx.strokeStyle="#7ad0ff";cx.lineWidth=4;
  for(let a=0;a<3;a++){cx.beginPath();const off=a*12*s.dir;cx.arc(sx-off,s.y,10+a*5,s.dir>0?-0.9:2.2,s.dir>0?0.9:4.1);cx.stroke();}cx.restore();}}
function drawSparks(){for(const s of sparks){const sx=screenX(s.wx);cx.globalAlpha=Math.max(0,s.t/0.26);cx.fillStyle=s.c;cx.fillRect(sx-3,s.y-3,6,6);}cx.globalAlpha=1;}
function drawBursts(){
  for(const b of bursts){
    const sx=screenX(b.wx),p=b.t/b.maxT,len=b.len*(0.4+0.6*p);
    const x2=sx+Math.cos(b.ang)*len, y2=b.y+Math.sin(b.ang)*len*0.7;
    cx.save();cx.globalAlpha=Math.max(0,p);cx.strokeStyle=b.c;cx.lineWidth=3;
    cx.beginPath();cx.moveTo(sx,b.y);cx.lineTo(x2,y2);cx.stroke();cx.restore();
  }
  cx.globalAlpha=1;
}
function drawDmgNums(){
  cx.textAlign="center";
  for(const dn of dmgNums){
    const sx=screenX(dn.wx);
    const yy=dn.y-((0.75-dn.t)*130);
    cx.save();cx.globalAlpha=Math.max(0,Math.min(1,dn.t/0.75));
    cx.font=(dn.crit?'22px':'16px')+' "Press Start 2P",monospace';
    cx.fillStyle=dn.cor||(dn.crit?"#ff5a3c":"#fff2c0");
    cx.strokeStyle="#000";cx.lineWidth=3;
    cx.strokeText(String(dn.val),sx,yy);cx.fillText(String(dn.val),sx,yy);
    cx.restore();
  }
  cx.globalAlpha=1;cx.textAlign="left";
}
function drawFlashOverlay(){
  if(avisoT>0){cx.save();cx.globalAlpha=Math.min(1,avisoT*1.6);cx.font='bold 26px "Press Start 2P",monospace';
    cx.textAlign="center";cx.lineWidth=6;cx.strokeStyle="#000";cx.strokeText(avisoTxt,W/2,H*0.34);
    cx.fillStyle="#ff5d5d";cx.fillText(avisoTxt,W/2,H*0.34);cx.restore();}
  if(flashOverlay<=0)return;
  cx.save();cx.globalAlpha=Math.min(0.55,flashOverlay);cx.fillStyle="#fff";cx.fillRect(0,0,W,H);cx.restore();
}
function bar(x,y,w,h,pct,col,col2,align){cx.fillStyle="#000";const bx=align==="r"?x-w:x;cx.fillRect(bx-2,y-2,w+4,h+4);
  cx.fillStyle="#2a1414";cx.fillRect(bx,y,w,h);const fw=Math.max(0,w*pct),fx=align==="r"?x-fw:x;
  cx.fillStyle=col;cx.fillRect(fx,y,fw,h);cx.fillStyle=col2;cx.fillRect(fx,y,fw,4);}
function pill(x,y,w,label,unlocked,cd,max,col){
  cx.fillStyle="#000";cx.fillRect(x-1,y-1,w+2,20);cx.fillStyle="#181410";cx.fillRect(x,y,w,18);
  const ready=cd<=0,fillp=unlocked?(ready?1:1-cd/max):0;
  cx.fillStyle=unlocked?(ready?col:"#4a4028"):"#241d16";cx.fillRect(x,y,w*fillp,18);
  cx.font='8px "Press Start 2P",monospace';cx.textAlign="center";
  cx.fillStyle=unlocked?(ready?"#0a0a0f":"#a89a72"):"#5a4d3a";cx.fillText(label,x+w/2,y+12);cx.textAlign="left";}
function drawCombatHUD(dt){const ph=P.phases[enemy.pi];
  tacc+=dt;if(tacc>=1){tacc-=1;if(timeLeft>0)timeLeft--;
    if((timeLeft<=5||timeLeft===10)&&timeLeft>0)AU.select(); // tique de aviso
    if(timeLeft<=0&&scene==="phase"&&!phaseResolved&&enemy.state!=="dead"){flashOverlay=Math.max(flashOverlay,0.3);resolveLose();}}
  cx.fillStyle="rgba(6,4,10,.62)";cx.fillRect(0,0,W,84);cx.fillStyle="#000";cx.fillRect(0,84,W,3);
  cx.fillStyle="#1a1414";cx.fillRect(20,10,58,58);cx.strokeStyle=HERO().accent;cx.lineWidth=3;cx.strokeRect(20,10,58,58);
  {const hp=HERO().port();if(hp&&hp.ok)try{cx.drawImage(hp,23,13,52,52);}catch(e){}}
  {const lowHP=player.hp/player.maxhp<0.25;bar(88,14,360,16,player.hp/player.maxhp,(lowHP&&performance.now()%400<200)?"#ff5a3c":"#2ec27e","#7be0a8","l");}
  cx.textAlign="left";cx.textBaseline="alphabetic";cx.fillStyle="#ffcf33";
  cx.font='10px "Press Start 2P",monospace';cx.fillText(HERO().title,88,44);
  cx.fillStyle="#ffe36a";cx.font='12px "Press Start 2P",monospace';cx.fillText("★ "+String(score).padStart(7,"0"),88,66);
  cx.textAlign="center";cx.fillStyle="#000";cx.fillRect(W/2-40,8,80,46);cx.strokeStyle="#ffcf33";cx.lineWidth=2;cx.strokeRect(W/2-40,8,80,46);
  cx.fillStyle="#ffcf33";cx.font='9px "Press Start 2P",monospace';cx.fillText("TEMPO",W/2,21);
  cx.font='22px "Press Start 2P",monospace';cx.fillStyle=(timeLeft<=10)?((performance.now()%500<250)?"#ff3c3c":"#ffd0d0"):"#fff";cx.fillText(String(timeLeft).padStart(2,"0"),W/2,48);
  cx.fillStyle=ph.accent;cx.font='9px "Press Start 2P",monospace';cx.fillText("FASE "+(enemy.pi+1)+"/"+P.phases.length,W/2,68);
  const pct=Math.max(0,Math.min(1,camX/Math.max(1,CUR_WORLD_LEN-W)));
  cx.fillStyle="#000";cx.fillRect(W/2-90,72,180,6);cx.fillStyle=ph.accent;cx.fillRect(W/2-90,72,180*pct,6);
  const alvoH=(hudAlvo&&hudAlvo.mook&&mooks.includes(hudAlvo))?hudAlvo:(bossSpawned?enemy:null);
  cx.save();cx.translate(-HUD_R,0);
  if(alvoH&&alvoH.mook){
    bar(W-30,14,300,14,Math.max(0,alvoH.hp/alvoH.maxhp),"#c0392b","#ff7a5a","r");
    if(alvoH.vet){const pt=IMG.phases[alvoH.pi].port;cx.fillStyle="#1a1414";cx.fillRect(W-384,8,46,46);
      cx.strokeStyle=P.phases[alvoH.pi].accent||"#ffcf33";cx.lineWidth=2;cx.strokeRect(W-384,8,46,46);
      if(pt&&pt.ok)try{cx.drawImage(pt,W-382,10,42,42);}catch(e){}}
    cx.textAlign="right";cx.fillStyle="#d9cba6";cx.font='12px "Press Start 2P",monospace';cx.fillText(alvoH.nome,W-30,44);
  }else if(alvoH){
    cx.fillStyle="#1a1414";cx.fillRect(W-78,10,58,58);cx.strokeStyle=ph.accent;cx.lineWidth=3;cx.strokeRect(W-78,10,58,58);
    if(IMG.phases[enemy.pi].port.ok)try{cx.drawImage(IMG.phases[enemy.pi].port,W-75,13,52,52);}catch(e){}
    bar(W-90,14,360,16,Math.max(0,enemy.hp/enemy.maxhp),"#c0392b","#ff7a5a","r");
    cx.textAlign="right";cx.fillStyle=ph.accent;cx.font='14px "Press Start 2P",monospace';cx.fillText(ph.name,W-90,44);}
  cx.restore();
  cx.textAlign="left";cx.textBaseline="alphabetic";}
// JUNTAS DA CALCADA andando 1:1 com a camera: "prende" carro, bancos e caixas no chao,
// que agora se movem junto com o piso (e com os postes), em vez de deslizar sobre a pintura parada.
// Nao desenha em fundo panoramico (esse ja rola junto).
function drawPisoRolando(){
  const a=CFG.PISO_OPACIDADE;if(!a)return;
  const ph=IMG.phases[enemy.pi];if(ph&&ph.bg&&ph.bg.ok){const nw=ph.bg.naturalWidth||1,nh=ph.bg.naturalHeight||1;if(nw/nh>=2.2)return;}
  const b=curBand(),top=b.top-6,bot=Math.min(H,b.bottom+40),esp=CFG.PISO_ESP||140;
  cx.save();
  const fundo=cx.createLinearGradient(0,top,0,bot);fundo.addColorStop(0,"rgba(0,0,0,0)");fundo.addColorStop(1,"rgba(0,0,0,"+(a*0.9)+")");
  cx.fillStyle=fundo;cx.fillRect(0,top,W,bot-top);
  // linhas no sentido da rua (profundidade)
  cx.strokeStyle="rgba(0,0,0,"+a+")";cx.lineWidth=2;
  for(const f of [0.33,0.66]){const y=top+(bot-top)*f;cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke();}
  // juntas transversais: andam com o chao e abrem em perspectiva (mais largas perto da tela)
  const first=Math.floor(camX/esp)-1;
  for(let i=first;i<first+Math.ceil(W/esp)+3;i++){
    const xm=i*esp-camX,xt=W/2+(xm-W/2)*0.72,xb=W/2+(xm-W/2)*1.18;
    cx.strokeStyle="rgba(0,0,0,"+a+")";cx.beginPath();cx.moveTo(xt,top);cx.lineTo(xb,bot);cx.stroke();
    cx.strokeStyle="rgba(255,255,255,"+(a*0.45)+")";cx.beginPath();cx.moveTo(xt+2,top);cx.lineTo(xb+2,bot);cx.stroke();}
  cx.restore();}
// CARRO ESTACIONADO NO FUNDO: parte do cenario, anda so CARRO_PARALLAX (10%) do movimento do chao,
// como um objeto longe. So aparece nas fases de CARRO_FASES (rua); dentro de museu/estudio nao.
function drawCarroFundo(){
  if(!CFG.UNO_NA_FASE||!IMG.props.uno)return;
  const fases=CFG.CARRO_FASES||[0];if(fases.indexOf(enemy.pi)<0||ehPanorama(enemy.pi))return;
  const st=IMG.props.uno.stages[0];if(!st||!st.img||!st.img.ok)return;
  const b=curBand(),sc=CFG.CARRO_FUNDO_ESCALA||0.32,w=st.w*sc,h=st.h*sc;
  const x=W*0.62-camX*(CFG.CARRO_PARALLAX||0.1),y=b.top+4;
  if(x+w<0||x>W)return;
  cx.save();cx.globalAlpha=0.96;
  cx.fillStyle="rgba(0,0,0,.28)";cx.beginPath();cx.ellipse(x+w/2,y-2,w*0.46,h*0.07,0,0,6.283);cx.fill();
  try{cx.drawImage(st.img,x,y-h,w,h);}catch(e){}
  cx.restore();}
// =====================================================================
// POSTES NAS EMENDAS DOS CENARIOS (foto recortada, assets/props/poste.webp)
// Um poste em cada emenda entre os quadros do cenario longo: esconde a costura e
// fica preso no cenario (anda 1:1). Luz da lampada evidenciada: halo, cone ate o
// chao e poca de luz/reflexo no piso - quem passa embaixo fica iluminado.
// Sorteio por fase: as vezes 1 poste com defeito (pisca e solta faisca), as vezes nenhum.
// =====================================================================
const POSTE_EIXO=0.30,POSTE_LAMP_X=0.887,POSTE_LAMP_Y=0.049; // eixo do poste e lampada na imagem
let postes=[],faiscas=[],_posteT=performance.now();
function montaPostes(){
  const ph=P.phases[phaseIndex]||{},em=ph.emendas||[];
  postes=em.map(x=>({x,defeito:false,aceso:true,t:0}));faiscas=[];
  if(postes.length&&Math.random()<CFG.POSTE_DEFEITO_CHANCE)postes[(Math.random()*postes.length)|0].defeito=true;}
function geometriaPoste(p){
  const im=IMG.props.poste,b=curBand(),base=b.top+2;
  // lampada sempre abaixo do placar (HUD ocupa o topo da tela)
  const Hp=Math.min(CFG.POSTE_ALTURA,(base-125)/(1-POSTE_LAMP_Y)),Wp=Hp*(im.w/im.h);
  const x0=screenX(p.x)-POSTE_EIXO*Wp,top=base-Hp;
  return {im,Wp,Hp,x0,top,base,lx:x0+POSTE_LAMP_X*Wp,ly:top+POSTE_LAMP_Y*Hp,chao:(b.top+b.bottom)/2};}
function atualizaDefeito(p,dt){
  if(!p.defeito)return;
  p.t-=dt;if(p.t>0)return;
  if(p.aceso){p.aceso=false;p.t=0.04+Math.random()*0.22;}
  else{p.aceso=true;p.t=0.08+Math.random()*(Math.random()<0.3?1.6:0.35);
    if(Math.random()<0.35){const g=geometriaPoste(p);             // faisca ao religar
      for(let i=0;i<14;i++)faiscas.push({x:g.lx+(Math.random()-.5)*10,y:g.ly+8,vx:(Math.random()-.5)*160,vy:-40-Math.random()*120,t:0.9+Math.random()*0.6,chao:g.chao,q:0});}}}
function drawPostesEmenda(antes){
  const im=IMG.props.poste;if(!postes.length||!im||!im.img||!im.img.ok)return;
  const now=performance.now(),dt=Math.min(0.05,(now-_posteT)/1000);if(antes)_posteT=now;
  const forca=CFG.POSTE_LUZ;
  for(const p of postes){
    const g=geometriaPoste(p);if(g.x0>W+300||g.x0+g.Wp<-300)continue;
    if(antes){
      atualizaDefeito(p,dt);
      try{cx.drawImage(im.img,g.x0,g.top,g.Wp,g.Hp);}catch(e){}
      if(!p.aceso){cx.save();cx.fillStyle="rgba(20,18,16,.72)";cx.beginPath();cx.ellipse(g.lx,g.ly,g.Wp*0.12,g.Hp*0.018,0,0,6.283);cx.fill();cx.restore();continue;}
      cx.save();cx.globalCompositeOperation="lighter";
      const h=cx.createRadialGradient(g.lx,g.ly,2,g.lx,g.ly,110);           // halo forte da lampada
      h.addColorStop(0,"rgba(255,236,180,"+(0.95*forca)+")");h.addColorStop(0.25,"rgba(255,196,110,"+(0.45*forca)+")");h.addColorStop(1,"rgba(255,170,80,0)");
      cx.fillStyle=h;cx.fillRect(g.lx-110,g.ly-110,220,220);cx.restore();
    }else{
      if(!p.aceso)continue;
      cx.save();cx.globalCompositeOperation="lighter";
      // cone de luz ate o chao
      const topo=g.ly+6,chao=g.chao,lar=CFG.POSTE_CONE;
      const cg=cx.createLinearGradient(0,topo,0,chao);cg.addColorStop(0,"rgba(255,205,120,"+(0.42*forca)+")");cg.addColorStop(1,"rgba(255,190,100,"+(0.06*forca)+")");
      cx.fillStyle=cg;cx.beginPath();cx.moveTo(g.lx-10,topo);cx.lineTo(g.lx+10,topo);cx.lineTo(g.lx+lar/2,chao);cx.lineTo(g.lx-lar/2,chao);cx.closePath();cx.fill();
      // poca de luz no chao + reflexo no piso molhado
      const pg=cx.createRadialGradient(g.lx,chao,4,g.lx,chao,lar*0.62);pg.addColorStop(0,"rgba(255,210,130,"+(0.48*forca)+")");pg.addColorStop(1,"rgba(255,190,100,0)");
      cx.fillStyle=pg;cx.save();cx.translate(g.lx,chao);cx.scale(1,0.28);cx.translate(-g.lx,-chao);cx.beginPath();cx.arc(g.lx,chao,lar*0.62,0,6.283);cx.fill();cx.restore();
      const rg=cx.createLinearGradient(0,chao,0,chao+130);rg.addColorStop(0,"rgba(255,215,140,"+(0.22*forca)+")");rg.addColorStop(1,"rgba(255,215,140,0)");
      cx.fillStyle=rg;cx.fillRect(g.lx-14,chao,28,130);
      cx.restore();}
  }
  if(!antes&&faiscas.length){  // faiscas caem, quicam no chao e apagam
    cx.save();cx.globalCompositeOperation="lighter";
    for(const f of faiscas){f.t-=dt;f.vy+=520*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;
      if(f.y>f.chao&&f.q<1){f.y=f.chao;f.vy*=-0.35;f.vx*=0.6;f.q++;}
      const a=Math.max(0,Math.min(1,f.t));cx.fillStyle="rgba(255,"+(200+((f.t*80)|0)%55)+",120,"+a+")";cx.fillRect(f.x-2,f.y-2,4,4);}
    faiscas=faiscas.filter(f=>f.t>0);cx.restore();}
}
function drawPhaseBg(){const ph=IMG.phases[enemy.pi];
  if(ph.bg.ok){try{
    // PARALLAX AUTOMATICO DE FUNDO (vale pra TODAS as fases, sem precisar de arte nova):
    // calcula o MENOR zoom necessario pra cobrir o quanto a camera desta fase pode andar
    // (CUR_WORLD_LEN-W). Fases curtas (worldLen pequeno) tendem a zoom 1:1, sem perda de
    // nitidez nenhuma; so fases longas com pouca resolucao de fundo usam zoom de verdade.
    const natW=ph.bg.naturalWidth||ph.bg.width||W, natH=ph.bg.naturalHeight||ph.bg.height||H;
    const maxCam=Math.max(1,CUR_WORLD_LEN-W);
    // FUNDO PANORAMICO (imagem bem mais larga que alta, ex. 5000x720): rola JUNTO com o chao,
    // igual Final Fight - postes, carro e bancos ficam presos no cenario. Emenda em loop se acabar.
    if(natW/natH>=2.2){const esc=H/natH,largura=natW*esc,off=((camX*(CFG.BG_PANORAMA_VEL||1))%largura+largura)%largura;
      for(let x=-off;x<W;x+=largura)cx.drawImage(ph.bg,0,0,natW,natH,x,0,largura,H);
      return;}
    const sw=natW/Math.max(1,CFG.BG_ZOOM||1.3); // fundo de 1 tela: zoom fixo e desliza devagar (parallax)
    // CROP SO NA HORIZONTAL: recortar tambem a vertical desalinhava o chao/calcada
    // com o bandTop/bandBottom calibrado de cada fase (personagem flutuando).
    const camPct=Math.max(0,Math.min(1,camX/maxCam));
    const sx=(natW-sw)*camPct;
    cx.drawImage(ph.bg,sx,0,sw,natH,0,0,W,H);
  }catch(e){cx.fillStyle="#243018";cx.fillRect(0,0,W,H);}}
  else{cx.fillStyle="#243018";cx.fillRect(0,0,W,H);}
}
function drawPhase(dt){drawPhaseBg();
  cx.save();if(shake>0)cx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
  drawAlinhamento();
  drawCarroFundo();
  drawPostesEmenda(true);   // poste + brilho da lampada (atras dos personagens)
  drawPisoRolando();
  // PROFUNDIDADE 2.5D: props, MC, chefe, invasor e capangas ordenados pelo Y da calcada
  const L=[];
  for(const pr of track)L.push([pr.y,"pr",pr]);
  L.push([player.y+0.5,"p"]);
  if(enemy.state!=="espera")L.push([enemy.y+0.5,"e"]);
  if(invader)L.push([invader.y+0.5,"i"]);
  for(const m of mooks)L.push([m.y+0.5,"m",m]);
  L.sort((a,b)=>a[0]-b[0]);
  for(const[,who,o]of L){
    if(who==="pr")drawProp(o);
    else if(who==="p")drawPlayerActor();
    else if(who==="e")drawActor(enemy,enFrame(enemy),enemy.z||0,enemy.state==="dead");
    else if(who==="m")drawActor(o,enFrame(o),o.z||0,o.state==="dead");
    else drawActor(invader,enFrame(invader),invader.z||0,invader.state==="dead");}
  drawSmoke();
  drawPostesEmenda(false);  // cone de luz por cima: quem passa embaixo fica iluminado
  drawVinis();drawFires();drawFireTelegraph();drawBrechas();
  drawRings();drawShots();drawSparks();drawBursts();drawPostes();cx.restore();
  drawDmgNums();drawFlashOverlay();
  cx.save();hudTopo();drawCombatHUD(dt);drawInvaderHUD();drawBannerInvasao(dt);drawGo();drawComboHUD(118);drawTutorial();cx.restore();}
// POSTES em primeiro plano (parallax mais rapido que o chao) = sensacao de movimento
function ehPanorama(pi){const ph=P.phases[pi];return !!(ph&&ph.panorama);}
function drawPostes(){
  if(ehPanorama(enemy.pi))return; // cenario longo ja rola junto: sem disfarce
  const esp=CFG.POSTE_ESP||760,par=1.35,off=camX*par,first=Math.floor(off/esp)-1;
  for(let i=first;i<first+4;i++){const sx=i*esp-off+esp*0.5;if(sx<-80||sx>W+80)continue;
    cx.save();
    const g=cx.createRadialGradient(sx+46,118,4,sx+46,118,70);g.addColorStop(0,"rgba(255,220,120,.35)");g.addColorStop(1,"rgba(255,220,120,0)");
    cx.fillStyle=g;cx.fillRect(sx-30,50,160,140);
    cx.fillStyle="rgba(14,12,18,.78)";cx.fillRect(sx-8,96,16,H-96);cx.fillRect(sx-15,H-48,30,48);
    cx.fillRect(sx,98,48,6);cx.fillRect(sx+36,104,20,14);
    cx.fillStyle="rgba(255,226,140,.9)";cx.fillRect(sx+38,116,16,4);
    cx.restore();}}
// "VAI! ►" piscando quando a onda acaba e o cenario libera
function drawGo(){
  if(goT<=0||(performance.now()%500)>330)return;
  cx.save();cx.textAlign="right";cx.font='34px "Press Start 2P",monospace';cx.lineWidth=7;cx.strokeStyle="#000";
  cx.strokeText("VAI! ►",W-40,H*0.42);cx.fillStyle="#ffcf33";cx.fillText("VAI! ►",W-40,H*0.42);cx.restore();}
// =====================================================================
// FASE BONUS DO UNO (entre cenarios de POA)
// Fluxo trava, Uno no centro (escala 0.60, espaco 640 ao redor), 30s de movimento livre.
// 👊 e 🦵 amassam o carro; agarrao nao se aplica (o Uno e objeto, nao vilao).
// =====================================================================
let bonus=null;
function startUnoBonus(ph,faseVencida){
  const b=curBand(),im=IMG.props.uno.stages[0],sc=CFG.UNO.scale;
  const carW=im.w*sc,carH=im.h*sc,carX=camX+W/2;
  const car={type:"uno",wx:carX,w:carW,h:carH,topH:PROP_CFG.unoTopH,solidTop:true,grind:true,sc,isObject:true,
    y:Math.round((b.top+b.bottom)/2-(b.bottom-b.top)*0.18),dmg:0,smokeT:0,hp:CFG.UNO.hp,maxhp:CFG.UNO.hp};
  track=[car];trackQueue=[];fires=[];vinis=[];shots=[];invader=null;bannerT=0;smokes=[];comboReset();mooks=[];waveAtiva=false;spawnFila=[];goT=0;
  const half=carW/2+CFG.UNO.space/2;
  bonus={car,ph,faseVencida,timeLeft:CFG.UNO.time,pts:0,endT:0,
    minX:Math.max(camX+70,carX-half),maxX:Math.min(camX+W-70,carX+half)};
  const p=player;
  Object.assign(p,{wx:bonus.minX+10,z:0,vz:0,mvx:0,mvy:0,kbx:0,atkT:0,kickT:0,throwT:0,throwTgt:null,hurtT:0,
    presoT:0,paralyzedT:0,airAtk:false,skating:false,escaping:false,grinding:false,jumpsUsed:0,comboStep:0,
    state:"idle",facing:1,__onProp:null,__climbing:null});
  scene="bonus";fadeT=0.35;avisoHUD("BÔNUS: DETONA O UNO!");AU.power();
}
function updateBonus(dt){
  if(bonus.endT>0){bonus.endT-=dt;player.anim+=dt;if(bonus.endT<=0)endUnoBonus();return;}
  bonus.timeLeft-=dt;
  updatePlayer(dt);updateSmoke(dt);
  if(bonus.car.exploded||bonus.timeLeft<=0){
    if(bonus.car.exploded){bonus.pts+=Math.ceil(Math.max(0,bonus.timeLeft))*100;avisoHUD("UNO DETONADO!");}
    else avisoHUD("TEMPO!");
    bonus.timeLeft=Math.max(0,bonus.timeLeft);bonus.endT=1.8;}
}
function endUnoBonus(){const b=bonus;
  score+=b.pts;lastBonusPts=b.pts;bonus=null;track=[];saveNow();
  scene="result";fadeT=0.35;AU.stopLoop();AU.ko();entraResultado();
}
function drawBonus(dt){drawPhaseBg();
  cx.save();if(shake>0)cx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
  const p=player,atras=p.y<bonus.car.y&&!p.__onProp;
  if(atras){drawPlayerActor();drawProps();}else{drawProps();drawPlayerActor();}
  drawRings();drawSparks();drawBursts();cx.restore();
  drawDmgNums();drawFlashOverlay();
  cx.save();hudTopo();
  cx.fillStyle="rgba(6,4,10,.62)";cx.fillRect(0,0,W,84);cx.fillStyle="#000";cx.fillRect(0,84,W,3);
  cx.textAlign="left";cx.fillStyle="#ffcf33";cx.font='14px "Press Start 2P",monospace';cx.fillText("BÔNUS DO UNO",24,34);
  cx.fillStyle="#ffe36a";cx.font='12px "Press Start 2P",monospace';cx.fillText("★ "+String(score+bonus.pts).padStart(7,"0"),24,62);
  cx.textAlign="center";cx.fillStyle="#000";cx.fillRect(W/2-40,8,80,46);cx.strokeStyle="#ffcf33";cx.lineWidth=2;cx.strokeRect(W/2-40,8,80,46);
  const tl=Math.ceil(bonus.timeLeft);
  cx.font='22px "Press Start 2P",monospace';cx.fillStyle=(tl<=5)?((performance.now()%500<250)?"#ff3c3c":"#ffd0d0"):"#fff";
  cx.fillText(String(tl).padStart(2,"0"),W/2,44);
  cx.save();cx.translate(-HUD_R,0);
  bar(W-40,24,360,16,Math.max(0,bonus.car.hp/bonus.car.maxhp),"#ff8c00","#ffcf33","r");
  cx.textAlign="right";cx.fillStyle="#ffd27a";cx.font='10px "Press Start 2P",monospace';cx.fillText("UNO",W-40,62);
  cx.restore();
  cx.textAlign="left";drawComboHUD(110);drawTutorial();cx.restore();}
// barra de energia do chefe invasor, logo abaixo da do vilao da fase
function drawInvaderHUD(){
  if(!invader||invader.state==="saindo")return;
  const ph=P.phases[invader.pi];
  cx.save();cx.translate(-HUD_R,0);
  cx.fillStyle="rgba(6,4,10,.72)";cx.fillRect(W-372,90,352,36);
  cx.strokeStyle=ph.accent;cx.lineWidth=2;cx.strokeRect(W-372,90,352,36);
  cx.textAlign="left";cx.fillStyle="#ff6a6a";cx.font='8px "Press Start 2P",monospace';
  cx.fillText("INVASAO",W-362,103);
  cx.textAlign="right";cx.fillStyle=ph.accent;cx.font='10px "Press Start 2P",monospace';
  cx.fillText(ph.name,W-30,103);
  bar(W-30,109,300,10,Math.max(0,invader.hp/invader.maxhp),"#c0392b","#ff7a5a","r");
  cx.restore();cx.textAlign="left";}
// ---------- INTRO: logo / elenco / mapa ----------
const CAST = [
  {name:"CABEÇA DE ABACAXI",role:"PROTAGONISTA",accent:"#ffcf33",
   img:()=>IMG.mc.victory?IMG.mc.victory[0].img:IMG.mc.idle[0].img,
   note:"MC do underground de Porto Alegre"},
  {name:"NICO CABEÇA DE AMENDOIM",role:"AMIGO · JOGAVEL",accent:"#2ec27e",
   img:()=>IMG.nico.victory[0].img,
   note:"Escolha ele no inicio pra jogar"},
  {name:"JAY",role:"VILÃO",accent:P.phases[0].accent,img:()=>IMG.phases[0].idle[0].img,note:P.phases[0].cenario},
  {name:"O SKATER",role:"VILÃO",accent:P.phases[1].accent,img:()=>IMG.phases[1].idle[0].img,note:P.phases[1].cenario},
  {name:"OLD T",role:"VILÃO",accent:P.phases[2].accent,img:()=>IMG.phases[2].idle[0].img,note:P.phases[2].cenario},
];
function drawIntroTitle(){
  const t=performance.now()/1000;
  // fundo base
  if(IMG.museuBg.ok){try{cx.drawImage(IMG.museuBg,0,0,W,H);}catch(e){cx.fillStyle="#06040e";cx.fillRect(0,0,W,H);}}
  else{cx.fillStyle="#06040e";cx.fillRect(0,0,W,H);}
  // overlay escuro gradiente
  const gd=cx.createLinearGradient(0,0,0,H);
  gd.addColorStop(0,"rgba(4,2,14,.92)");gd.addColorStop(0.55,"rgba(8,4,18,.72)");gd.addColorStop(1,"rgba(2,1,8,.95)");
  cx.fillStyle=gd;cx.fillRect(0,0,W,H);
  // linhas de scan animadas
  cx.save();cx.globalAlpha=0.06;cx.fillStyle="#ff6aff";
  for(let y=0;y<H;y+=4){cx.fillRect(0,y,W,2);}
  cx.restore();
  // glow lateral esquerdo (roxo) e direito (dourado)
  cx.save();
  const gl=cx.createRadialGradient(0,H/2,0,0,H/2,W*0.45);
  gl.addColorStop(0,"rgba(140,0,255,.18)");gl.addColorStop(1,"rgba(0,0,0,0)");
  cx.fillStyle=gl;cx.fillRect(0,0,W,H);
  const gr=cx.createRadialGradient(W,H/2,0,W,H/2,W*0.45);
  gr.addColorStop(0,"rgba(255,180,0,.14)");gr.addColorStop(1,"rgba(0,0,0,0)");
  cx.fillStyle=gr;cx.fillRect(0,0,W,H);cx.restore();
  // heroi centralizado com glow
  const heroImg=CAST[0].img();
  if(heroImg&&heroImg.ok){try{
    const hh=Math.round(H*0.72),hw=heroImg.width*(hh/heroImg.height);
    const hx=W/2-hw/2, hy=H-hh+20;
    cx.save();cx.shadowColor="#ffcf33";cx.shadowBlur=38+14*Math.sin(t*2.2);
    cx.globalAlpha=0.96;cx.drawImage(heroImg,hx,hy,hw,hh);cx.restore();
  }catch(e){}}
  // linha horizontal neon
  cx.save();cx.strokeStyle="#ffcf33";cx.lineWidth=1.5;cx.globalAlpha=0.5;
  cx.beginPath();cx.moveTo(60,H*0.18);cx.lineTo(W-60,H*0.18);cx.stroke();
  cx.beginPath();cx.moveTo(60,H*0.82);cx.lineTo(W-60,H*0.82);cx.stroke();cx.restore();
  // subtítulo
  cx.textAlign="center";
  cx.save();cx.shadowColor="#c87bff";cx.shadowBlur=18;
  cx.fillStyle="#c87bff";cx.font='11px "Press Start 2P",monospace';
  cx.fillText("M C · S U P R E M O",W/2,H*0.14);cx.restore();
  // título principal
  cx.save();cx.shadowColor="#ffcf33";cx.shadowBlur=24+10*Math.sin(t*1.8);
  cx.fillStyle="#ffcf33";cx.font='Math.min(52,W/14)|0'+'px "Press Start 2P",monospace';
  // adaptativo ao canvas
  const fs=Math.min(52,Math.floor(W/14));
  cx.font=fs+'px "Press Start 2P",monospace';
  cx.fillText("CABEÇA DE ABACAXI",W/2,H*0.14+fs+14);cx.restore();
  cx.fillStyle="#c9a84c";cx.font='13px "Press Start 2P",monospace';
  cx.fillText("TURNÊ UNDERGROUND · PORTO ALEGRE · RS",W/2,H*0.14+fs+42);
  // tags urbanas
  const tags=["HIP HOP","SKATE","UNDERGROUND","PORTO ALEGRE"];
  tags.forEach((tag,i)=>{
    const tx=W*0.12+i*(W*0.2),ty=H*0.86;
    cx.save();cx.globalAlpha=0.45+0.2*Math.sin(t*1.5+i);
    cx.fillStyle="#1a1228";cx.fillRect(tx-4,ty-14,tag.length*7+16,18);
    cx.strokeStyle="#c87bff";cx.lineWidth=1;cx.strokeRect(tx-4,ty-14,tag.length*7+16,18);
    cx.fillStyle="#c87bff";cx.font='7px "Press Start 2P",monospace';cx.textAlign="left";
    cx.fillText(tag,tx+4,ty-1);cx.restore();
  });
  // blink COMEÇAR
  const blink=(performance.now()%900)<540;
  cx.textAlign="center";
  // (o botao JOGAR ja faz esse papel; o texto piscando ficava escondido atras dele)
  cx.textAlign="left";
}
function drawIntroCast(){
  const t=performance.now()/1000;
  if(IMG.museuBg.ok){try{cx.drawImage(IMG.museuBg,0,0,W,H);}catch(e){cx.fillStyle="#07050f";cx.fillRect(0,0,W,H);}}
  else{cx.fillStyle="#07050f";cx.fillRect(0,0,W,H);}
  const g2=cx.createLinearGradient(0,0,0,H);
  g2.addColorStop(0,"rgba(4,2,14,.9)");g2.addColorStop(1,"rgba(6,3,16,.85)");
  cx.fillStyle=g2;cx.fillRect(0,0,W,H);
  // título
  cx.textAlign="center";
  cx.save();cx.shadowColor="#ffcf33";cx.shadowBlur=20;
  cx.fillStyle="#ffcf33";cx.font='22px "Press Start 2P",monospace';
  cx.fillText("ELENCO",W/2,52);cx.restore();
  cx.fillStyle="#7a6e4a";cx.font='10px "Press Start 2P",monospace';
  cx.fillText("CONHEÇA OS PERSONAGENS",W/2,74);
  const n=CAST.length, colW=Math.floor((W-80)/n), y0=94, cardH=H-170;
  CAST.forEach((c,i)=>{
    const cx0=80/2+colW*i+colW/2;
    const isHero=i<2;
    // card bg
    cx.save();
    cx.fillStyle=isHero?"rgba(10,6,22,.82)":"rgba(18,6,6,.78)";
    cx.fillRect(40+colW*i,y0,colW-8,cardH);
    // borda com glow
    cx.shadowColor=c.accent;cx.shadowBlur=isHero?14:6;
    cx.strokeStyle=c.accent;cx.lineWidth=isHero?2.5:1.5;
    cx.strokeRect(40+colW*i,y0,colW-8,cardH);cx.restore();
    // sprite
    const im=c.img();
    if(im&&im.ok){try{
      const maxH=Math.floor(cardH*0.65),maxW=colW-28,r=Math.min(maxH/im.height,maxW/im.width);
      const dw=im.width*r,dh=im.height*r;
      cx.save();if(!isHero)cx.globalAlpha=0.88;
      cx.shadowColor=c.accent;cx.shadowBlur=isHero?20:8;
      cx.drawImage(im,cx0-dw/2,y0+8+(maxH-dh)/2,dw,dh);cx.restore();
    }catch(e){}}
    // role tag
    const ty=y0+cardH-78;
    cx.save();cx.fillStyle=c.accent+"33";cx.fillRect(40+colW*i,ty-2,colW-8,20);
    cx.fillStyle=c.accent;cx.font='8px "Press Start 2P",monospace';cx.textAlign="center";
    cx.fillText(c.role,cx0,ty+12);cx.restore();
    // nome
    const nameFs=c.name.length>14?'8px':c.name.length>10?'10px':'12px';
    cx.fillStyle="#fff";cx.font=nameFs+' "Press Start 2P",monospace';cx.textAlign="center";
    cx.fillText(c.name,cx0,ty+30);
    // cenario
    cx.fillStyle="#8a7a5a";cx.font='11px "VT323",monospace';cx.textAlign="center";
    cx.fillText(c.note||'',cx0,ty+46);
    // linha de destaque heroi
    if(isHero){cx.save();cx.strokeStyle=c.accent;cx.globalAlpha=0.4;cx.lineWidth=1;
      cx.beginPath();cx.moveTo(40+colW*i+8,ty-6);cx.lineTo(40+colW*i+colW-16,ty-6);cx.stroke();cx.restore();}
  });
  const blink=(performance.now()%900)<550;
  if(blink){cx.save();cx.shadowColor="#fff";cx.shadowBlur=8;cx.fillStyle="#fff";
    cx.font='12px "Press Start 2P",monospace';cx.textAlign="center";
    cx.fillText("► IR PRO MUSEU",W/2,H-16);cx.restore();}
  cx.textAlign="left";
}
// ---------- ESCOLHA DE PERSONAGEM ----------
function heroPreviewFrame(h,t){const S=h.set();
  if(!S)return null;
  const arr=S.idle&&S.idle.length?S.idle:(S.victory||[]);
  if(!arr.length)return null;
  return arr[Math.floor(t*4)%arr.length];}
function drawSelect(){
  const t=performance.now()/1000;
  if(IMG.museuBg.ok){try{cx.drawImage(IMG.museuBg,0,0,W,H);}catch(e){cx.fillStyle="#07050f";cx.fillRect(0,0,W,H);}}
  else{cx.fillStyle="#07050f";cx.fillRect(0,0,W,H);}
  // overlay
  const gds=cx.createLinearGradient(0,0,0,H);
  gds.addColorStop(0,"rgba(4,2,14,.94)");gds.addColorStop(0.6,"rgba(8,4,20,.78)");gds.addColorStop(1,"rgba(2,1,10,.96)");
  cx.fillStyle=gds;cx.fillRect(0,0,W,H);
  // scan lines
  cx.save();cx.globalAlpha=0.04;cx.fillStyle="#aa88ff";
  for(let y=0;y<H;y+=3)cx.fillRect(0,y,W,1);cx.restore();
  cx.textAlign="center";
  cx.save();cx.shadowColor="#c87bff";cx.shadowBlur=10;
  cx.fillStyle="#c87bff";cx.font='10px "Press Start 2P",monospace';
  cx.fillText("QUEM VAI SUBIR NO PALCO?",W/2,46);cx.restore();
  cx.save();cx.shadowColor="#ffcf33";cx.shadowBlur=18+8*Math.sin(t*2);
  cx.fillStyle="#ffcf33";cx.font='26px "Press Start 2P",monospace';
  cx.fillText("ESCOLHA SEU MC",W/2,80);cx.restore();
  // linha separadora
  cx.save();cx.strokeStyle="#ffcf33";cx.lineWidth=1;cx.globalAlpha=0.3;
  cx.beginPath();cx.moveTo(80,96);cx.lineTo(W-80,96);cx.stroke();cx.restore();
  const cw=Math.floor(W*0.42),ch=Math.floor(H*0.74),gap=Math.floor(W*0.04);
  const x0=W/2-cw-gap/2,y0=108;
  HERO_KEYS.forEach((k,i)=>{
    const h=HEROES[k],sel=i===selIdx,x=x0+i*(cw+gap);
    cx.save();
    cx.fillStyle=sel?"rgba(20,16,12,.88)":"rgba(8,6,12,.6)";cx.fillRect(x,y0,cw,ch);
    cx.strokeStyle=sel?h.accent:"rgba(120,110,90,.5)";cx.lineWidth=sel?5:2;
    cx.strokeRect(x,y0,cw,ch);
    if(sel){cx.globalAlpha=0.16+0.10*Math.sin(t*4);cx.fillStyle=h.accent;
      cx.fillRect(x,y0,cw,ch);cx.globalAlpha=1;}
    cx.restore();
    // sprite
    const fr=heroPreviewFrame(h,sel?t:0);
    if(fr&&fr.img.ok){try{
      const th=sel?276:250,r=th/fr.h,dw=fr.w*r;
      const bob=sel?Math.sin(t*3)*4:0;
      cx.save();if(!sel)cx.globalAlpha=0.62;
      cx.drawImage(fr.img,x+cw/2-dw/2,y0+40+bob,dw,th);cx.restore();
    }catch(e){}}
    // nome e papel
    cx.textAlign="center";
    cx.fillStyle=h.accent;cx.font='10px "Press Start 2P",monospace';
    cx.fillText(h.role,x+cw/2,y0+348);
    cx.fillStyle=sel?"#fff":"#9a917c";cx.font='17px "Press Start 2P",monospace';
    cx.fillText(h.title,x+cw/2,y0+378);
    cx.fillStyle="#a99e82";cx.font='19px "VT323",monospace';
    cx.fillText(h.tag,x+cw/2,y0+400);
    // barrinhas de atributo
    cx.textAlign="left";
    h.stats.forEach((st,n)=>{
      const sy=y0+424+n*16,sx=x+92;
      cx.fillStyle=sel?"#c9b98f":"#6d6357";cx.font='8px "Press Start 2P",monospace';
      cx.fillText(st[0],x+18,sy+8);
      for(let b=0;b<5;b++){
        cx.fillStyle=b<st[1]?(sel?h.accent:"#5a5040"):"rgba(255,255,255,.10)";
        cx.fillRect(sx+b*36,sy,30,9);}
    });
    cx.textAlign="center";
    if(sel){cx.fillStyle=h.accent;cx.font='11px "Press Start 2P",monospace';
      cx.fillText("▼ SELECIONADO ▼",x+cw/2,y0-10);}
  });
  cx.fillStyle="#b7a986";cx.font='19px "VT323",monospace';
  cx.fillText(HEROES[HERO_KEYS[selIdx]].note,W/2,y0+ch+34);
  const blink=(performance.now()%1000)<600;
  if(blink){cx.fillStyle="#fff";cx.font='14px "Press Start 2P",monospace';
    cx.fillText("🕹️ ESCOLHER    ·    ► CONFIRMAR",W/2,H-22);}
  cx.textAlign="left";
}
const INTRO_PAGES=[drawIntroTitle,drawIntroCast]; // slide do mapa removido: uma tela a menos
function drawIntro(){INTRO_PAGES[introPage]();}
function panel(x,y,w,h){cx.fillStyle="rgba(8,6,12,.72)";cx.fillRect(x,y,w,h);
  cx.strokeStyle="rgba(255,207,51,.5)";cx.lineWidth=2;cx.strokeRect(x,y,w,h);}
function drawHub(){
  if(IMG.museuBg.ok){try{cx.drawImage(IMG.museuBg,0,0,W,H);}catch(e){cx.fillStyle="#141018";cx.fillRect(0,0,W,H);}}
  else{cx.fillStyle="#141018";cx.fillRect(0,0,W,H);}
  cx.fillStyle="rgba(5,4,9,.45)";cx.fillRect(0,0,W,H);
  cx.textAlign="center";cx.fillStyle="#38e1c8";cx.font='30px "Press Start 2P",monospace';cx.fillText("MUSEU DO HIP HOP",W/2,80);
  cx.fillStyle="#c9b98f";cx.font='16px "Press Start 2P",monospace';cx.fillText("SANTUARIO · PONTO DE RENOVACAO",W/2,112);
  const done=phaseIndex>=P.phases.length;
  panel(40,170,380,330);cx.textAlign="left";
  cx.fillStyle="#ffcf33";cx.font='16px "Press Start 2P",monospace';cx.fillText("CONTROLES",64,205);
  [["🕹️","ANDA NA CALÇADA"],["👊","COMBO · COLADO=AGARRA"],["🦵","SHUV-IT: AFASTA"],["⤴️","NO AR 👊/🦵 x3=COMBO"],["⤴️⤴️","FUGA · 🕹️ MUDA DIREÇÃO"],["⤴️🦵","SEGURA 🦵 = SLIDE"]].forEach((c,n)=>{
    const yy=250+n*44;cx.fillStyle="#fff";cx.font='28px sans-serif';cx.fillText(c[0],60,yy);
    cx.fillStyle="#e7d8ad";cx.font='10px "Press Start 2P",monospace';cx.fillText(c[1],150,yy-9);});
  panel(760,170,480,360);
  if(!done){const ph=P.phases[phaseIndex],pimg=IMG.phases[phaseIndex];
    cx.fillStyle="#c9b98f";cx.font='14px "Press Start 2P",monospace';cx.fillText("PROXIMA FASE",790,205);
    cx.fillStyle=ph.accent;cx.font='22px "Press Start 2P",monospace';cx.fillText("FASE "+(phaseIndex+1)+"/"+P.phases.length,790,250);
    cx.fillStyle="#fff";cx.font='20px "Press Start 2P",monospace';cx.fillText(ph.name,790,300);
    cx.fillStyle="#b7a986";cx.font='19px "VT323",monospace';cx.fillText(ph.cenario,790,330);
    cx.fillStyle="#0e0c14";cx.fillRect(1050,360,150,150);cx.strokeStyle=ph.accent;cx.lineWidth=3;cx.strokeRect(1050,360,150,150);
    if(pimg.port.ok)try{const im=pimg.port,r=Math.min(140/im.width,140/im.height);
      cx.drawImage(im,1050+75-im.width*r/2,510-im.height*r,im.width*r,im.height*r);}catch(e){}
  }else{cx.fillStyle="#ffcf33";cx.font='26px "Press Start 2P",monospace';cx.textAlign="center";cx.fillText("TURNE COMPLETA",1000,300);
    cx.fillStyle="#2ec27e";cx.font='14px "Press Start 2P",monospace';cx.fillText("CABECA DE ABACAXI E O MC SUPREMO",1000,340);cx.textAlign="left";}
  const blink=(performance.now()%1000)<600;cx.textAlign="center";
  if(!done){if(blink){cx.fillStyle="#fff";cx.font='18px "Press Start 2P",monospace';cx.fillText("► ENTRAR NA FASE",W/2,600);}}
  else{if(blink){cx.fillStyle="#c9b98f";cx.font='14px "Press Start 2P",monospace';cx.fillText("► RECOMEÇAR A TURNÊ",W/2,600);}}
  // RECORDES: melhor nota de cada fase da turne
  // (abaixo do painel da direita, longe do botao ENTRAR)
  {const n=P.phases.length,gap=44,x0=1238-(n-1)*gap-17;
   cx.textAlign="left";cx.font='10px "Press Start 2P",monospace';cx.fillStyle="#8d8471";cx.fillText("RECORDES",762,562);
   cx.textAlign="center";
   for(let i=0;i<n;i++){const r=recordes[i],x=x0+i*gap;
     cx.strokeStyle=r?NOTA_COR[r.n]:"#3a3440";cx.lineWidth=2;cx.strokeRect(x-17,542,34,30);
     cx.fillStyle=r?NOTA_COR[r.n]:"#4a4238";cx.font='14px "Press Start 2P",monospace';cx.fillText(r?r.n:"-",x,565);}}
  cx.fillStyle="#6d6357";cx.font='11px "Press Start 2P",monospace';
  cx.fillText("★ "+String(score).padStart(7,"0"),W/2,696);
  cx.fillStyle="#4a4238";cx.font='11px "Press Start 2P",monospace';cx.fillText("NicoSheik Labs",W/2,714);
  cx.textAlign="left";}
// ---------- opcoes da tela de derrota ----------
const OPT_CONTINUAR={label:"CONTINUAR",sub:()=>ckpt&&ckpt.boss?"Volta direto na luta contra o chefe":"Volta no início da onda "+((ckpt?ckpt.onda:0)+1)+"/"+ondas.length+" · vida cheia",
   act:()=>{AU.select();continuaDaOnda();}};
const LOSE_BASE=[
  {label:"RECOMEÇAR A FASE",sub:()=>"Do começo, mesmo MC: "+HERO().title,
   act:()=>{AU.select();startPhase();}},
  {label:"TROCAR DE MC",sub:()=>ckpt?"Continua da onda com o outro personagem":"Refaz a fase com o outro personagem",
   act:()=>{AU.select();selIdx=(HERO_KEYS.indexOf(heroKey)+1)%HERO_KEYS.length;
            selReturn=ckpt?"continua":"phase";scene="select";fadeT=0.35;}},
  {label:"VOLTAR AO MUSEU",sub:()=>"Respirar e trocar de MC",
   act:()=>{AU.select();toHub();}}
];
let LOSE_OPTS=LOSE_BASE;
function drawLoseMenu(){
  const bx=W/2-330,bw=660,y0=356,rh=62;
  LOSE_OPTS.forEach((o,i)=>{
    const y=y0+i*(rh+12),sel=i===loseIdx;
    cx.fillStyle=sel?"rgba(255,207,51,.16)":"rgba(8,6,12,.62)";cx.fillRect(bx,y,bw,rh);
    cx.strokeStyle=sel?"#ffcf33":"rgba(150,140,115,.45)";cx.lineWidth=sel?4:2;
    cx.strokeRect(bx,y,bw,rh);
    cx.textAlign="left";
    cx.fillStyle=sel?"#ffcf33":"#8d8471";cx.font='13px "Press Start 2P",monospace';
    cx.fillText((sel?"► ":"  ")+o.label,bx+22,y+27);
    cx.fillStyle=sel?"#d9cba6":"#6d6357";cx.font='18px "VT323",monospace';
    cx.fillText(o.sub(),bx+44,y+49);
    cx.textAlign="center";
  });
  const blink=(performance.now()%1000)<600;
  if(blink){cx.fillStyle="#fff";cx.font='13px "Press Start 2P",monospace';
    cx.fillText("🕹️ ESCOLHER    ·    ► CONFIRMAR",W/2,H-26);}
}
// ================= FINAIS =================
const ENDINGS={
  nico:{bg1:"#141a12",bg2:"#0a0d09",accent:"#2ec27e",
    title:"FIM DE TURNE, NA BEIRA DA PRAIA",
    linhas:["O sol caindo, o banco de sempre.",
      "Um som punk rock tocando baixinho.","A turne acabou. O resto do dia e deles."],
    creditTitle:"PARABENS!",
    creditLines:["Voce limpou as ruas","e reiniciou o sistema.","","Obrigado por jogar!"]},
  abacaxi:{bg1:"#1a0e18",bg2:"#0b0509",accent:"#ffcf33",
    title:"BAILE NA PRACA DA QUEBRADA",
    linhas:["Paredoes empilhados, luz neon nas pixacoes.",
      "A quebrada dancando breakdance, livre.","O groove voltou pra rua."],
    creditTitle:"O GROOVE FOI RESTAURADO",
    creditLines:["As ruas tem dono novo.","","Parabens por vencer o jogo!"]}
};
// Numero de paginas do epilogo por heroi: o Nico tem uma 2a pagina (Nico & Nessa).
function epiPageCount(){return 1;}
function drawEpilogue(){const E=ENDINGS[heroKey];
  const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,E.bg1);g.addColorStop(1,E.bg2);
  cx.fillStyle=g;cx.fillRect(0,0,W,H);
  const pg2=false;
  if(heroKey==="nico")drawEpilogueNico(E);
  else drawEpilogueAbacaxi(E);
  cx.textAlign="center";cx.fillStyle=E.accent;cx.font='20px "Press Start 2P",monospace';
  cx.save();cx.shadowColor="#000";cx.shadowOffsetY=3;
  cx.fillText(pg2?E.title2:E.title,W/2,52);cx.restore();
  cx.fillStyle="#d9cba6";cx.font='19px "VT323",monospace';
  (pg2?E.linhas2:E.linhas).forEach((l,i)=>cx.fillText(l,W/2,H-96+i*24));
  if(epiPageCount()>1){cx.fillStyle="#6d6357";cx.font='10px "Press Start 2P",monospace';
    cx.fillText((epiPage+1)+" / "+epiPageCount(),W/2,H-124);}
  const blink=(performance.now()%1000)<600;
  if(blink){cx.fillStyle="#fff";cx.font='13px "Press Start 2P",monospace';
    const ultima=epiPage>=epiPageCount()-1;
    cx.fillText(ultima?"► VER CRÉDITOS":"► CONTINUAR",W/2,H-18);}
  cx.textAlign="left";}
// pagina 2 do Nico: ele e a Nessa curtindo punk rock no banco de sempre
function drawEpilogueNico(E){
  const bg=IMG.nicoBeach;
  if(bg&&bg.ok){try{cx.drawImage(bg,0,0,W,H);}catch(e){}}
  cx.save();cx.fillStyle="rgba(10,8,4,.22)";cx.fillRect(0,0,W,H);cx.restore();
  const img=IMG.nicoNessa;
  if(img&&img.ok){try{
    const hh=460, ww=img.naturalWidth*(hh/img.naturalHeight);
    const ix=W/2-ww/2, iy=H-hh-30;
    cx.save();cx.shadowColor="rgba(0,0,0,.55)";cx.shadowBlur=22;cx.shadowOffsetY=12;
    cx.drawImage(img,ix,iy,ww,hh);cx.restore();
  }catch(e){}}
}
function drawEpilogueAbacaxi(E){
  const bg=IMG.abacaxiParty;
  if(bg&&bg.ok){try{cx.drawImage(bg,0,0,W,H);}catch(e){}}
  cx.save();cx.fillStyle="rgba(10,6,14,.22)";cx.fillRect(0,0,W,H);cx.restore();
}
// ================= CREDITOS =================
function drawCredits(dt){
  const E=ENDINGS[heroKey];
  cx.fillStyle="#000";cx.fillRect(0,0,W,H);
  cx.textAlign="center";
  const linhas=[];
  linhas.push({t:E.creditTitle,f:26,c:E.accent,pad:70});
  E.creditLines.forEach(l=>linhas.push({t:l,f:16,c:"#f4e7c9",pad:36}));
  linhas.push({t:"",f:10,pad:40});
  linhas.push({t:"CABECA DE ABACAXI",f:14,c:"#ffcf33",pad:30});
  linhas.push({t:"& NICO CABEÇA DE AMENDOIM",f:14,c:"#2ec27e",pad:50});
  linhas.push({t:"TURNE UNDERGROUND",f:11,c:"#8a7a5a",pad:26});
  linhas.push({t:"PORTO ALEGRE \\u00b7 RS",f:11,c:"#8a7a5a",pad:60});
  linhas.push({t:"UM JOGO DE",f:9,c:"#6d6357",pad:26});
  linhas.push({t:"NICOSHEIK LABS",f:13,c:"#c9b98f",pad:80});
  let y=H-credScroll+40;
  cx.save();
  for(const ln of linhas){
    if(ln.t){cx.fillStyle=ln.c||"#fff";cx.font=ln.f+'px "Press Start 2P",monospace';
      if(y>-40&&y<H+40)cx.fillText(ln.t,W/2,y);}
    y+=ln.pad;}
  cx.restore();
  if(y<H*0.25)credDone=true;
  // cameo do personagem: Nico faz sinal de V com fones gigantes; Abacaxi manda heelflip
  const t=performance.now()/1000;
  if(heroKey==="nico"){
    const S=IMG.nico,fr=S.victory&&S.victory[0];
    if(fr&&fr.img.ok){try{const hh=210,ww=fr.w*(hh/fr.h);
      cx.drawImage(fr.img,24,H-hh-18,ww,hh);}catch(e){}}
    cx.save();cx.strokeStyle="#151515";cx.lineWidth=9;
    cx.beginPath();cx.arc(24+70,H-190,30,0.6,2.6);cx.stroke();
    cx.fillStyle="#151515";cx.beginPath();cx.ellipse(24+40,H-186,9,14,0,0,6.283);cx.fill();
    cx.beginPath();cx.ellipse(24+100,H-186,9,14,0,0,6.283);cx.fill();cx.restore();
  }else{
    const S=IMG.mc,arr=S.skate||S.jump,fr=arr&&arr[Math.floor(t*7)%arr.length];
    if(fr&&fr.img.ok){try{const hh=230,ww=fr.w*(hh/fr.h);
      cx.save();cx.translate(30+ww/2,H-hh-14);cx.rotate(Math.sin(t*5)*0.5);
      cx.drawImage(fr.img,-ww/2,0,ww,hh);cx.restore();}catch(e){}}
  }
  cx.textAlign="left";
}
// carimbo da nota: entra grande e "bate" na tela, depois estatisticas e NOVO RECORDE
function drawNotaResultado(){
  const nf=notaFase,cxR=W*0.74,el=(performance.now()-resultT)/1000;
  cx.save();cx.textAlign="center";
  cx.fillStyle="rgba(10,8,14,.75)";cx.fillRect(cxR-190,120,380,420);
  cx.strokeStyle=NOTA_COR[nf.n];cx.lineWidth=3;cx.strokeRect(cxR-190,120,380,420);
  cx.fillStyle="#bdb3a0";cx.font='14px "Press Start 2P",monospace';cx.fillText("NOTA DA FASE",cxR,158);
  const k=Math.max(0,Math.min(1,(el-0.45)/0.28));
  if(k>0){
    if(k>=1&&!cardCarimbou){cardCarimbou=true;shake=Math.max(shake,10);vib(35);AU.kickHit();}
    const esc=3-2*k*k;cx.save();cx.globalAlpha=k;cx.translate(cxR,300);cx.scale(esc,esc);cx.rotate(-0.08*(1-k));
    cx.font='130px "Press Start 2P",monospace';cx.lineWidth=12;cx.strokeStyle="#000";cx.strokeText(nf.n,0,50);
    cx.fillStyle=NOTA_COR[nf.n];cx.fillText(nf.n,0,50);cx.restore();}
  if(el>0.8){
    cx.fillStyle=NOTA_COR[nf.n];cx.font='16px "Press Start 2P",monospace';cx.fillText(NOTA_GRITO[nf.n],cxR,392);
    cx.font='12px "Press Start 2P",monospace';cx.fillStyle="#e7d8ad";
    const mm=Math.floor(nf.t/60),ss=String(Math.floor(nf.t%60)).padStart(2,"0");
    cx.fillText("COMBO MÁX "+nf.combo+" · TEMPO "+mm+":"+ss,cxR,432);
    cx.fillText("DANO SOFRIDO "+nf.dp+"%",cxR,458);
    if(nf.cont){cx.fillStyle="#bdb3a0";cx.font='10px "Press Start 2P",monospace';cx.fillText("(usou continue: máximo A)",cxR,484);}
    if(nf.recorde&&(performance.now()%700)<470){cx.fillStyle="#ff5a4a";cx.font='16px "Press Start 2P",monospace';cx.fillText("NOVO RECORDE!",cxR,520);}}
  cx.restore();}
// ---------- CARD DE RECORDE (imagem 1080x1350 pra WhatsApp/Instagram) ----------
async function geraCard(semImg){
  const nf=notaFase;if(!nf)return null;
  try{await document.fonts.load('40px "Press Start 2P"');}catch(e){}
  const c=document.createElement('canvas');c.width=1080;c.height=1350;const g=c.getContext('2d');
  const OURO="#ffcf33",CREME="#e7d8ad",CINZA="#bdb3a0",cor=NOTA_COR[nf.n];
  const F=(px)=>px+'px "Press Start 2P",monospace';
  g.fillStyle="#120e16";g.fillRect(0,0,1080,1350);
  // fundo: cenario da fase bem escuro
  if(!semImg)try{const bg=IMG.phases[nf.pi].bg;if(bg&&bg.ok){g.globalAlpha=0.22;g.drawImage(bg,0,0,1080,608);g.globalAlpha=1;}}catch(e){}
  g.strokeStyle=OURO;g.lineWidth=10;g.strokeRect(24,24,1032,1302);
  g.textBaseline="alphabetic";
  g.fillStyle=CINZA;g.font=F(26);g.textAlign="left";g.fillText("MC SUPREMO",70,100);
  g.textAlign="right";g.fillText("TURNÊ POA · RS",1010,100);
  // heroi (pose de vitoria)
  const S=HIMG(),fr=(S.victory&&S.victory[0])||S.idle[0];
  g.fillStyle="#2a2230";g.fillRect(70,150,400,520);g.strokeStyle=OURO;g.lineWidth=6;g.strokeRect(70,150,400,520);
  if(!semImg)try{if(fr&&fr.img){const r=Math.min(360/fr.w,480/fr.h);g.drawImage(fr.img,270-fr.w*r/2,650-fr.h*r,fr.w*r,fr.h*r);}}catch(e){}
  // nota
  g.textAlign="center";g.fillStyle=CINZA;g.font=F(26);g.fillText("NOTA",775,215);
  g.font=F(300);g.lineWidth=18;g.strokeStyle="#000";g.strokeText(nf.n,775,540);g.fillStyle=cor;g.fillText(nf.n,775,540);
  g.fillStyle=cor;g.font=F(34);g.fillText(NOTA_GRITO[nf.n],775,630);
  if(nf.recorde){g.fillStyle="#ff5a4a";g.fillRect(560,670,430,62);g.fillStyle="#fff";g.font=F(26);g.fillText("NOVO RECORDE!",775,713);}
  // quem, quem venceu, onde
  const ph=P.phases[nf.pi];
  g.textAlign="left";g.fillStyle=OURO;g.font=F(34);g.fillText(nf.heroi,70,780);
  g.fillStyle=CREME;g.font=F(26);g.fillText("venceu "+ph.name+" · fase "+(nf.pi+1)+"/"+P.phases.length,70,828);
  g.fillStyle=CINZA;g.font='40px "VT323",monospace';g.fillText(ph.cenario||"",70,872);
  // estatisticas 2x2
  const mm=Math.floor(nf.t/60),ss=String(Math.floor(nf.t%60)).padStart(2,"0");
  const box=[["PONTOS",String(score).padStart(7,"0"),"#ffe36a"],["COMBO MÁX",nf.combo+" HITS","#ff8c00"],
             ["TEMPO",mm+":"+ss,CREME],["DANO SOFRIDO",nf.dp+"%",CREME]];
  box.forEach((b,i)=>{const x=70+(i%2)*480,y=905+Math.floor(i/2)*140;
    g.fillStyle="#1e1824";g.fillRect(x,y,460,124);
    g.fillStyle=CINZA;g.font=F(20);g.fillText(b[0],x+26,y+44);
    g.fillStyle=b[2];g.font=F(38);g.fillText(b[1],x+26,y+100);});
  if(nf.cont){g.fillStyle=CINZA;g.font=F(16);g.fillText("com continue",70,1196);}
  // rodape
  g.strokeStyle="#6a5a3a";g.lineWidth=3;g.setLineDash([12,10]);g.beginPath();g.moveTo(70,1222);g.lineTo(1010,1222);g.stroke();g.setLineDash([]);
  g.fillStyle=OURO;g.font=F(26);g.textAlign="left";g.fillText("VEM ME SUPERAR!",70,1290);
  g.fillStyle=CINZA;g.font=F(18);g.textAlign="right";g.fillText("MC SUPREMO · Nicosheik Labs",1010,1290);
  // aberto direto do disco (file://) o Chrome bloqueia exportar canvas com imagens de arquivo: refaz sem elas
  try{return await new Promise((r,rj)=>{try{c.toBlob(r,'image/png');}catch(e){rj(e);}});}
  catch(e){return semImg?null:await geraCard(true);}}
async function compartilharCard(){
  const btn=document.getElementById('shareBtn');
  let blob=cardBlob;if(!blob){btn.textContent="GERANDO...";blob=await geraCard();cardBlob=blob;}
  if(!blob)return;
  const nf=notaFase,txt="Tirei nota "+nf.n+" contra "+P.phases[nf.pi].name+" no MC SUPREMO! Vem me superar!";
  const file=new File([blob],"mc-supremo-recorde.png",{type:"image/png"});
  try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],text:txt});btn.textContent="📤 COMPARTILHAR RECORDE";return;}}
  catch(e){btn.textContent="📤 COMPARTILHAR RECORDE";if(e&&e.name==="AbortError")return;}
  // sem menu nativo de compartilhar: baixa a imagem
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download="mc-supremo-recorde.png";
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);
  btn.textContent="✓ IMAGEM SALVA";setTimeout(()=>{btn.textContent="📤 COMPARTILHAR RECORDE";},2200);}
(function(){const b=document.getElementById('shareBtn');
  const go=e=>{e.preventDefault();e.stopPropagation();vib(8);compartilharCard();};
  b.addEventListener('click',go);})();
function drawResult(){const ph=IMG.phases[Math.min(enemy.pi,P.phases.length-1)];
  if(ph.bg.ok){try{cx.drawImage(ph.bg,0,0,W,H);}catch(e){}}
  cx.fillStyle="rgba(0,0,0,.68)";cx.fillRect(0,0,W,H);cx.textAlign="center";
  if(resultType==="lose"){
    const ph=P.phases[Math.min(enemy.pi,P.phases.length-1)];
    const imgPh=IMG.phases[Math.min(enemy.pi,P.phases.length-1)];
    const gf=(imgPh.victoryA&&imgPh.victoryA[0])||imgPh.idle[0];
    if(gf&&gf.img&&gf.img.ok){try{
      const hh=340,ww=gf.w*(hh/gf.h);
      cx.save();cx.translate(W-ww-40,H-hh-10);
      cx.drawImage(gf.img,0,0,ww,hh);cx.restore();
    }catch(e){}}
    cx.fillStyle="#c0392b";cx.font='50px "Press Start 2P",monospace';cx.fillText("GAME OVER",W/2,150);
    cx.fillStyle="#d9cba6";cx.font='24px "VT323",monospace';
    cx.fillText("O show acabou cedo. A plateia foi embora.",W/2,190);
    cx.fillStyle=ph.accent;cx.font='13px "Press Start 2P",monospace';
    cx.fillText("FASE "+(enemy.pi+1)+"/"+P.phases.length+"  ·  "+ph.name,W/2,232);
    cx.fillStyle="#8d8471";cx.font='19px "VT323",monospace';
    cx.fillText(ph.cenario,W/2,258);
    cx.fillStyle="#6d6357";cx.font='19px "VT323",monospace';
    cx.fillText("Voce caiu com "+HERO().title+" em campo. Como quer voltar?",W/2,306);
    drawLoseMenu();}
  else{const cxL=notaFase?W*0.34:W/2;   // com nota: textos a esquerda, carimbo a direita
    if(resultType==="final"){cx.fillStyle="#ffcf33";cx.font='34px "Press Start 2P",monospace';cx.fillText("TURNÊ COMPLETA!",cxL,250);
      cx.fillStyle="#2ec27e";cx.font='18px "Press Start 2P",monospace';cx.fillText("VOCÊ É O MC SUPREMO",cxL,300);}
    else{cx.fillStyle="#ffcf33";cx.font='52px "Press Start 2P",monospace';cx.fillText("K.O.!",cxL,250);
      cx.fillStyle="#2ec27e";cx.font='20px "Press Start 2P",monospace';cx.fillText("FASE VENCIDA",cxL,298);}
    if(lastBonusPts!=null&&resultType==="win"){cx.fillStyle="#ffe36a";cx.font='16px "Press Start 2P",monospace';cx.fillText("BÔNUS DO UNO +"+lastBonusPts,cxL,350);}
    cx.fillStyle="#fff";cx.font='20px "Press Start 2P",monospace';cx.fillText("★ "+String(score).padStart(7,"0"),cxL,392);
    if(notaFase)drawNotaResultado();}
  cx.textAlign="left";}
// =====================================================================
// CONTADOR DE COMBO (HUD) - mostra que os golpes estao encadeando
// Conta todo acerto em vilao (combo 👊, 🦵, voadora, combo aereo, slide na cabeca,
// agarrao e quem o arremessado atropela) + hits no Uno do bonus.
// Janela: se passar COMBO_JANELA sem acertar, o combo fecha e paga bonus.
// Levar dano QUEBRA o combo (sem bonus).
// =====================================================================
const combo={n:0,t:0,pop:0,max:0,fimT:0,fimTxt:"",fimCor:"#fff",fimPts:0};
function comboHit(){
  combo.n++;tut.comboHits++;combo.t=CFG.COMBO_JANELA;combo.pop=1;combo.fimT=0;
  if(combo.n>combo.max)combo.max=combo.n;}
function comboFecha(quebrou){
  const n=combo.n;combo.n=0;combo.t=0;
  if(n<2)return;
  if(quebrou){combo.fimTxt="COMBO QUEBRADO";combo.fimCor="#ff6a5a";combo.fimPts=0;}
  else{const pts=n>=3?n*CFG.COMBO_BONUS:0;score+=pts;if(bonus)bonus.pts+=0;
    combo.fimTxt=n+" HITS"+(n>=10?" INSANO!":n>=6?" SUPREMO!":n>=3?" BOA!":"");
    combo.fimCor=corCombo(n);combo.fimPts=pts;}
  combo.fimT=1.3;}
function comboReset(){combo.n=0;combo.t=0;combo.pop=0;combo.fimT=0;}
function corCombo(n){return n>=10?"#ff3c3c":n>=6?"#ff8c00":n>=3?"#ffcf33":"#ffffff";}
function tickCombo(dt){
  if(combo.pop>0)combo.pop=Math.max(0,combo.pop-dt*6);
  if(combo.n>0){combo.t-=dt;if(combo.t<=0)comboFecha(false);}
  if(combo.fimT>0)combo.fimT-=dt;}
// desenho: canto superior ESQUERDO, abaixo da vida - longe dos dedos (botoes ficam embaixo)
function drawComboHUD(topo){
  const x=26,y=(topo||118);
  cx.save();cx.textAlign="left";cx.lineJoin="round";
  if(combo.n>=2){
    const cor=corCombo(combo.n),esc=1+combo.pop*0.45;
    const tremor=combo.n>=10?(Math.random()-.5)*3:0;
    cx.translate(x+tremor,y+30);cx.scale(esc,esc);
    cx.font='34px "Press Start 2P",monospace';cx.lineWidth=8;cx.strokeStyle="#000";
    const num=String(combo.n);cx.strokeText(num,0,0);cx.fillStyle=cor;cx.fillText(num,0,0);
    const wN=cx.measureText(num).width;
    cx.font='14px "Press Start 2P",monospace';cx.lineWidth=6;
    cx.strokeText("HITS",wN+10,-2);cx.fillStyle="#fff";cx.fillText("HITS",wN+10,-2);
    cx.restore();cx.save(); // volta ao estado sem escala pra desenhar a barra
    // barra da janela: mostra quanto tempo falta pra encadear o proximo golpe
    const pct=Math.max(0,combo.t/CFG.COMBO_JANELA);
    cx.fillStyle="rgba(0,0,0,.6)";cx.fillRect(x,y+44,150,6);
    cx.fillStyle=cor;cx.fillRect(x,y+44,150*pct,6);
  }else if(combo.fimT>0){
    const a=Math.min(1,combo.fimT/0.4);cx.globalAlpha=a;
    cx.font='16px "Press Start 2P",monospace';cx.lineWidth=6;cx.strokeStyle="#000";
    cx.strokeText(combo.fimTxt,x,y+26);cx.fillStyle=combo.fimCor;cx.fillText(combo.fimTxt,x,y+26);
    if(combo.fimPts>0){cx.font='12px "Press Start 2P",monospace';
      cx.strokeText("+"+combo.fimPts,x,y+50);cx.fillStyle="#ffe36a";cx.fillText("+"+combo.fimPts,x,y+50);}
  }
  cx.restore();}
// =====================================================================
// TUTORIAL CONTEXTUAL - uma dica por vez, so na PRIMEIRA vez que a situacao aparece.
// A dica some quando o jogador FAZ o comando (mostra "BOA!") ou apos 9 s.
// O botao citado pulsa na tela. Visto fica salvo no aparelho (localStorage).
// =====================================================================
const TUT_KEY="mcs_tutorial_v1";
let tutVisto={};try{tutVisto=JSON.parse(localStorage.getItem(TUT_KEY)||"{}")||{};}catch(e){tutVisto={};}
const tut={manobra:false,andou:0,lastX:null,lastY:null,comboHits:0,agarrou:false,chutou:false,fugiu:false,voadora:false,slide:false,quebrou:false,levouDano:false,
  ativa:null,t:0,okT:0,fade:0,domEl:null};
function tutSalva(){try{localStorage.setItem(TUT_KEY,JSON.stringify(tutVisto));}catch(e){}}
function tutReset(){tutVisto={};tutSalva();Object.assign(tut,{andou:0,comboHits:0,agarrou:false,chutou:false,fugiu:false,voadora:false,slide:false,quebrou:false,levouDano:false});tutFecha();}
function vivosPerto(r){let n=0;for(const t of alvos())if(t.state!=="dead"&&Math.abs(t.wx-player.wx)<r&&Math.abs(screenX(t.wx)-W/2)<W/2)n++;return n;}
function propPerto(fn,r){return track.some(pr=>fn(pr)&&pr.wx>player.wx-40&&pr.wx-player.wx<r);}
// ordem = prioridade. quando(): situacao apareceu. feito(): jogador executou.
const DICAS=[
  {id:"andar",   l1:"🕹️ ARRASTE NA ESQUERDA", l2:"PRA ANDAR NA CALÇADA",       alvo:"stick", quando:()=>true,                          feito:()=>tut.andou>140},
  {id:"combo",   l1:"👊 1 TOQUE = COMBO",      l2:"DE 3 HITS COM O SKATE",      alvo:"punch", quando:()=>vivosPerto(360)>0,               feito:()=>tut.comboHits>=2},
  {id:"fuga",    l1:"CERCADO? ⤴️⤴️ RÁPIDO",    l2:"= SALTO DE FUGA INVENCÍVEL", alvo:"jump",  quando:()=>tut.levouDano||vivosPerto(260)>=3, feito:()=>tut.fugiu},
  {id:"chute",   l1:"🦵 SHUV-IT EMPURRA",       l2:"E ABRE ESPAÇO NO CERCO",     alvo:"kick",  quando:()=>vivosPerto(260)>=2,               feito:()=>tut.chutou},
  {id:"agarrao", l1:"COLADO + 👊 = AGARRA · 👊 JOELHADA", l2:"🕹️ TRÁS/FRENTE + 👊 = ARREMESSA", alvo:"punch", quando:()=>tutVisto.combo&&vivosPerto(110)>0, feito:()=>tut.agarrou},
  {id:"voadora", l1:"NO AR: 👊 OU 🦵",          l2:"= VOADORA DE SKATE",         alvo:"kick",  quando:()=>player.z>40&&player.vz>0&&!player.airAtk, feito:()=>tut.voadora},
  {id:"caixa",   l1:"QUEBRA A CAIXA/LATÃO:",    l2:"PODE TER COPO DE CURA",      alvo:"punch", quando:()=>propPerto(p=>p.breakable,380),   feito:()=>tut.quebrou},
  {id:"manobras",l1:"NO SLIDE: 🕹️ ↑ ↓ ← →",     l2:"= MANOBRAS NO MESMO COMBO",  alvo:"stick", quando:()=>!!player.grindMode,               feito:()=>tut.manobra},
  {id:"slide",   l1:"⤴️ + SEGURA 🦵 EM CIMA",    l2:"= SLIDE NO BANCO OU CARRO",  alvo:"kick",  quando:()=>propPerto(p=>p.grind,420),       feito:()=>tut.slide},
];
function tutDomEl(alvo){return alvo==="stick"?document.getElementById("stick"):document.querySelector('.tb[data-k="'+alvo+'"]');}
function tutFecha(){if(tut.domEl)tut.domEl.classList.remove("dica");tut.domEl=null;tut.ativa=null;}
function updateTutorial(dtReal){
  if(!CFG.TUTORIAL){if(tut.ativa)tutFecha();return;}
  const p=player;
  if(tut.lastX!==null)tut.andou+=Math.abs(p.wx-tut.lastX)+Math.abs(p.y-tut.lastY);
  tut.lastX=p.wx;tut.lastY=p.y;
  if(tut.okT>0){tut.okT-=dtReal;if(tut.okT<=0)tutFecha();return;}   // mostrando "BOA!"
  if(tut.ativa){
    tut.t-=dtReal;tut.fade=Math.min(1,tut.fade+dtReal*4);
    if(tut.ativa.feito()){tut.okT=0.9;vib(10);if(tut.domEl)tut.domEl.classList.remove("dica");return;}
    if(tut.t<=0)tutFecha();
    return;}
  if(bannerT>0||goT>0)return;           // nao disputa atencao com banner de chefe / "VAI!"
  for(const d of DICAS){
    if(tutVisto[d.id])continue;
    if(d.feito()){tutVisto[d.id]=1;tutSalva();continue;}    // ja fez sozinho: nem mostra
    if(!d.quando())continue;
    tut.ativa=d;tut.t=9;tut.fade=0;tutVisto[d.id]=1;tutSalva();
    tut.domEl=tutDomEl(d.alvo);if(tut.domEl)tut.domEl.classList.add("dica");
    break;}
}
function drawTutorial(){
  const d=tut.ativa;if(!d)return;
  const ok=tut.okT>0,a=ok?Math.min(1,tut.okT/0.3):tut.fade;
  cx.save();cx.globalAlpha=a;cx.textAlign="center";
  const y=150,l1=ok?"BOA! ✓":d.l1,l2=ok?"":d.l2;
  cx.font='22px "Press Start 2P",monospace';const w1=cx.measureText(l1).width;
  cx.font='16px "Press Start 2P",monospace';const w2=cx.measureText(l2).width;
  const bw=Math.max(w1,w2)+56,bh=l2?92:60,bx=W/2-bw/2;
  cx.fillStyle="rgba(8,6,12,.82)";cx.fillRect(bx,y,bw,bh);
  const pulse=0.55+0.45*Math.sin(performance.now()/180);
  cx.strokeStyle=ok?"#2ec27e":"rgba(255,207,51,"+pulse+")";cx.lineWidth=3;cx.strokeRect(bx,y,bw,bh);
  cx.font='22px "Press Start 2P",monospace';cx.fillStyle=ok?"#2ec27e":"#ffcf33";cx.fillText(l1,W/2,y+(l2?38:41));
  if(l2){cx.font='16px "Press Start 2P",monospace';cx.fillStyle="#fff";cx.fillText(l2,W/2,y+72);}
  cx.restore();}
function tickFx(dt){
  tickCombo(dt);
  if(scene==="phase"||scene==="bonus")updateTutorial(dt/GAME_SPEED);
  if(shake>0)shake=Math.max(0,shake-24*dt);
  for(const s of sparks){s.t-=dt;s.wx+=s.vx*dt;s.y+=s.vy*dt;s.vy+=680*dt;}sparks=sparks.filter(s=>s.t>0);
  for(const r of rings){r.r+=520*dt;r.t-=dt;}rings=rings.filter(r=>r.t>0);
  for(const b of bursts){b.t-=dt;}bursts=bursts.filter(b=>b.t>0);
  for(const dn of dmgNums){dn.t-=dt;dn.wx+=0;dn.vy+=260*dt;}dmgNums=dmgNums.filter(dn=>dn.t>0);
  if(flashOverlay>0)flashOverlay=Math.max(0,flashOverlay-dt*2.6);
  if(avisoT>0)avisoT=Math.max(0,avisoT-dt);}
// barra de carregamento: acompanha a decodificacao das imagens e some quando o jogo esta pronto
(function(){const L=document.getElementById('loader');if(!L)return;
  const fill=document.getElementById('lfill'),msg=document.getElementById('lmsg'),t0=performance.now();
  const dicas=["DICA: 👊 COM O VILÃO COLADO = AGARRÃO","DICA: ⤴️⤴️ RÁPIDO = SALTO DE FUGA","DICA: ⤴️ + SEGURA 🦵 = SLIDE","DICA: QUEBRE CAIXAS: PODE TER COPO DE CURA"];
  let di=0;const dEl=L.querySelector('.ldica');
  const tick=()=>{
    const p=_imgTot?_imgOk/_imgTot:1;fill.style.width=Math.max(8,Math.round(p*100))+'%';
    msg.textContent="CARREGANDO A TURNÊ... "+Math.round(p*100)+"%";
    if(performance.now()-t0>(di+1)*2200){di++;dEl.textContent=dicas[di%dicas.length];}
    if(p>=1||performance.now()-t0>15000){L.classList.add('fora');setTimeout(()=>L.remove(),450);return;}
    setTimeout(tick,120);};
  tick();})();
// abertura: adianta a fase em que o jogador esta e a trilha do museu
AU.prepara("intro");                                   // trilha do titulo: ja
setTimeout(()=>{try{preparaFase(phaseIndex);AU.prepara("hub");}catch(e){}},2500); // o resto depois que o titulo abriu
let last=performance.now();
function loop(now){let dt=(now-last)/1000*GAME_SPEED;last=now;if(!(dt>0))dt=0;if(dt>0.05)dt=0.05;
  syncTouchUI();
  if(paused){requestAnimationFrame(loop);return;} // PAUSA: nada anda, a tela fica no ultimo frame
  if(fadeT>0)fadeT-=dt;
  try{
    if(scene==="intro"){AU.playLoop(AU.tem("intro")?"intro":"hub");drawIntro();
      if(press.confirm){press.confirm=false;AU.select();
        if(introPage===0&&!flow.jogou){                 // 1a vez: do titulo direto pra briga
          flow.jogou=true;flowSalva();saveNow();AU.power();startPhase();}
        else if(introPage===0&&flow.historia){scene="hub";fadeT=0.35;} // veterano: titulo -> museu
        else if(introPage<INTRO_PAGES.length-1)introPage++;
        else{flow.historia=true;flowSalva();
          if(introDestino==="select"){selIdx=Math.max(0,HERO_KEYS.indexOf(heroKey));scene="select";}
          else scene="hub";
          fadeT=0.35;}}
    }else if(scene==="select"){AU.playLoop("hub");drawSelect();
      if(keys.left&&!selPrevL){selIdx=(selIdx+HERO_KEYS.length-1)%HERO_KEYS.length;AU.select();}
      if(keys.right&&!selPrevR){selIdx=(selIdx+1)%HERO_KEYS.length;AU.select();}
      selPrevL=keys.left?1:0;selPrevR=keys.right?1:0;
      if(press.punch){press.punch=false;selIdx=(selIdx+1)%HERO_KEYS.length;AU.select();}
      if(press.confirm){press.confirm=false;heroKey=HERO_KEYS[selIdx];saveNow();AU.power();
        if(selReturn==="phase"){selReturn="hub";startPhase();}
        else if(selReturn==="continua"){selReturn="hub";continuaDaOnda();}
        else{scene="hub";fadeT=0.35;}}
    }else if(scene==="hub"){if(shake>0)shake=0;AU.playLoop("hub");preparaFase(phaseIndex);drawHub();
      if(press.punch){press.punch=false;selIdx=Math.max(0,HERO_KEYS.indexOf(heroKey));
        scene="select";fadeT=0.35;AU.select();}
      if(press.reset){resetSave();press.reset=false;}
      if(press.confirm){press.confirm=false;
        if(phaseIndex<P.phases.length){AU.select();startPhase();}
        else{AU.select();resetSave();startPhase();}}
    }else if(scene==="phase"){press.confirm=false;AU.playLoop("p"+enemy.pi);
      tickFx(dt);
      if(hitStopT>0){hitStopT=Math.max(0,hitStopT-dt);}
      else{updateCombat(dt);}
      if(scene==="phase")drawPhase(dt);
    }else if(scene==="bonus"){press.confirm=false;AU.playLoop("p"+enemy.pi);
      tickFx(dt);
      if(hitStopT>0){hitStopT=Math.max(0,hitStopT-dt);}
      else{updateBonus(dt);}
      if(scene==="bonus")drawBonus(dt);
    }else if(scene==="epilogue"){AU.stopLoop();drawEpilogue();
      if(press.confirm){press.confirm=false;AU.select();
        if(epiPage<epiPageCount()-1){epiPage++;fadeT=0.3;}
        else{credScroll=0;credDone=false;scene="credits";fadeT=0.4;}}
    }else if(scene==="credits"){AU.playLoop(AU.tem("creditos")?"creditos":(heroKey==="nico"?"credNico":"credAbacaxi"));
      credScroll+=dt*46;drawCredits(dt);
      if((credDone||press.confirm)){press.confirm=false;AU.stopLoop();resetSave();toHub();}
    }else if(scene==="result"){if(resultType==="final"&&AU.tem("creditos"))AU.playLoop("creditos");drawResult();
      if(resultType==="lose"){
        const up=keys.up||0,dn=keys.down||0;
        if(up&&!losePrevU){loseIdx=(loseIdx+LOSE_OPTS.length-1)%LOSE_OPTS.length;AU.select();}
        if(dn&&!losePrevD){loseIdx=(loseIdx+1)%LOSE_OPTS.length;AU.select();}
        losePrevU=up;losePrevD=dn;
        if(press.punch){press.punch=false;loseIdx=(loseIdx+1)%LOSE_OPTS.length;AU.select();}
        if(press.confirm){press.confirm=false;LOSE_OPTS[loseIdx].act();}
      }else if(resultType==="final"){if(press.confirm){press.confirm=false;AU.select();epiPage=0;scene="epilogue";fadeT=0.4;}}
      else if(press.confirm){press.confirm=false;AU.select();toHub();}}
    if(!((scene==="phase"||scene==="bonus")&&hitStopT>0)){press.jump=press.punch=press.kick=press.skate=press.shoot=press.mkey=false;press.jumpTaps.length=0;}
    if(fadeT>0){cx.fillStyle="rgba(0,0,0,"+Math.min(1,fadeT/0.35)+")";cx.fillRect(0,0,W,H);}
  }catch(e){console.warn(e);}
  requestAnimationFrame(loop);}
renderLegend();
requestAnimationFrame(loop);


// ================= PAINEL ADMIN =================
(function(){
  if(typeof SEM_ADMIN!=="undefined"&&SEM_ADMIN){ // versao publicada: sem o botao 🛠️
    const b=document.getElementById('adminBtn'),pn=document.getElementById('adminPanel');if(b)b.remove();if(pn)pn.remove();return;}
  if(!DEV){const b=document.getElementById('adminBtn');if(b)b.style.display='none';}
  function fileToDataURL(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});}
  function dimsFromDataURL(src){return new Promise((res)=>{const im=new Image();im.onload=()=>res({w:im.naturalWidth,h:im.naturalHeight});im.onerror=()=>res({w:200,h:300});im.src=src;});}
  // redimensiona a imagem (canvas) pra bater exatamente na altura-alvo, preservando proporção
  function resizeToHeight(src, targetH){
    return new Promise((res)=>{
      const im=new Image();
      im.onload=()=>{
        if(im.naturalHeight===targetH){ res({src,w:im.naturalWidth,h:targetH}); return; }
        const w=Math.max(1,Math.round(im.naturalWidth*targetH/im.naturalHeight));
        const c=document.createElement('canvas'); c.width=w; c.height=targetH;
        c.getContext('2d').drawImage(im,0,0,w,targetH);
        res({src:c.toDataURL('image/webp',0.9), w, h:targetH}); // novos quadros do Admin vao embutidos no dados.js
      };
      im.onerror=()=>res({src,w:200,h:targetH});
      im.src=src;
    });
  }
  const STD_HEIGHT=300; // padrão do jogo pra personagens novos sem referência ainda
  function findJsonBlock(text, startMarker){
    const start = text.indexOf(startMarker);
    if(start<0) return null;
    let k = start+startMarker.length, depth=0, inStr=false, esc=false, blockStart=-1;
    for(; k<text.length; k++){
      const c=text[k];
      if(inStr){ if(esc){esc=false;} else if(c==='\\\\'){esc=true;} else if(c==='"'){inStr=false;} continue; }
      if(c==='"'){inStr=true;continue;}
      if(c==='{'){ if(depth===0)blockStart=k; depth++; }
      else if(c==='}'){ depth--; if(depth===0){ return {start:blockStart, end:k+1}; } }
    }
    return null;
  }
  async function filesToFrames(fileList, targetH){
    const files = Array.from(fileList).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
    const out=[];
    for(const f of files){
      const src = await fileToDataURL(f);
      if(targetH){ out.push(await resizeToHeight(src, targetH)); }
      else{ const {w,h} = await dimsFromDataURL(src); out.push({src,w,h}); }
    }
    return out;
  }
  function padTo(arr, n){ const out=arr.slice(); while(out.length<n) out.push(out[out.length-1]); return out; }
  function adminMsg(t){ const el=document.getElementById('adminMsg'); el.textContent=t; el.style.display='block'; clearTimeout(adminMsg._t); adminMsg._t=setTimeout(()=>el.style.display='none',2400); }


  // ---------- MUSICA POR FASE ----------
  function renderAdminMusic(){
    const box=document.getElementById('adminMusic'); box.innerHTML='';
    P.phases.forEach((ph,idx)=>{
      const row=document.createElement('div'); row.className='adminRow';
      const tem = !!ph.musicSrc;
      row.innerHTML = '<b style="width:150px;display:inline-block">'+ph.name+'</b>'+
        '<span style="font-size:13px;opacity:.8">'+(tem?'🎵 música própria':'sintetizador padrão')+'</span>'+
        '<label class="up">SUBIR MÚSICA (mp3/ogg)<input type="file" accept="audio/*"></label>'+
        (tem?'<button class="rmMusic" style="background:#c0392b;border:none;color:#fff;border-radius:5px;padding:5px 9px;cursor:pointer">REMOVER</button>':'');
      row.querySelector('input[type=file]').addEventListener('change', async e=>{
        if(!e.target.files[0]) return;
        const src = await fileToDataURL(e.target.files[0]);
        ph.musicSrc = src; AU.setCustomTrack('p'+idx, src);
        adminMsg('Música de '+ph.name+' atualizada.'); renderAdminMusic();
      });
      const rm = row.querySelector('.rmMusic');
      if(rm) rm.addEventListener('click', ()=>{ delete ph.musicSrc; AU.setCustomTrack('p'+idx,null); adminMsg('Música removida, volta ao sintetizador.'); renderAdminMusic(); });
      box.appendChild(row);
    });
  }

  // ---------- COMBOS DOS PODERES ----------
  const TOKEN_LABELS = {j:'Pular',m:'Poder (⚡)',x:'Defesa',c:'Chute',l:'Esquerda',r:'Direita',z:'Soco',v:'Tiro'};
  function tokenSelect(cur, options, onChange){
    const sel=document.createElement('select');
    sel.style.cssText='background:#1a1620;color:#fff;border:1px solid #444;border-radius:4px;padding:3px';
    options.forEach(o=>{const op=document.createElement('option');op.value=o;op.textContent=TOKEN_LABELS[o]||o;if(o===cur)op.selected=true;sel.appendChild(op);});
    sel.addEventListener('change', ()=>onChange(sel.value));
    return sel;
  }
  function renderAdminCombos(){
    // CONTROLES DOS 3 BOTOES: tudo que afeta 👊 🦵 ⤴️ e o bonus do Uno fica editavel aqui
    const box=document.getElementById('adminCombos'); box.innerHTML='';
    const LBL={GRAB_X:'Agarrão dist X',GRAB_Y:'Agarrão dist Y',DOUBLE_TAP_MS:'⤴️⤴️ janela (ms)',VIBRAR:'Vibração (1/0)',TUTORIAL:'Tutorial contextual (1/0)',GUIA_ALINHAMENTO:'Guia de alinhamento no chão (1/0)',NOTA_TEMPO_PAR:'Nota: tempo ideal da fase (s)',NOTA_COMBO_ALVO:'Nota: combo p/ nota cheia',NOTA_PONTOS_ALVO:'Nota: pontos p/ nota cheia',VETERANOS_PCT:'Veteranos: % da onda (0-1)',VETERANOS_MAX_ONDA:'Veteranos: máx por onda',VETERANO_HP_MUL:'Veteranos: vida x capanga',JUMP_BUFFER_S:'Buffer ⤴️ durante golpe (s)',JUMP_BUFFER_POUSO_S:'Buffer ⤴️ antes do pouso (s)',ESCAPE_IFRAME_SEC:'Fuga invencível (s reais)',PUNCH_RANGE_X:'👊 alcance X',PUNCH_RANGE_Y:'👊 alcance Y (calçada)',PUNCH_RANGE_Z:'👊 alcance Z (altura)',ENEMY_STOP_DIST:'Vilão para a (px)',ENEMY_ATK_Y:'Vilão só ataca alinhado (Y)',ENEMY_HIT_X:'Golpe do vilão alcance X',ENEMY_HIT_Y:'Golpe do vilão alcance Y',
      ESCAPE_VZ:'Fuga altura',ESCAPE_VX:'Fuga distância',JUMP_VZ:'Pulo altura',KICK_KNOCKBACK:'🦵 empurrão',
      COMBO_HITS:'👊 hits do combo',COMBO_JANELA:'Contador: janela p/ encadear (s)',COMBO_BONUS:'Contador: pontos por hit (3+)',COMBO_WINDOW_MS:'👊 janela (ms)',FINISHER_KB:'👊 último hit empurra',THROW_T:'Agarrão duração (s)',
      THROW_KB:'Arremesso força',FLYKICK_VX:'Voadora veloc.',AIR_COMBO_HITS:'Combo aéreo hits',AIR_HANG_VZ:'Combo aéreo flutua',AIR_CHAIN_DELAY:'Combo aéreo intervalo (s)',ESCAPE_STEER:'Fuga muda direção (1/0)',ESCALA_PERSONAGENS:'Escala dos personagens',ESCALA_ALTURA:'Altura na tela (pulo/props)',VEL_MUL:'Velocidade do MC x',VEL_MUL_VILAO:'Velocidade dos vilões x',KB_MUL:'Empurrão dos golpes x',QUEDA_HITS:'MC cai após N golpes seguidos',QUEDA_JANELA:'Janela desses golpes (s)',QUEDA_DANO:'Golpe que derruba sozinho (dano)',QUEDA_CHAO:'MC no chão (s)',LEVANTA_INVENCIVEL:'MC levanta invencível (s)',DEITADO_T:'Vilão deitado (s)',LEVANTA_INVULN:'Vilão levanta invulnerável (s)',GRAB_HOLD:'Agarrão: tempo segurando (s)',JOELHADAS_MAX:'Agarrão: joelhadas máx',CARRO_PARALLAX:'Carro do fundo: movimento (0.1=10%)',CARRO_ESCALA:'Carro estacionado: escala',POSTE_ALTURA:'Poste: altura (px)',POSTE_LUZ:'Poste: força da luz',POSTE_CONE:'Poste: largura do cone de luz',POSTE_DEFEITO_CHANCE:'Poste com defeito: chance (0-1)',PROPS_CHANCE_FASE:'Objetos: chance da fase ter (0-1)',PROPS_MIN:'Objetos: mínimo',PROPS_MAX:'Objetos: máximo',PROPS_ESPACO:'Objetos: espaço mínimo (px)',COPOS_MIN:'Copos: mínimo',COPOS_MAX:'Copos: máximo',PESO_BANCO:'Sorteio: banco',PESO_CAIXA:'Sorteio: caixa de som',PESO_LATAO:'Sorteio: latão',CARRO_FUNDO_ESCALA:'Carro do fundo: escala',ESCALA_PROPS:'Escala de bancos/caixas',PISO_OPACIDADE:'Piso rolando: força (0=desliga)',PISO_ESP:'Piso rolando: espaço entre juntas',BG_PANORAMA_VEL:'Fundo panorâmico: velocidade',GRIND_SPEED:'Slide velocidade',MANOBRA_PTS:'Manobra: pontos (x nº da manobra)',MANOBRA_INTERVALO:'Manobra: intervalo mín (s)',MANOBRA_TEMPO_EXTRA:'Manobra: tempo extra no meio-fio (s)',MANOBRA_TEMPO_MAX:'Manobra: tempo extra máx (s)',MANOBRA_BONUS4:'Manobra: bônus das 4',MANOBRA_VEL_FRENTE:'→ Nosegrind: velocidade x',MANOBRA_VEL_TRAS:'← Tailslide: velocidade x',GRIND_MAX_MEIOFIO:'Slide meio-fio máx (s)',GRIND_HEAD_TICK:'Slide cabeça intervalo (s)',GRIND_HEAD_HITS:'Slide cabeça hits',GRIND_HOP_VZ:'Slide cabeça pulo saída',CURB_MARGIN:'Meio-fio distância',PROP_PROF:'Objetos: profundidade que ocupam (px)',DEGRAU_PULO_VILAO:'Degrau: pulo do vilão pra subir',BANCO_A_CADA:'Banco a cada N props (0=sem)',FASE_LEN:'Comprimento da fase (px)',ONDAS:'Ondas de capangas',ONDA_BASE:'Capangas por onda (base)',ONDA_MAX:'Capangas por onda (máx)',UNO_NA_FASE:'Uno no início da fase (1/0)',CAPANGA_HP:'Vida do capanga',MAX_ATACANTES:'Capangas batendo juntos',OBST_HP:'Obstáculo: hits p/ quebrar',OBST_DROP_CURA:'Obstáculo: chance de copo (0-1)',OBST_CHANCE:'Obstáculo: frequência (0-1)',ARREMESSO_COLATERAL:'Arremesso: dano em quem atinge',BG_ZOOM:'Zoom do fundo',POSTE_ESP:'Postes: espaçamento',ESCAPE_ATK_IFRAMES:'Ataque mantém i-frames (1/0)',TELEGRAPH_FRAMES:'Aviso do vilão (frames)',COPO_CURA:'Copo cura',COPO_Y:'Copo alcance Y'};
    const row=document.createElement('div');row.className='adminRow';row.style.flexWrap='wrap';
    Object.keys(LBL).forEach(k=>{
      const w=document.createElement('label');w.style.cssText='display:inline-flex;gap:4px;align-items:center;margin:2px 8px 2px 0';
      w.innerHTML=LBL[k]+' <input type="text" value="'+CFG[k]+'" style="width:55px">';
      w.querySelector('input').addEventListener('change',ev=>{const v=+ev.target.value;if(!isNaN(v)){CFG[k]=v;adminMsg(LBL[k]+' = '+v);}});
      row.appendChild(w);});
    box.appendChild(row);
    const row2=document.createElement('div');row2.className='adminRow';
    row2.innerHTML='<b style="color:#ff8c00">BÔNUS UNO</b>';
    [['scale','Escala'],['space','Espaço'],['time','Tempo (s)'],['hp','Hits p/ destruir'],['ptsHit','Pts/hit'],['ptsDestroy','Pts destruição']].forEach(([k,l])=>{
      const w=document.createElement('label');w.style.cssText='display:inline-flex;gap:4px;align-items:center;margin:2px 8px 2px 0';
      w.innerHTML=l+' <input type="text" value="'+CFG.UNO[k]+'" style="width:55px">';
      w.querySelector('input').addEventListener('change',ev=>{const v=+ev.target.value;if(!isNaN(v)){CFG.UNO[k]=v;adminMsg('Uno '+l+' = '+v);}});
      row2.appendChild(w);});
    box.appendChild(row2);
    const rt=document.createElement('button');rt.textContent='REVER TUTORIAL (zera dicas vistas)';rt.className='adminBtn';
    rt.style.cssText='margin-top:6px;padding:6px 10px;background:#3d7bd6;color:#fff;border:none;border-radius:4px;cursor:pointer';
    rt.addEventListener('click',()=>{tutReset();adminMsg('Tutorial zerado: as dicas vão aparecer de novo.');});box.appendChild(rt);
  }

  // ---------- DANOS DOS GOLPES ----------
  function renderAdminDamage(){
    const box=document.getElementById('adminDamage'); box.innerHTML='';
    // herois
    [['abacaxi','CABEÇA DE ABACAXI'],['nico','NICO']].forEach(([k,label])=>{
      const h=HEROES[k];
      const row=document.createElement('div'); row.className='adminRow';
      row.innerHTML = '<b style="width:180px;display:inline-block">'+label+'</b>'+
        'Soco <input type="text" class="dmgIn" data-hero="'+k+'" data-f="dmgSoco" value="'+h.dmgSoco+'" style="width:55px">'+
        'Chute <input type="text" class="dmgIn" data-hero="'+k+'" data-f="dmgChute" value="'+h.dmgChute+'" style="width:55px">'+
        'Voadora <input type="text" class="dmgIn" data-hero="'+k+'" data-f="dmgAr" value="'+h.dmgAr+'" style="width:55px">';
      box.appendChild(row);
    });
    // viloes/chefes
    P.phases.forEach((ph,idx)=>{
      const row=document.createElement('div'); row.className='adminRow';
      const dmgSoco = ph.dmgSoco!=null? ph.dmgSoco : (ph.dmg!=null? ph.dmg : Math.min(19,9+idx*2));
      const dmgChute = ph.dmgChute!=null? ph.dmgChute : dmgSoco;
      let html2 = '<b style="width:180px;display:inline-block">'+ph.name+'</b>';
      if(ph.fire) html2 += 'Fogo <input type="text" class="dmgIn" data-ph="'+idx+'" data-f="fire.dmg" value="'+ph.fire.dmg+'" style="width:55px"> ';
      if(ph.vinil) html2 += 'Vinil <input type="text" class="dmgIn" data-ph="'+idx+'" data-f="vinil.dmg" value="'+ph.vinil.dmg+'" style="width:55px"> ';
      const dmgPoder=(ph.dmgPoder!=null?ph.dmgPoder:15);
      html2 += 'Soco <input type="text" class="dmgIn" data-ph="'+idx+'" data-f="dmgSoco" value="'+dmgSoco+'" style="width:55px"> '+
        'Chute <input type="text" class="dmgIn" data-ph="'+idx+'" data-f="dmgChute" value="'+dmgChute+'" style="width:55px"> '+
        'Poder-fogo <input type="text" class="dmgIn" data-ph="'+idx+'" data-f="fire.dmg" value="'+(ph.fire?ph.fire.dmg:7)+'" style="width:55px">';
      row.innerHTML = html2;
      box.appendChild(row);
    });
    box.querySelectorAll('.dmgIn').forEach(inp=>{
      inp.addEventListener('change', e=>{
        const v = parseFloat(e.target.value); if(isNaN(v)) return;
        if(e.target.dataset.hero){ HEROES[e.target.dataset.hero][e.target.dataset.f]=v; }
        else{
          const idx=+e.target.dataset.ph, f=e.target.dataset.f, ph=P.phases[idx];
          if(f==='dmgSoco') ph.dmgSoco=v;
          else if(f==='dmgChute') ph.dmgChute=v;
          else if(f==='dmgPoder') ph.dmgPoder=v;
          else if(f==='dmgPoder') ph.dmgPoder=v;
          else if(f==='fire.dmg') ph.fire.dmg=v;
          else if(f==='vinil.dmg') ph.vinil.dmg=v;
        }
        adminMsg('Dano atualizado.');
      });
    });
    // SUPER BOSS: campos dos 3 poderes extras
    const sbDiv=document.createElement('div');
    sbDiv.style.cssText='margin-top:18px;border-top:2px dashed #d4af37;padding-top:12px';
    sbDiv.innerHTML='<b style="color:#d4af37;display:block;margin-bottom:8px">⚡ SUPER BOSS — PODERES EXTRAS</b>'+
      '<span style="font-size:11px;color:#aaa">Notas em chamas: </span>'+
      'Dano <input id="sbND" type="text" value="'+SB_PWR.notas.dmg+'" style="width:50px"> '+
      'CD <input id="sbNC" type="text" value="'+SB_PWR.notas.cooldown+'" style="width:50px"> '+
      '<span style="font-size:11px;color:#aaa"> | Bola de energia: </span>'+
      'Dano <input id="sbED" type="text" value="'+SB_PWR.energia.dmg+'" style="width:50px"> '+
      'CD <input id="sbEC" type="text" value="'+SB_PWR.energia.cooldown+'" style="width:50px"> '+
      '<span style="font-size:11px;color:#aaa"> | Paralisia: </span>'+
      'Dano <input id="sbPD" type="text" value="'+SB_PWR.paralisia.dmg+'" style="width:50px"> '+
      'Dur <input id="sbPDr" type="text" value="'+SB_PWR.paralisia.dur+'" style="width:50px"> '+
      'CD <input id="sbPC" type="text" value="'+SB_PWR.paralisia.cooldown+'" style="width:50px"> '+
      '<button id="sbApply" style="margin-left:10px;background:#d4af37;color:#000;border:none;padding:5px 10px;font-family:monospace;font-size:9px;cursor:pointer;border-radius:4px">APLICAR</button>';
    document.getElementById('adminDamage').appendChild(sbDiv);
    document.getElementById('sbApply').addEventListener('click',()=>{
      SB_PWR.notas.dmg=+document.getElementById('sbND').value||SB_PWR.notas.dmg;
      SB_PWR.notas.cooldown=+document.getElementById('sbNC').value||SB_PWR.notas.cooldown;
      SB_PWR.energia.dmg=+document.getElementById('sbED').value||SB_PWR.energia.dmg;
      SB_PWR.energia.cooldown=+document.getElementById('sbEC').value||SB_PWR.energia.cooldown;
      SB_PWR.paralisia.dmg=+document.getElementById('sbPD').value||SB_PWR.paralisia.dmg;
      SB_PWR.paralisia.dur=+document.getElementById('sbPDr').value||SB_PWR.paralisia.dur;
      SB_PWR.paralisia.cooldown=+document.getElementById('sbPC').value||SB_PWR.paralisia.cooldown;
      adminMsg('Poderes do SUPER BOSS atualizados!');
    });
  }

  // ---------- SALVAR (localStorage) ----------
  function persistEdits(){
    try{
      const dump = {P,NICO,HEROES_over:{abacaxi:{dmgSoco:HEROES.abacaxi.dmgSoco,dmgChute:HEROES.abacaxi.dmgChute,dmgAr:HEROES.abacaxi.dmgAr,sizeMul:HEROES.abacaxi.sizeMul},
        nico:{dmgSoco:HEROES.nico.dmgSoco,dmgChute:HEROES.nico.dmgChute,dmgAr:HEROES.nico.dmgAr,sizeMul:HEROES.nico.sizeMul}},
        POWER_SEQ,BOSS_SEQ,MANOBRA_SEQ,PROP_CFG,KEY_MAP,CFG};
      localStorage.setItem('mcsupremo_admin_edits', JSON.stringify(dump));
      adminMsg('Edições salvas neste navegador.');
    }catch(e){ adminMsg('Erro ao salvar: '+e.message); }
  }
  function loadPersistedEdits(){
    try{
      const raw = localStorage.getItem('mcsupremo_admin_edits');
      if(!raw) return;
      const dump = JSON.parse(raw);
      Object.assign(P, dump.P); Object.assign(NICO, dump.NICO);
      if(dump.HEROES_over){ Object.assign(HEROES.abacaxi, dump.HEROES_over.abacaxi); Object.assign(HEROES.nico, dump.HEROES_over.nico); }
      if(dump.POWER_SEQ) POWER_SEQ=dump.POWER_SEQ;
      if(dump.BOSS_SEQ) BOSS_SEQ=dump.BOSS_SEQ;
      if(dump.MANOBRA_SEQ) MANOBRA_SEQ=dump.MANOBRA_SEQ;
      if(dump.PROP_CFG) PROP_CFG=dump.PROP_CFG;
      if(dump.KEY_MAP) KEY_MAP=dump.KEY_MAP;
      if(dump.CFG&&dump.CFG._v===CFG._v) CFG=Object.assign(CFG,dump.CFG,{UNO:Object.assign({},CFG.UNO,dump.CFG.UNO||{})});
      renderLegend();
    }catch(e){ console.error('falha ao carregar edicoes salvas', e); }
  }

  // ---------- TECLAS DO TECLADO (PC) ----------
  const KEY_LABELS = {left:'Esquerda',right:'Direita',up:'Cima',down:'Baixo',jump:'Pular',punch:'Soco',
    kick:'Chute',skate:'Defesa',shoot:'Tiro',mkey:'Poder (⚡)',confirm:'Confirmar',reset:'Resetar'};
  function renderKeyMap(){
    const box=document.getElementById('keyMapRow'); if(!box) return; box.innerHTML='';
    Object.keys(KEY_LABELS).forEach(k=>{
      const line=document.createElement('div'); line.style.cssText='display:flex;gap:8px;align-items:center;margin:2px 0';
      const val = KEY_MAP[k]===' ' ? 'espaço' : KEY_MAP[k];
      line.innerHTML = '<span style="width:110px;display:inline-block">'+KEY_LABELS[k]+'</span>'+
        '<input type="text" maxlength="8" value="'+val+'" data-k="'+k+'" style="width:70px;background:#1a1620;border:1px solid #444;color:#fff;border-radius:5px;padding:4px 6px;text-align:center">';
      box.appendChild(line);
    });
  }
  function applyKeyMap(){
    const inputs = document.querySelectorAll('#keyMapRow input');
    const novo={};
    inputs.forEach(inp=>{
      let v=(inp.value||'').toLowerCase().trim();
      if(v==='espaço'||v==='espaco'||v==='') v=' ';
      novo[inp.dataset.k]=v;
    });
    KEY_MAP=novo;
    adminMsg('Teclas atualizadas.');
    renderKeyMap();
    renderLegend();
  }

  // ---------- PADRONIZAR TAMANHOS ----------
  function standardizeSizes(){
    const H = +document.getElementById('stdHeight').value || 300;
    P.phases.forEach((ph,idx)=>{
      const src = (ph.idleA&&ph.idleA[0]) || ph.idle;
      if(!src||!src.h) return;
      const base = (ph.tint? (P.phases.find(x=>x===ph).sizeMul):null); // preserva reducao manual relativa
      IMG.phases[idx].sizeMul = H/src.h * 0.6; // 0.6 = padrao geral já aplicado nos personagens
      ph.sizeMul = IMG.phases[idx].sizeMul;
    });
    const mcSrc = P.mc.idle&&P.mc.idle[0]; if(mcSrc&&mcSrc.h) HEROES.abacaxi.sizeMul = H/mcSrc.h*0.6;
    const nicoSrc = NICO.idle&&NICO.idle[0]; if(nicoSrc&&nicoSrc.h) HEROES.nico.sizeMul = H/nicoSrc.h*0.6;
    if(player) player.sizeMul = HERO().sizeMul;
    adminMsg('Tamanhos padronizados pra altura-base '+H+'px.');
    renderAdminPhases();
  }

  // ---------- PROPS (uno/copo) ----------
  function applyPropCfg(){
    GAME_SPEED=Math.max(0.3,Math.min(2.0,+document.getElementById('gameSpeedIn').value||GAME_SPEED));
    PROP_CFG.unoScale=+document.getElementById('unoScale').value||PROP_CFG.unoScale;
    PROP_CFG.unoGap=+document.getElementById('unoGap').value||PROP_CFG.unoGap;
    PROP_CFG.copoScale=+document.getElementById('copoScale').value||PROP_CFG.copoScale;
    PROP_CFG.copoGap=+document.getElementById('copoGap').value||PROP_CFG.copoGap;
    PROP_CFG.gapRand=+document.getElementById('gapRand').value||PROP_CFG.gapRand;
    // Reconstroi o track imediatamente para ver o efeito sem recarregar a fase
    if(typeof bandFor==='function' && typeof buildTrack==='function'){
      try{ track=buildTrack(bandFor(phaseIndex)); }catch(e){}
    }
    adminMsg('Aplicado! Props atualizados na fase atual.');
  }

  // =====================================================================
  // EDITOR DE QUADROS (frames) - cada golpe tem a quantidade IDEAL de quadros
  // pra necessidade do movimento. Por quadro: mover ◀ ▶, duplicar ⧉, apagar ✕.
  // Por golpe: TROCAR tudo, + ADICIONAR, AJUSTAR pra quantidade ideal, prévia animada e FPS.
  // =====================================================================
  // ideal = quadros recomendados | min = minimo que o motor exige | fps = chave em CFG.FPS (loop)
  // dur = golpe com tempo fixo (s) -> previa distribui os quadros nesse tempo | fb = golpe usado se estiver vazio
  const VILLAIN_MOVES = [
    {key:'idleA', label:'Parado / Respirando', ideal:4, min:1, fps:'idleV', mirror:['idle','guard']},
    {key:'walkA', label:'Andando (ziguezague)', ideal:6, min:0, fps:'walkV', mirror:[]},
    {key:'socoA', label:'Soco', ideal:3, min:0, dur:0.32, mirror:['attack']},
    {key:'chuteA', label:'Chute', ideal:3, min:0, dur:0.32, mirror:['attack2']},
    {key:'puloA', label:'Pulo / golpe saltando', ideal:3, min:0, dur:0.32, mirror:[]},
    {key:'danoA', label:'Levar Dano', ideal:2, min:0, dur:0.30, mirror:[]},
    {key:'tauntA', label:'Pose Debochando (paralisia)', ideal:2, min:0, dur:0.6, mirror:[]},
    {key:'mksA',   label:'Pose Tocando MKS (paralisia)', ideal:2, min:0, dur:0.6, mirror:[]},
  ];
  const HERO_MOVES = [
    {key:'idle', label:'Parado', ideal:4, min:1, fps:'idle'},
    {key:'run', label:'Andando na calçada', ideal:8, min:1, fps:'run'},
    {key:'jump', label:'Pulo (subindo / ápice / caindo)', ideal:3, min:3, dur:0.6},
    {key:'land', label:'Aterrissagem', ideal:2, min:2, dur:0.14},
    {key:'attack', label:'👊 Soco (hits 1 e 2 do combo)', ideal:3, min:1, dur:0.30},
    {key:'comboFinal', label:'👊 Hit final do combo (derruba)', ideal:3, min:0, dur:0.30, fb:'skate'},
    {key:'throw', label:'👊 Agarrão + arremesso', ideal:4, min:0, dur:0.42, fb:'skate'},
    {key:'kick', label:'🦵 Chute shuv-it', ideal:3, min:1, dur:0.34},
    {key:'voadora', label:'⤴️👊🦵 Voadora / combo aéreo', ideal:2, min:0, fps:'voadora', fb:'skate'},
    {key:'slide', label:'⤴️🦵 Slide (segurado)', ideal:2, min:0, fps:'slide', fb:'skate'},
    {key:'slideCima', label:'Slide + ↑ Ollie no trilho', ideal:2, min:0, fps:'slide', fb:'slide'},
    {key:'slideBaixo', label:'Slide + ↓ Crooked', ideal:2, min:0, fps:'slide', fb:'slide'},
    {key:'slideFrente', label:'Slide + → Nosegrind', ideal:2, min:0, fps:'slide', fb:'slide'},
    {key:'slideTras', label:'Slide + ← Tailslide', ideal:2, min:0, fps:'slide', fb:'slide'},
    {key:'fuga', label:'⤴️⤴️ Salto de fuga', ideal:3, min:0, dur:0.9, fb:'jump'},
    {key:'skate', label:'Skate (base das manobras)', ideal:6, min:1, fps:'skate'},
    {key:'dano', label:'Levar Dano', ideal:2, min:2, dur:0.32},
    {key:'victory', label:'Vitória', ideal:1, min:1, dur:1},
  ];
  function phaseRefHeight(ph){
    return (ph.idleA&&ph.idleA[0]&&ph.idleA[0].h) || (ph.idle&&ph.idle.h) || STD_HEIGHT;
  }
  function heroData(id){return id==='mc'?P.mc:NICO;}
  // ajusta a lista pra N quadros: amostragem uniforme (sobra) ou repeticao distribuida (falta)
  function resampleFrames(arr,n){
    if(!arr||!arr.length||n<1)return arr||[];
    const out=[];for(let i=0;i<n;i++)out.push(arr[Math.min(arr.length-1,Math.floor(i*arr.length/n))]);
    return out;}
  // aplica a lista nova no dado + imagens do motor
  function commitFrames(ctx,frames){
    if(ctx.kind==='hero'){
      const d=heroData(ctx.id),meta=HERO_MOVES.find(m=>m.key===ctx.move);
      if(frames.length&&frames.length<meta.min)frames=padTo(frames,meta.min);
      if(!frames.length){
        if(meta.min>0){adminMsg(meta.label+': precisa de pelo menos '+meta.min+' quadro(s).');return false;}
        delete d[ctx.move];if(ctx.id==='mc')delete IMG.mc[ctx.move];else delete IMG.nico[ctx.move];
      }else{
        d[ctx.move]=frames;
        if(ctx.id==='mc')IMG.mc[ctx.move]=fsetArr(frames);else IMG.nico[ctx.move]=fsetArr(frames,null);
      }
    }else{
      const ph=P.phases[ctx.id],meta=VILLAIN_MOVES.find(m=>m.key===ctx.move),t=ph.tint||null;
      if(!frames.length){
        if(meta.min>0){adminMsg(meta.label+': precisa de pelo menos '+meta.min+' quadro(s).');return false;}
        ph[ctx.move]=null;IMG.phases[ctx.id][ctx.move]=null;
      }else{
        ph[ctx.move]=frames;IMG.phases[ctx.id][ctx.move]=fsA(frames,t);
        meta.mirror.forEach(fk=>{ph[fk]=frames[0];IMG.phases[ctx.id][fk]=fset(frames[0],t);});
      }
    }
    return true;}
  function getFrames(ctx){return ctx.kind==='hero'?(heroData(ctx.id)[ctx.move]||[]):(P.phases[ctx.id][ctx.move]||[]);}
  function refHeightOf(ctx){
    if(ctx.kind==='hero'){const d=heroData(ctx.id);return (d.idle&&d.idle[0]&&d.idle[0].h)||STD_HEIGHT;}
    return phaseRefHeight(P.phases[ctx.id]);}
  function rerender(ctx){if(ctx.kind==='hero')renderHeroDetail(ctx.id);else renderPhaseDetail(ctx.id);}
  async function frameOp(ctx,op,i,files){
    let fr=getFrames(ctx).slice();const meta=(ctx.kind==='hero'?HERO_MOVES:VILLAIN_MOVES).find(m=>m.key===ctx.move);
    if(op==='replace'){fr=await filesToFrames(files,refHeightOf(ctx));}
    else if(op==='add'){fr=fr.concat(await filesToFrames(files,refHeightOf(ctx)));}
    else if(op==='left'&&i>0){[fr[i-1],fr[i]]=[fr[i],fr[i-1]];}
    else if(op==='right'&&i<fr.length-1){[fr[i+1],fr[i]]=[fr[i],fr[i+1]];}
    else if(op==='dup'){fr.splice(i+1,0,fr[i]);}
    else if(op==='del'){fr.splice(i,1);}
    else if(op==='adjust'){if(!fr.length){adminMsg('Sem quadros pra ajustar.');return;}fr=resampleFrames(fr,meta.ideal);}
    else if(op==='clear'){fr=[];}
    if(commitFrames(ctx,fr)){adminMsg(meta.label+': '+(getFrames(ctx).length)+' quadro(s).');rerender(ctx);}
  }
  function badge(meta,n){
    if(!n)return meta.fb?'<span class="fbadge fb">vazio · usa '+meta.fb+'</span>':'<span class="fbadge falta">vazio</span>';
    if(n===meta.ideal)return '<span class="fbadge ok">'+n+'/'+meta.ideal+' ✓</span>';
    return '<span class="fbadge '+(n<meta.ideal?'falta':'sobra')+'">'+n+'/'+meta.ideal+(n<meta.ideal?' faltam '+(meta.ideal-n):' sobram '+(n-meta.ideal))+'</span>';}
  function moveRowHTML(ctx,meta){
    const fr=getFrames(ctx),tag=ctx.kind+'|'+ctx.id+'|'+meta.key;
    const thumbs=fr.length?fr.map((f,i)=>'<div class="frm"><span class="n">'+(i+1)+'</span><img src="'+f.src+'">'+
      '<div class="ops"><button data-op="left" data-i="'+i+'" title="mover pra esquerda">◀</button><button data-op="dup" data-i="'+i+'" title="duplicar">⧉</button>'+
      '<button data-op="right" data-i="'+i+'" title="mover pra direita">▶</button><button class="del" data-op="del" data-i="'+i+'" title="apagar">✕</button></div></div>').join('')
      :'<span style="opacity:.55;font-size:13px">sem quadro</span>';
    const fpsIn=meta.fps?'<label style="font-size:11px">FPS <input class="fps" type="text" value="'+((CFG.FPS&&CFG.FPS[meta.fps])||'')+'" data-fps="'+meta.fps+'"></label>':
      '<span style="font-size:11px;opacity:.7">'+meta.dur+'s</span>';
    return '<div class="moveRow" data-ctx="'+tag+'"><div class="moveLbl">'+meta.label+badge(meta,fr.length)+'</div>'+
      '<canvas class="fprev" width="64" height="64"></canvas>'+
      '<div class="moveThumbs">'+thumbs+'</div>'+
      '<div class="fbtns"><label class="up">TROCAR<input type="file" accept="image/*" multiple data-op="replace"></label>'+
      '<label class="up">+ ADICIONAR<input type="file" accept="image/*" multiple data-op="add"></label>'+
      '<button class="adj" data-op="adjust">AJUSTAR P/ '+meta.ideal+'</button>'+
      (meta.min===0&&fr.length?'<button class="clr" data-op="clear">LIMPAR</button>':'')+fpsIn+'</div></div>';}
  function wireRows(box){
    box.querySelectorAll('.moveRow[data-ctx]').forEach(row=>{
      const [kind,id,move]=row.dataset.ctx.split('|');const ctx={kind,id:kind==='hero'?id:+id,move};
      row.querySelectorAll('button[data-op]').forEach(b=>b.addEventListener('click',()=>frameOp(ctx,b.dataset.op,+b.dataset.i)));
      row.querySelectorAll('input[type=file][data-op]').forEach(inp=>inp.addEventListener('change',e=>{
        if(e.target.files.length)frameOp(ctx,e.target.dataset.op,0,e.target.files);}));
      const fi=row.querySelector('input[data-fps]');
      if(fi)fi.addEventListener('change',e=>{const v=+e.target.value;if(v>0){CFG.FPS=CFG.FPS||{};CFG.FPS[e.target.dataset.fps]=v;adminMsg('FPS '+e.target.dataset.fps+' = '+v);}});
      startPreview(row.querySelector('canvas.fprev'),ctx);
    });}
  // previa animada no ritmo real do golpe (FPS do loop ou quadros distribuidos na duracao)
  const previews=new Set();
  function startPreview(cv,ctx){
    if(!cv)return;const meta=(ctx.kind==='hero'?HERO_MOVES:VILLAIN_MOVES).find(m=>m.key===ctx.move);
    const fr=getFrames(ctx);const imgs=fr.map(f=>{const im=new Image();im.src=f.src;return im;});
    const c2=cv.getContext('2d');const t0=performance.now();
    const st={cv,alive:true};previews.add(st);
    (function tick(){
      if(!st.alive||!document.body.contains(cv)){previews.delete(st);return;}
      c2.clearRect(0,0,64,64);
      if(imgs.length){
        const t=(performance.now()-t0)/1000;
        const fps=meta.fps?((CFG.FPS&&CFG.FPS[meta.fps])||8):imgs.length/(meta.dur||0.5);
        const cycle=meta.fps?imgs.length/fps:(meta.dur||0.5)+0.35; // golpe: toca e pausa
        const tt=t%cycle,idx=Math.min(imgs.length-1,Math.floor(tt*fps));
        const im=imgs[idx];if(im.complete&&im.naturalWidth){const r=Math.min(60/im.naturalWidth,60/im.naturalHeight);
          c2.drawImage(im,32-im.naturalWidth*r/2,62-im.naturalHeight*r,im.naturalWidth*r,im.naturalHeight*r);}
        c2.fillStyle='#ffe36a';c2.font='9px monospace';c2.fillText((idx+1)+'/'+imgs.length,2,10);
      }else{c2.fillStyle='#666';c2.font='10px monospace';c2.fillText(meta.fb?'usa '+meta.fb:'vazio',6,34);}
      requestAnimationFrame(tick);})();}
  function renderHeroDetail(heroKeyId){
    const box=document.getElementById('detail_'+heroKeyId);if(!box)return;
    box.innerHTML='<div style="font-size:12px;opacity:.75;margin:4px 0 8px">Quadros em ordem de nome do arquivo (1.png, 2.png…). Badge verde = quantidade ideal pro movimento.</div>'+
      HERO_MOVES.map(m=>moveRowHTML({kind:'hero',id:heroKeyId,move:m.key},m)).join('');
    wireRows(box);}
  function renderPhaseDetail(idx){
    const box=document.getElementById('detail_ph'+idx);if(!box)return;
    const ph=P.phases[idx];
    let html=VILLAIN_MOVES.map(m=>moveRowHTML({kind:'ph',id:idx,move:m.key},m)).join('');
    html+='<div class="moveRow"><div class="moveLbl">Retrato (menu)</div><div class="moveThumbs">'+
      '<img src="'+(ph.port||'')+'" style="width:40px;height:40px;object-fit:contain;background:#000;border-radius:4px"></div>'+
      '<label class="up">TROCAR<input type="file" accept="image/*" data-ph="'+idx+'" data-single="port"></label></div>';
    box.innerHTML=html;wireRows(box);
    box.querySelectorAll('input[data-single]').forEach(inp=>{
      inp.addEventListener('change', e=>{
        if(e.target.files[0]) setVillainSingle(+e.target.dataset.ph, e.target.dataset.single, e.target.files[0]);
      });
    });
  }
  async function setVillainSingle(idx, field, file){
    if(!file) return;
    const src = await fileToDataURL(file);
    const ph = P.phases[idx];
    if(field==='bg'){ ph.bg=src; IMG.phases[idx].bg=mkImg(src); } // fundo novo do Admin: carrega na hora
    else if(field==='port'){ ph.port=src; IMG.phases[idx].port=mkAny(src, ph.tint||null); }
    adminMsg(ph.name+': '+field+' atualizado.');
    renderPhaseDetail(idx);
  }

  async function swapPhaseBg(idx, file){
    const src = await fileToDataURL(file);
    P.phases[idx].bg = src;
    IMG.phases[idx].bg = mkImg(src);
    adminMsg('Cenário de '+P.phases[idx].name+' trocado.');
  }

  function renderAdminChars(){
    const box = document.getElementById('adminChars'); box.innerHTML='';
    [['mc','CABEÇA DE ABACAXI (herói)'],['nico','NICO (herói)']].forEach(([key,label])=>{
      const wrap=document.createElement('div');
      const thumb = (IMG[key==='mc'?'mc':'nico'].idle&&IMG[key==='mc'?'mc':'nico'].idle[0])?IMG[key==='mc'?'mc':'nico'].idle[0].img.src:'';
      wrap.innerHTML =
        '<div class="adminRow"><img src="'+thumb+'"><b style="width:220px;display:inline-block">'+label+'</b>'+
        '<button class="expandBtn" data-t="'+key+'">▼ EDITAR GOLPES</button></div>'+
        '<div class="detailBox" id="detail_'+key+'" style="display:none"></div>';
      box.appendChild(wrap);
    });
    box.querySelectorAll('.expandBtn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id='detail_'+btn.dataset.t; const el=document.getElementById(id);
        const show = el.style.display==='none';
        el.style.display = show?'block':'none';
        btn.textContent = show?'▲ FECHAR':'▼ EDITAR GOLPES';
        if(show) renderHeroDetail(btn.dataset.t);
      });
    });
  }

  function renderAdminPhases(){
    const box = document.getElementById('adminPhases'); box.innerHTML='';
    P.phases.forEach((ph,idx)=>{
      const wrap=document.createElement('div');
      const thumb = (IMG.phases[idx].idle&&IMG.phases[idx].idle[0])?IMG.phases[idx].idle[0].img.src:'';
      const isBoss = ['JAY','MAZAROPE','MÃO DE PEDRA'].includes(ph.name);
      wrap.innerHTML =
        '<div class="adminRow">'+
        '<img src="'+thumb+'">'+
        '<input type="text" class="fName" value="'+ph.name.replace(/"/g,'&quot;')+'" style="width:150px">'+
        '<input type="text" class="fCen" value="'+ph.cenario.replace(/"/g,'&quot;')+'" style="width:200px">'+
        '<label class="up">FUNDO<input type="file" accept="image/*" class="fBg"></label>'+
        (isBoss?'<span style="color:#ff8a65;font-size:12px">⚠ chefe</span>':'')+
        '<button class="expandBtn" data-i="'+idx+'">▼ EDITAR GOLPES</button>'+
        '</div><div class="detailBox" id="detail_ph'+idx+'" style="display:none"></div>';
      wrap.querySelector('.fName').addEventListener('change', e=>{ ph.name=e.target.value||ph.name; adminMsg('Nome atualizado.'); });
      wrap.querySelector('.fCen').addEventListener('change', e=>{ ph.cenario=e.target.value||ph.cenario; adminMsg('Cenário atualizado.'); });
      wrap.querySelector('.fBg').addEventListener('change', e=>{ if(e.target.files[0]) swapPhaseBg(idx, e.target.files[0]); });
      const expandBtn = wrap.querySelector('.expandBtn');
      expandBtn.addEventListener('click', ()=>{
        const el = wrap.querySelector('#detail_ph'+idx);
        const show = el.style.display==='none';
        el.style.display = show?'block':'none';
        expandBtn.textContent = show?'▲ FECHAR':'▼ EDITAR GOLPES';
        if(show) renderPhaseDetail(idx);
      });
      box.appendChild(wrap);
    });
  }

  async function addNewPhase(){
    const name=(document.getElementById('newName').value||'').trim().toUpperCase();
    const cenario=(document.getElementById('newCenario').value||'').trim().toUpperCase();
    const idleFile=document.getElementById('newIdle').files[0];
    const bgFile=document.getElementById('newBg').files[0];
    if(!name||!cenario||!idleFile||!bgFile){ adminMsg('Preencha nome, cenário e as 2 imagens.'); return; }
    if(P.phases.some(p=>p.name===name)){ adminMsg('Já existe um vilão com esse nome.'); return; }
    const idleSrc = await fileToDataURL(idleFile);
    const frame = await resizeToHeight(idleSrc, STD_HEIGHT);
    const bgSrc = await fileToDataURL(bgFile);
    const template = P.phases[0];
    const ph = {
      name, cenario, accent:'#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0'),
      hp:110, bandTop:template.bandTop, bandBottom:template.bandBottom,
      bg:bgSrc, idle:frame, guard:frame, attack:frame, attack2:frame, port:frame.src,
      idleA:[frame], sizeMul:0.6
    };
    P.phases.push(ph);
    const t=null;
    IMG.phases.push({bg:mkImg(ph.bg), port:mkAny(ph.port,t),
      idle:fset(ph.idle,t), guard:fset(ph.guard,t), attack:fset(ph.attack,t), attack2:fset(ph.attack2,t),
      taunt:fset(ph.idle,t), idleA:fsA(ph.idleA,t), walkA:null,socoA:null,chuteA:null,puloA:null,danoA:null,victoryA:null,
      name:ph.name,cenario:ph.cenario,accent:ph.accent,hp:ph.hp,grant:null,grantName:null,sizeMul:ph.sizeMul||1});
    document.getElementById('newName').value=''; document.getElementById('newCenario').value='';
    document.getElementById('newIdle').value=''; document.getElementById('newBg').value='';
    adminMsg('Vilão '+name+' criado! ('+P.phases.length+' fases agora)');
    renderAdminPhases();
    const idxNovo = P.phases.length-1;
    const box = document.getElementById('adminPhases');
    const rowNovo = box.children[idxNovo];
    const detailNovo = rowNovo.querySelector('.detailBox');
    const btnNovo = rowNovo.querySelector('.expandBtn');
    detailNovo.style.display='block'; btnNovo.textContent='▲ FECHAR';
    renderPhaseDetail(idxNovo);
    rowNovo.scrollIntoView({behavior:'smooth',block:'start'});
  }

  // SALVAR ADM: baixa um js/dados.js novo com tudo que foi editado no Admin.
  // Substitua o arquivo js/dados.js da pasta do jogo por ele.
  // Imagens/musicas novas enviadas pelo Admin vao embutidas no proprio dados.js.
  function gerarDadosJs(semAdmin){
    const J=o=>JSON.stringify(o);
    const aj={};['abacaxi','nico'].forEach(k=>{aj[k]={};['dmgSoco','dmgChute','dmgAr','sizeMul'].forEach(f=>{if(HEROES[k][f]!=null)aj[k][f]=HEROES[k][f];});});
    return "// MC SUPREMO · DADOS DO JOGO (gerado pelo Admin em "+new Date().toLocaleString('pt-BR')+")\n"+
      "// Substitua js/dados.js por este arquivo.\n"+
      "const MUSICAS="+JSON.stringify(typeof MUSICAS!=="undefined"?MUSICAS:{},null,1)+";\n"+
      "const SEM_ADMIN="+(semAdmin?"true":"false")+";\n"+
      "const HEROES_AJUSTE="+J(aj)+";\n"+
      "const P = "+J(P)+";\n\n"+
      "const NICO="+J(NICO)+";\n\n"+
      "let PROP_CFG="+J(PROP_CFG)+";\nlet KEY_MAP="+J(KEY_MAP)+";\nlet CFG="+J(CFG)+";\n"+
      "let POWER_SEQ="+J(POWER_SEQ)+";\nlet MANOBRA_SEQ="+J(MANOBRA_SEQ)+";\nlet BOSS_SEQ="+J(BOSS_SEQ)+";\n";}
  function downloadUpdated(clean){
    try{
      const txt=gerarDadosJs(clean);
      const blob=new Blob([txt],{type:'text/javascript'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');a.href=url;a.download='dados.js';document.body.appendChild(a);a.click();
      setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},1000);
      adminMsg(clean?'dados.js SEM ADMIN baixado: troque o js/dados.js da versão publicada.':'dados.js baixado: troque o arquivo js/dados.js da pasta do jogo.');
    }catch(e){adminMsg('Erro ao gerar dados.js: '+e.message);console.error(e);}
  }

  document.getElementById('adminBtn').addEventListener('click', ()=>{
    document.getElementById('adminPanel').classList.add('show');
    renderAdminChars(); renderAdminPhases(); renderAdminMusic(); renderAdminCombos();
    renderKeyMap(); renderAdminDamage();
    document.getElementById('unoScale').value=PROP_CFG.unoScale;
    document.getElementById('unoGap').value=PROP_CFG.unoGap;
    document.getElementById('copoScale').value=PROP_CFG.copoScale;
    document.getElementById('copoGap').value=PROP_CFG.copoGap;
    document.getElementById('gapRand').value=PROP_CFG.gapRand;
  });
  document.getElementById('stdSizeBtn').addEventListener('click', standardizeSizes);
  {const kb=document.getElementById('keyApplyBtn'); if(kb) kb.addEventListener('click', applyKeyMap);}
  document.getElementById('adminPersistBtn').addEventListener('click', persistEdits);
  document.getElementById('adminPersistBtn2').addEventListener('click', ()=>{ document.getElementById('adminPanel').classList.remove('show'); toHub(); });
  document.getElementById('adminSaveFullBtn2').addEventListener('click', ()=>downloadUpdated(false));
  document.getElementById('adminSaveBtn2').addEventListener('click', ()=>downloadUpdated(true));
  loadPersistedEdits();
  document.getElementById('propApplyBtn').addEventListener('click', applyPropCfg);
  // adminCloseBtn removido - fechar esta na barra do topo do painel
  document.getElementById('newAddBtn').addEventListener('click', addNewPhase);
  document.getElementById('adminSaveBtn').addEventListener('click', ()=>downloadUpdated(true));
  document.getElementById('adminSaveFullBtn').addEventListener('click', ()=>downloadUpdated(false));
  document.getElementById('adminPlayBtn').addEventListener('click', ()=>{
    document.getElementById('adminPanel').classList.remove('show');
    // garante que a fase/hub relêem os valores recem-editados (P.phases, KEY_MAP, POWER_SEQ etc.)
    toHub();
    adminMsg('Valores aplicados - jogue pra testar!');
  });
})();
/* ===== BOSS TOUCH MOBILE (módulo embutido - fica dentro deste MESMO <script>
   pra sobreviver ao botão de salvar/gerar versão, que captura o HTML logo no
   início da página e só preserva o que já está dentro deste bloco) ===== */
/* ============================================================================
   BOSS TOUCH MOBILE — MC SUPREMO (Nicosheik Labs)
   ----------------------------------------------------------------------------
   Módulo independente para adaptar a mecânica de Boss (QTE de botões,
   combo de 5 hits, esquiva do contra-ataque e tela de vitória com
   compartilhamento) para telas touch, reaproveitando o HUD virtual que
   já existe no seu jogo:

     - Botões:      .tb.b-punch  .tb.b-kick  .tb.b-shoot   (têm data-k="punch|kick|shoot")
     - Manche:      #manche (ou seletor equivalente do seu joystick)
     - Objeto de input global: `press` (press.punch / press.kick / press.skate / press.shoot)

   Este módulo já vem embutido dentro do mesmo <script> único do jogo (logo
   depois do painel admin) e já está conectado nos pontos reais abaixo — não
   precisa colar em lugar nenhum. Resumo de onde cada gancho foi plugado:
     1. (já feito) Ligado dentro do script principal do jogo, depois do `press`.
     2. Quando o chefe for atacar (estado "windup" ou início da sequência
        de fogo/disco), chama:
             BossTouch.startSequence(['punch','kick','punch'], {
               onSuccess: () => { }, // abre a brecha do chefe aqui
               onFail:    () => { }  // aplica o ataque normal do chefe aqui
             });
     3. Quando o chefe entrar em "recuperando" (vulnT > 0), chame:
             BossTouch.startHitCounter(5, {
               onComplete: () => { }, // dá o dano extra / toca a animação de nocaute aqui
               onTimeout:  () => { BossTouch.showDodgeWarning(1.2); }
             });
     4. Quando o chefe soltar o contra-ataque, chame:
             BossTouch.showDodgeWarning(0.9, {
               onDodge: () => AU.jumpSfx(),
               onHit:   () => damageEnemyPlayer(...) // sua função de dano no player
             });
     5. Quando o player vencer a fase, chame:
             BossTouch.showVictoryScreen({
               bossName: "Cabeça de Abacaxi",
               phase: 1,
               gameName: "MC SUPREMO",
               url: "https://seusite.com/jogo"
             });

   ----------------------------------------------------------------------------
   MODO PC / EDITÁVEL — o módulo detecta touch automaticamente, mas nada é
   travado só no celular:

     - BossTouch.setInputMode('keyboard' | 'touch')  → força o modo manualmente
       (fica salvo em localStorage, então persiste entre sessões/testes)
     - BossTouch.getInputMode() / BossTouch.isTouchMode()
     - BossTouch.configureKeys({ punch:'z', kick:'c', shoot:'v', skate:'x' })
       → redefine as teclas usadas no modo PC para os QTEs/contador/esquiva
     - BossTouch.syncWithGameKeyMap()
       → se o seu jogo já expõe `window.KEY_MAP` (como no seu debug de teclas),
         chame isso 1x após configurar o KEY_MAP para os dois ficarem em sincronia
     - BossTouch.mountModeToggle()
       → cria um botãozinho discreto no canto inferior direito pra trocar
         entre TOUCH/TECLADO na hora, útil pra testar no PC sem F12/DevTools

   No modo PC, o QTE mostra as teclas certas na tela (em vez de piscar botão),
   o contador de 5 hits aceita as teclas de soco/chute, e a esquiva aceita
   setas de movimento ou a tecla de skate — tudo continua 100% jogável e
   configurável no desktop.
============================================================================ */

(function (global) {
  'use strict';

  const SEL = {
    punch: '.tb.b-punch',
    kick:  '.tb.b-kick',
    shoot: '.tb.b-shoot',
  };

  const COLORS = {
    punch: '#3ea8ff', // azul
    kick:  '#ff4d4d', // vermelho
    shoot: '#ffd23e', // amarelo
  };

  // Detecta automaticamente touch, mas pode ser forçado via config/localStorage
  // (ver BossTouch.setInputMode abaixo) — assim dá pra testar/ajustar o modo
  // touch mesmo jogando no PC, ou forçar teclado num tablet, etc.
  let inputMode = 'touch'; // MC SUPREMO: 100% touch, sem modo teclado

  function setInputMode(mode) {
    if (mode !== 'touch' && mode !== 'keyboard') return;
    inputMode = mode;
    localStorage.setItem('btq_input_mode', mode);
  }
  function getInputMode() { return inputMode; }
  function isTouchMode() { return inputMode === 'touch'; }

  // Mapa de teclas usado no modo PC. Por padrão espelha o KEY_MAP do seu
  // jogo (z=soco, c=chute, v=tiro, x=skate/esquiva), mas pode ser
  // sobrescrito com BossTouch.configureKeys({...}) — inclusive lendo o
  // KEY_MAP que o jogo já deixa configurável na tela de debug.
  let keyMap = { punch: 'z', kick: 'c', shoot: 'v', skate: 'x' };
  function configureKeys(map) {
    keyMap = Object.assign({}, keyMap, map || {});
  }
  // Se o jogo principal expõe seu próprio KEY_MAP global, sincroniza com ele
  function syncWithGameKeyMap() {
    if (global.KEY_MAP) {
      configureKeys({
        punch: global.KEY_MAP.punch,
        kick: global.KEY_MAP.kick,
        shoot: global.KEY_MAP.shoot,
        skate: global.KEY_MAP.skate,
      });
    }
  }

  function el(sel) { return document.querySelector(sel); }
  function keyLabel(k) { return (keyMap[k] || k).toUpperCase(); }

  function ensureStyles() {
    if (document.getElementById('boss-touch-style')) return;
    const css = `
    .btq-blink{
      animation: btqPulse .5s ease-in-out infinite alternate;
      box-shadow: 0 0 18px 6px var(--btq-color, #fff) !important;
      filter: brightness(1.35);
      z-index: 50;
    }
    @keyframes btqPulse{
      from{ transform: scale(1); }
      to{ transform: scale(1.12); }
    }
    #btqHitCounter{
      position:fixed; left:50%; top: 92px; /* logo abaixo da barra de vida do chefe */
      transform: translateX(-50%);
      font-family:"Press Start 2P", monospace;
      font-size: 34px; color:#ffe36a; text-shadow: 3px 3px 0 #000, 0 0 12px rgba(255,227,106,.8);
      z-index: 60; pointer-events:none; letter-spacing:2px;
      transition: transform .08s ease-out;
    }
    #btqHitCounter.hit{ transform: translateX(-50%) scale(1.25); }
    #btqDodgeWarning{
      position:fixed; left:50%; top:50%; transform:translate(-50%,-50%);
      z-index: 70; text-align:center; pointer-events:none;
      font-family:"Press Start 2P", monospace;
    }
    #btqDodgeWarning .icon{
      font-size:64px; animation: btqDodgeBlink .28s steps(2) infinite;
      filter: drop-shadow(0 0 10px #fff);
    }
    #btqDodgeWarning .label{
      margin-top:8px; font-size:16px; color:#fff; text-shadow:2px 2px 0 #000;
    }
    @keyframes btqDodgeBlink{ from{opacity:1} to{opacity:.25} }
    #btqQteHint{
      position:fixed; left:50%; top: 40%; transform:translate(-50%,-50%);
      z-index:60; text-align:center; pointer-events:none;
      font-family:"Press Start 2P", monospace; color:#fff;
      text-shadow:2px 2px 0 #000;
    }
    #btqQteHint .slots{ display:flex; gap:10px; justify-content:center; margin-top:10px; }
    #btqQteHint .slot{
      width:26px; height:26px; border-radius:50%; border:3px solid #fff;
      background: rgba(0,0,0,.4);
    }
    #btqQteHint .slot.done{ background: var(--btq-color,#fff); }
    #btqModeToggle{
      position:fixed; right:10px; bottom:10px; z-index:80;
      font-family:"Press Start 2P", monospace; font-size:9px; padding:8px 10px;
      background:rgba(0,0,0,.55); color:#fff; border:1px solid #fff5; border-radius:8px;
      cursor:pointer; opacity:.7;
    }
    #btqModeToggle:hover{ opacity:1; }
    #btqVictoryOverlay{
      position:fixed; inset:0; z-index:999; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:18px;
      background: radial-gradient(120% 90% at 50% 0%, #2a1f33, #0b0b11 70%);
      color:#f4e7c9; font-family:"VT323","Courier New",monospace; text-align:center;
      padding: 20px; padding-top:max(20px, env(safe-area-inset-top));
      padding-bottom:max(20px, env(safe-area-inset-bottom));
    }
    #btqVictoryOverlay h1{
      font-family:"Press Start 2P", monospace; color:#ffcf33; font-size:22px;
      text-shadow:3px 3px 0 #000; margin:0;
    }
    #btqVictoryOverlay p{ font-size:26px; margin:0; max-width: 320px; }
    #btqVictoryOverlay .btnRow{ display:flex; flex-direction:column; gap:12px; width:100%; max-width:320px; }
    #btqVictoryOverlay button{
      font-family:"Press Start 2P", monospace; font-size:13px; padding:14px 10px;
      border-radius:12px; border:none; cursor:pointer;
    }
    #btqShareBtn{ background:#25D366; color:#fff; }
    #btqCloseBtn{ background:#444; color:#fff; }
    `;
    const style = document.createElement('style');
    style.id = 'boss-touch-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* -------------------------------------------------------------------- */
  /* 1) SEQUÊNCIA DE BOTÕES (QTE) — pisca nos botões virtuais reais       */
  /* -------------------------------------------------------------------- */
  let activeSeq = null;

  function startSequence(sequence, opts) {
    ensureStyles();
    cancelSequence();

    opts = opts || {};
    const timeoutMs = opts.timeout || 2600;
    let step = 0;
    const touch = isTouchMode();

    // Cria o painel de dicas. No touch mostra bolinhas; no PC mostra as
    // teclas correspondentes (ex.: Z, C), já que não há botão pra piscar.
    const hint = document.createElement('div');
    hint.id = 'btqQteHint';
    hint.innerHTML =
      `<div>QUEBRE A DEFESA!</div><div class="slots">${sequence
        .map((k) => touch ? '<div class="slot"></div>' : `<div class="slot" style="border-radius:6px;width:auto;min-width:26px;display:flex;align-items:center;justify-content:center;font-size:12px;padding:0 4px;">${keyLabel(k)}</div>`)
        .join('')}</div>`;
    document.body.appendChild(hint);
    const slots = hint.querySelectorAll('.slot');

    function highlightCurrent() {
      // limpa piscas anteriores (só existem no modo touch)
      Object.values(SEL).forEach((sel) => {
        const b = el(sel);
        if (b) { b.classList.remove('btq-blink'); b.style.removeProperty('--btq-color'); }
      });
      if (step >= sequence.length) return;
      const key = sequence[step];
      if (touch) {
        const btn = el(SEL[key]);
        if (btn) {
          btn.style.setProperty('--btq-color', COLORS[key]);
          btn.classList.add('btq-blink');
        }
      } else {
        // realça a tecla atual na dica de texto
        slots.forEach((s, i) => s.style.outline = i === step ? '3px solid #ffe36a' : 'none');
      }
    }

    function registerHit(key) {
      if (!activeSeq) return;
      if (key !== sequence[step]) {
        fail();
        return;
      }
      slots[step].classList.add('done');
      slots[step].style.background = COLORS[key];
      slots[step].style.color = '#000';
      step++;
      if (step >= sequence.length) {
        succeed();
      } else {
        highlightCurrent();
      }
    }

    const touchListeners = {};
    let keydownListener = null;

    if (touch) {
      Object.keys(SEL).forEach((key) => {
        const btn = el(SEL[key]);
        if (!btn) return;
        const fn = (e) => { e.preventDefault(); registerHit(key); };
        touchListeners[key] = fn;
        btn.addEventListener('touchstart', fn, { passive: false });
      });
    } else {
      keydownListener = (e) => {
        if (!activeSeq || e.repeat) return;
        const k = e.key.toLowerCase();
        const matched = Object.keys(keyMap).find((name) => keyMap[name] === k);
        if (matched) registerHit(matched);
      };
      window.addEventListener('keydown', keydownListener);
    }

    const timer = setTimeout(fail, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      Object.keys(touchListeners).forEach((key) => {
        const btn = el(SEL[key]);
        if (btn) btn.removeEventListener('touchstart', touchListeners[key]);
      });
      if (keydownListener) window.removeEventListener('keydown', keydownListener);
      Object.values(SEL).forEach((sel) => {
        const b = el(sel);
        if (b) { b.classList.remove('btq-blink'); b.style.removeProperty('--btq-color'); }
      });
      hint.remove();
      activeSeq = null;
    }

    function succeed() {
      cleanup();
      if (opts.onSuccess) opts.onSuccess();
    }
    function fail() {
      cleanup();
      if (opts.onFail) opts.onFail();
    }

    activeSeq = { cleanup, fail };
    highlightCurrent();
  }

  function cancelSequence() {
    if (activeSeq) activeSeq.cleanup();
  }

  /* -------------------------------------------------------------------- */
  /* 2) CONTADOR DE 5 HITS — grande, logo abaixo da vida do chefe         */
  /* -------------------------------------------------------------------- */
  let hitState = null;

  function startHitCounter(target, opts) {
    ensureStyles();
    stopHitCounter();
    opts = opts || {};
    target = target || 5;
    const touch = isTouchMode();

    const counterEl = document.createElement('div');
    counterEl.id = 'btqHitCounter';
    counterEl.textContent = `0/${target} HITS`;
    document.body.appendChild(counterEl);

    let count = 0;
    const timeoutMs = opts.timeout || 2500;
    const timer = setTimeout(() => finish(false), timeoutMs);

    function bump() {
      count++;
      counterEl.textContent = `${count}/${target} HITS`;
      counterEl.classList.remove('hit');
      // força reflow p/ reiniciar animação
      void counterEl.offsetWidth;
      counterEl.classList.add('hit');
      if (count >= target) finish(true);
    }

    const punchBtn = el(SEL.punch);
    const kickBtn = el(SEL.kick);
    const onAttackTouch = () => bump();
    let keydownListener = null;

    if (touch) {
      // Metralhar tocando soco ou chute na HUD
      if (punchBtn) punchBtn.addEventListener('touchstart', onAttackTouch, { passive: true });
      if (kickBtn) kickBtn.addEventListener('touchstart', onAttackTouch, { passive: true });
    } else {
      // Metralhar apertando as teclas de soco/chute (sem repeat do SO)
      keydownListener = (e) => {
        if (e.repeat) return;
        const k = e.key.toLowerCase();
        if (k === keyMap.punch || k === keyMap.kick) bump();
      };
      window.addEventListener('keydown', keydownListener);
    }

    function cleanup() {
      clearTimeout(timer);
      if (punchBtn) punchBtn.removeEventListener('touchstart', onAttackTouch);
      if (kickBtn) kickBtn.removeEventListener('touchstart', onAttackTouch);
      if (keydownListener) window.removeEventListener('keydown', keydownListener);
      counterEl.remove();
      hitState = null;
    }

    function finish(success) {
      cleanup();
      if (success && opts.onComplete) opts.onComplete(count);
      if (!success && opts.onTimeout) opts.onTimeout(count);
    }

    hitState = { cleanup };
  }

  function stopHitCounter() {
    if (hitState) hitState.cleanup();
  }

  /* -------------------------------------------------------------------- */
  /* 3) AVISO DE ESQUIVA — ícone piscando no centro, exige manche/skate   */
  /* -------------------------------------------------------------------- */
  let dodgeState = null;

  function showDodgeWarning(windowSec, opts) {
    ensureStyles();
    hideDodgeWarning();
    opts = opts || {};
    windowSec = windowSec || 1.0;
    const touch = isTouchMode();

    const label = touch ? 'ESQUIVE! (manche ou skate)' : `ESQUIVE! (setas ou ${keyLabel('skate')})`;
    const box = document.createElement('div');
    box.id = 'btqDodgeWarning';
    box.innerHTML = `<div class="icon">🛹</div><div class="label">${label}</div>`;
    document.body.appendChild(box);

    let dodged = false;
    const timer = setTimeout(() => finish(false), windowSec * 1000);

    function onDodgeInput() {
      if (dodged) return;
      dodged = true;
      finish(true);
    }

    // No touch: mover o manche virtual OU tocar o botão de skate na HUD.
    // Ajuste os seletores abaixo caso seu HUD use outro id/classe.
    const manche = document.getElementById('manche') || document.querySelector('.manche') || document.querySelector('#stick');
    const skateBtn = document.querySelector('.tb.b-skate') || document.getElementById('btnSkate');
    if (touch) {
      if (manche) manche.addEventListener('touchmove', onDodgeInput, { passive: true });
      if (skateBtn) skateBtn.addEventListener('touchstart', onDodgeInput, { passive: true });
    }

    // No PC: qualquer seta de movimento OU a tecla de skate conta como esquiva.
    let keydownListener = null;
    if (!touch) {
      keydownListener = (e) => {
        const k = e.key.toLowerCase();
        const arrow = ['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(k);
        if (arrow || k === keyMap.skate) onDodgeInput();
      };
      window.addEventListener('keydown', keydownListener);
    }

    // Fallback comum aos dois modos: também aceita o `press.skate` global
    // (cobre gestos ou binds alternativos que o próprio jogo já processa)
    let pollId = null;
    if (typeof global.press !== 'undefined') {
      pollId = setInterval(() => {
        if (global.press && global.press.skate) onDodgeInput();
      }, 40);
    }

    function cleanup() {
      clearTimeout(timer);
      if (pollId) clearInterval(pollId);
      if (manche) manche.removeEventListener('touchmove', onDodgeInput);
      if (skateBtn) skateBtn.removeEventListener('touchstart', onDodgeInput);
      if (keydownListener) window.removeEventListener('keydown', keydownListener);
      box.remove();
      dodgeState = null;
    }

    function finish(success) {
      cleanup();
      if (success && opts.onDodge) opts.onDodge();
      if (!success && opts.onHit) opts.onHit();
    }

    dodgeState = { cleanup };
  }

  function hideDodgeWarning() {
    if (dodgeState) dodgeState.cleanup();
  }

  /* -------------------------------------------------------------------- */
  /* 4) TELA DE VITÓRIA + COMPARTILHAMENTO (WhatsApp / Web Share API)     */
  /* -------------------------------------------------------------------- */
  function showVictoryScreen(cfg) {
    ensureStyles();
    cfg = cfg || {};
    const bossName = cfg.bossName || 'o Chefe';
    const phase = cfg.phase != null ? cfg.phase : 1;
    const gameName = cfg.gameName || 'MC SUPREMO';
    const url = cfg.url || location.href;

    const shareText =
      `Consegui derrotar ${bossName} na Fase ${phase} do ${gameName}! ` +
      `Consegue bater meu recorde? ${url}`;

    const overlay = document.createElement('div');
    overlay.id = 'btqVictoryOverlay';
    overlay.innerHTML = `
      <h1>VITÓRIA!</h1>
      <p>Você derrotou<br><b>${bossName}</b></p>
      <div class="btnRow">
        <button id="btqShareBtn">COMPARTILHAR NO WHATSAPP</button>
        <button id="btqCloseBtn">CONTINUAR</button>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btqShareBtn').addEventListener('click', async () => {
      // Tenta a Web Share API nativa primeiro (permite anexar print de tela se disponível)
      if (navigator.share) {
        try {
          await navigator.share({ title: gameName, text: shareText, url });
          return;
        } catch (err) {
          // usuário cancelou ou API falhou — cai no fallback abaixo
        }
      }
      const waUrl = 'https://wa.me/?text=' + encodeURIComponent(shareText);
      window.open(waUrl, '_blank');
    });

    document.getElementById('btqCloseBtn').addEventListener('click', () => {
      overlay.remove();
      if (cfg.onClose) cfg.onClose();
    });
  }

  /* -------------------------------------------------------------------- */
  /* Botão de alternância/config — some ou não conforme sua preferência.  */
  /* Deixa explícito e editável em qualquer plataforma, sem depender só   */
  /* da detecção automática de touch.                                    */
  /* -------------------------------------------------------------------- */
  function mountModeToggle() {
    ensureStyles();
    if (document.getElementById('btqModeToggle')) return;
    // Jogo e majoritariamente mobile: deteccao automatica de touch ja e confiavel.
    // O botao de troca so aparece em desktop (onde pode fazer sentido testar os dois modos);
    // no celular ele so atrapalhava, sobrepondo os botoes de comando (Soco/Chute/Defesa/Poder).
    if (IS_TOUCH) return;
    const btn = document.createElement('div');
    btn.id = 'btqModeToggle';
    const label = () => (isTouchMode() ? 'MODO: TOUCH ⇄' : 'MODO: TECLADO ⇄');
    btn.textContent = label();
    btn.addEventListener('click', () => {
      setInputMode(isTouchMode() ? 'keyboard' : 'touch');
      btn.textContent = label();
    });
    document.body.appendChild(btn);
  }

  /* -------------------------------------------------------------------- */
  global.BossTouch = {
    startSequence,
    cancelSequence,
    startHitCounter,
    stopHitCounter,
    showDodgeWarning,
    hideDodgeWarning,
    showVictoryScreen,
    // Configuração de plataforma (mantém tudo editável para PC também)
    setInputMode,
    getInputMode,
    isTouchMode,
    configureKeys,
    syncWithGameKeyMap,
    mountModeToggle,
  };

  // ---- SELO DE DEBUG (temporário) --------------------------------------
  // Some sozinho depois de 3s. Serve só pra confirmar visualmente que este
  // arquivo carregou e o objeto BossTouch existe. Pode apagar este bloco
  // inteiro quando não precisar mais checar isso.
  function mountDebugBadge() {
    const b = document.createElement('div');
    b.textContent = '✓ boss-touch-mobile.js carregado — modo: ' + getInputMode();
    b.style.cssText = 'position:fixed;top:6px;left:6px;z-index:9999;' +
      'background:#0a0;color:#fff;font:12px monospace;padding:6px 10px;' +
      'border-radius:6px;opacity:.9;pointer-events:none;';
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 3000);
  }
})(window);

window.addEventListener('load', function(){
  if (window.BossTouch) {
    // (modo teclado removido: nada a sincronizar)
  }
});
