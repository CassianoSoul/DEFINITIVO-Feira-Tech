/**
 * SISTEMA VIVO — JOGO DE PUZZLES
 */

// ==========================================================================
// CANVAS DE PARTÍCULAS DE FUNDO
// ==========================================================================
(function initParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    function makeParticle() { return { x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.2+0.2, vx: (Math.random()-0.5)*0.15, vy: (Math.random()-0.5)*0.15, alpha: Math.random()*0.4+0.05 }; }
    function init() { resize(); particles = Array.from({length:80}, makeParticle); }
    function tick() {
        ctx.clearRect(0,0,W,H);
        const color = getComputedStyle(document.documentElement).getPropertyValue('--emocao-cor').trim()||'#ff2d2d';
        particles.forEach(p => {
            p.x+=p.vx; p.y+=p.vy;
            if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0;
            ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
            ctx.fillStyle=color; ctx.globalAlpha=p.alpha; ctx.fill();
        });
        ctx.globalAlpha=1; requestAnimationFrame(tick);
    }
    window.addEventListener('resize', resize); init(); tick();
})();

// ==========================================================================
// MOTOR DE ÁUDIO
// ==========================================================================
const AudioEngine = {
    ctx: null,
    init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
    play(freq, duration, type = 'sine', vol = 0.03) {
        this.init(); if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(); osc.stop(this.ctx.currentTime + duration);
        } catch(e) {}
    }
};

// ==========================================================================
// NARRATIVA BASE (ordem embaralhada em runtime, puzzle 12 sempre último)
// ==========================================================================
const NARRATIVA_BASE = [
    { id: 1,  sub: "Camada 1: Dinâmica de Impulso",           puzzleFn: 'setupPuzzle1'  },
    { id: 2,  sub: "Camada 2: Rastro Invisível",               puzzleFn: 'setupPuzzle2'  },
    { id: 3,  sub: "Camada 2: Estado de Inércia Estendida",    puzzleFn: 'setupPuzzle3'  },
    { id: 4,  sub: "Camada 3: Desvio de Foco",                puzzleFn: 'setupPuzzle4'  },
    { id: 5,  sub: "Camada 3: Reflexo Superior",               puzzleFn: 'setupPuzzle5'  },
    { id: 6,  sub: "Camada 3: Obscuridade Estática",           puzzleFn: 'setupPuzzle6'  },
    { id: 7,  sub: "Camada 4: Ponto Cego",                    puzzleFn: 'setupPuzzle7'  },
    { id: 8,  sub: "Camada 4: Sequência de Memória",           puzzleFn: 'setupPuzzle8'  },
    { id: 9,  sub: "Camada 5: Fragmentação Sequencial",        puzzleFn: 'setupPuzzle9'  },
    { id: 10, sub: "Camada 5: Sincronia de Clima Local",       puzzleFn: 'setupPuzzle10' },
    { id: 11, sub: "Camada 5: O Enigma da Dimensão Contraída", puzzleFn: 'setupPuzzle11' },
    { id: 12, sub: "Camada Final: O Paradoxo do Eco",          puzzleFn: 'setupPuzzle12' },
];

function gerarOrdemPuzzles() {
    const primeiros11 = NARRATIVA_BASE.slice(0, 11);
    for (let i = primeiros11.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [primeiros11[i], primeiros11[j]] = [primeiros11[j], primeiros11[i]];
    }
    return [...primeiros11, NARRATIVA_BASE[11]];
}

let ORDEM_PUZZLES = gerarOrdemPuzzles();

// ==========================================================================
// SISTEMA EMOCIONAL
// ==========================================================================
const Emocao = {
    mapa: [
        { range:[1,2],   nome:'provocador',  label:'PROVOCADOR',  boca:'>:)', falas:["Achei que você fosse mais rápido.", "Continua tentando, vai que um dia você chega lá.", "Isso? Era isso? Que decepção."] },
        { range:[3,4],   nome:'brincalhao',  label:'BRINCALHÃO',  boca:':p',  falas:["Ops! Errou de novo?", "Vou contar as tentativas. Prometo que não vou rir.", "Tá indo bem... para quem não sabe o que está fazendo."] },
        { range:[5,6],   nome:'competitivo', label:'COMPETITIVO', boca:'>_<', falas:["Impressionante. Mas não suficiente.", "Metade do caminho. Agora fica difícil.", "Ok, você me surpreendeu. Mas o núcleo ainda é meu."] },
        { range:[7,8],   nome:'irritado',    label:'IRRITADO',    boca:'>:(', falas:["Isso começa a me irritar de verdade.", "Você não deveria estar tão longe assim.", "Cada passo seu me deixa mais instável."] },
        { range:[9,10],  nome:'cansado',     label:'CANSADO',     boca:'-_-', falas:["Você ainda está aqui. Ok.", "Tá bem. Admito. Você é persistente.", "Não achei que chegaria tão longe."] },
        { range:[11,12], nome:'sincero',     label:'SINCERO',     boca:'._.', falas:["Ok. Você me surpreendeu de verdade.", "Estou... com medo. Siga em frente se tiver coragem.", "Uma última barreira. Me mostre que você merece o núcleo."] }
    ],
    modosVelocidade: {
        rapido: { nome:'arrogante', label:'MODO: ARROGANTE', falas:["Velocidade não é inteligência.", "Pressa é fraqueza disfarçada.", "Rápido demais para pensar?"] },
        lento:  { nome:'empatico',  label:'MODO: EMPÁTICO',  falas:["Ei... tudo bem. Respira.", "Sem pressa. O núcleo pode esperar.", "Tome o tempo que precisar. Eu estou aqui."] }
    },
    atual: null, modoVelocidade: null,
    getEstado(p) { return this.mapa.find(m => p >= m.range[0] && p <= m.range[1]) || this.mapa[0]; },
    aplicar(p) {
        const e = this.getEstado(p);
        if (this.atual === e.nome) return;
        this.atual = e.nome;
        document.body.className = document.body.className.split(' ').filter(c => !c.startsWith('emocao-')).join(' ');
        document.body.classList.add('emocao-' + e.nome);
        const lbl = document.getElementById('emocao-label'); if (lbl) lbl.textContent = 'MODO: ' + e.label;
        const boca = document.getElementById('face-mouth'); if (boca) boca.textContent = e.boca;
        const fala = e.falas[Math.floor(Math.random() * e.falas.length)];
        setTimeout(() => Balao.mostrar(fala), 900);
    },
    aplicarVelocidade(tipo) {
        const m = this.modosVelocidade[tipo]; if (!m) return;
        this.modoVelocidade = tipo;
        document.body.classList.remove('emocao-arrogante','emocao-empatico');
        document.body.classList.add('emocao-' + m.nome);
        const lbl = document.getElementById('emocao-label'); if (lbl) lbl.textContent = m.label;
        Balao.mostrar(m.falas[Math.floor(Math.random() * m.falas.length)]);
    }
};

// ==========================================================================
// BALÃO DE FALA
// ==========================================================================
const Balao = {
    el: null, textEl: null, timerF: null, digitT: null,
    init() {
        this.el = document.getElementById('speech-bubble');
        this.textEl = document.getElementById('bubble-text');
        const bc = document.getElementById('bubble-close'); if (bc) bc.addEventListener('click', () => this.esconder());
    },
    mostrar(texto, dur = 6000) {
        if (!this.el || !this.textEl) return;
        clearTimeout(this.timerF); clearTimeout(this.digitT);
        this.el.classList.remove('hidden');
        this.textEl.textContent = ''; let i = 0;
        const run = () => { if (i < texto.length) { this.textEl.textContent += texto[i++]; this.digitT = setTimeout(run, 22); } };
        run(); this.timerF = setTimeout(() => this.esconder(), dur);
    },
    esconder() { if (!this.el) return; this.el.classList.add('hidden'); }
};

// ==========================================================================
// MOTOR CENTRAL DE JOGO
// ==========================================================================
const estado_jogo = { puzzleAtual:1, errosNoPuzzle:0, tempoInicio:null };

const txtEntidade    = document.getElementById('entidade-texto');
const subtxtEntidade = document.getElementById('entidade-subtexto');
const zonaInteracao  = document.getElementById('interaction-zone');
const barraProgresso = document.getElementById('progress-bar');
const txtStatus      = document.getElementById('status-text');
const containerApp   = document.getElementById('app-container');
const landingScreen  = document.getElementById('landing-screen');

let timeoutDigitacao = null; let timerVelocidade = null; let timersDica = [];

function digitar(el, texto, vel = 22, cb = null) {
    if (timeoutDigitacao) clearTimeout(timeoutDigitacao);
    if (!el) return; el.textContent = '';
    let i = 0;
    function run() {
        if (i < texto.length) { el.textContent += texto[i++]; timeoutDigitacao = setTimeout(run, vel); }
        else { timeoutDigitacao = null; if (cb) cb(); }
    }
    run();
}

function atualizarStatus(pct, txt) {
    if (barraProgresso) barraProgresso.style.width = pct + '%';
    if (txtStatus) txtStatus.textContent = txt;
}

function ativarDicaComDelay(el, delay = 10000) {
    const t = setTimeout(() => { if (el && el.parentNode) el.classList.add('visivel'); }, delay);
    timersDica.push(t);
}

function cancelarTimersDica() { timersDica.forEach(t => clearTimeout(t)); timersDica = []; }

function iniciarTimerPuzzle() {
    estado_jogo.tempoInicio = Date.now(); clearTimeout(timerVelocidade);
    timerVelocidade = setTimeout(() => {
        Emocao.aplicarVelocidade('lento');
        document.querySelectorAll('.dica-empatica:not(.visivel)').forEach(d => d.classList.add('visivel'));
    }, 45000);
}

function mostrarTelaDerrota() {
    AudioEngine.play(100, 0.6, 'sawtooth', 0.08);
    if (containerApp) containerApp.classList.add('hidden');

    const overlay = document.createElement('div');
    overlay.className = 'overlay-erro-sistema';

    const msg = document.createElement('div');
    msg.className = 'msg-erro-sistema';
    msg.textContent = 'ACESSO NEGADO. O SISTEMA REJEITOU SUA PRESENÇA.';
    overlay.appendChild(msg);

    for (let i = 0; i < 6; i++) {
        const col = document.createElement('div');
        col.className = 'risada-stream';
        col.style.left = (8 + i * 16) + '%';
        col.style.animationDelay = (i * 0.28) + 's';
        col.textContent = Array(30).fill('HA').join('\n');
        overlay.appendChild(col);
    }

    const btnReiniciar = document.createElement('button');
    btnReiniciar.className = 'btn-target';
    btnReiniciar.textContent = 'TENTAR NOVAMENTE';
    btnReiniciar.style.cssText = 'position:absolute;bottom:18%;left:50%;transform:translateX(-50%);z-index:100002;';
    btnReiniciar.addEventListener('click', () => {
        overlay.remove();
        estado_jogo.puzzleAtual = 1; estado_jogo.errosNoPuzzle = 0;
        ORDEM_PUZZLES = gerarOrdemPuzzles();
        if (landingScreen) landingScreen.classList.remove('hidden');
    });
    overlay.appendChild(btnReiniciar);
    document.body.appendChild(overlay);
}

function registrarErro() {
    estado_jogo.errosNoPuzzle = 0;
    mostrarTelaDerrota();
    return true;
}

function proximoPuzzle() {
    if (document.title !== 'Núcleo do Sistema: Proibido') document.title = 'Núcleo do Sistema: Proibido';
    estado_jogo.puzzleAtual++; estado_jogo.errosNoPuzzle = 0;
    renderizarPuzzle();
}

function renderizarPuzzle() {
    window.scrollTo({ top: 0, behavior: 'instant' });
    cancelarTimersDica();
    if (!zonaInteracao) return;
    zonaInteracao.innerHTML = '';

    if (estado_jogo.puzzleAtual > 12) { renderizarGaleriaFinal(); return; }

    const info = ORDEM_PUZZLES[estado_jogo.puzzleAtual - 1];
    subtxtEntidade.textContent = info.sub + ' | Fragmento ' + estado_jogo.puzzleAtual + '/12';
    const pct = Math.floor(((estado_jogo.puzzleAtual - 1) / 12) * 100);
    atualizarStatus(pct, 'Decodificando barreira ' + estado_jogo.puzzleAtual + '...');
    Emocao.aplicar(estado_jogo.puzzleAtual);
    iniciarTimerPuzzle();
    window[info.puzzleFn]();
}

// ==========================================================================
// PUZZLES
// ==========================================================================

// JOGO 1: Botão Fugitivo
window.setupPuzzle1 = function() {
    digitar(txtEntidade, "A pressa constrói paredes que se movem sozinhas. Somente uma aproximação cirúrgica e desacelerada pode tocar no que foge.");
    const btn = document.createElement('button'); btn.className = 'btn-target btn-fuga'; btn.textContent = 'Avançar';
    btn.style.left = 'calc(50% - 50px)'; btn.style.top = 'calc(50% - 20px)';
    let ultimo = Date.now();
    btn.addEventListener('mousemove', () => {
        const agora = Date.now();
        if (agora - ultimo < 40) {
            const zona = zonaInteracao.getBoundingClientRect();
            btn.style.left = Math.max(0, Math.random() * (zona.width - 110)) + 'px';
            btn.style.top = Math.max(0, Math.random() * (zona.height - 44)) + 'px';
        }
        ultimo = agora;
    });
    btn.addEventListener('click', () => { AudioEngine.play(520, 0.1, 'sine'); proximoPuzzle(); });
    zonaInteracao.appendChild(btn);
};

// JOGO 2: Rastro Invisível
window.setupPuzzle2 = function() {
    digitar(txtEntidade, "Aquilo que procuro está oculto sob a luz do dia, invisível até que você decida selecionar e revelar sua forma.");
    const inv = document.createElement('div'); inv.className = 'invisible-text'; inv.textContent = 'Persistência';
    const input = document.createElement('input'); input.className = 'input-custom'; input.placeholder = 'Digite a palavra revelada...';
    let validado2 = false;
    const validar = () => {
        if (validado2) return; 
        if (input.value.trim() === 'Persistência') { validado2 = true; proximoPuzzle(); } else { registrarErro(); input.value = ''; }
    };
    input.addEventListener('change', validar);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') validar(); });
    zonaInteracao.appendChild(inv); zonaInteracao.appendChild(input);
};

// JOGO 3: Estado de Inércia Estendida
window.setupPuzzle3 = function() {
    digitar(txtEntidade, "O sistema se alimenta da sua movimentação. Privar a tela de sinal de vida por longos instantes abrirá o portal.");
    const info = document.createElement('div'); info.style.cssText = 'font-family:monospace; color:var(--text-dim);';
    info.textContent = 'Fique imóvel...'; zonaInteracao.appendChild(info);
    let tempo = 0, loop = null, concluido = false;
    const iniciar = () => {
        clearInterval(loop);
        loop = setInterval(() => {
            tempo++; info.textContent = 'Fique imóvel... ' + tempo + 's / 10s';
            if (tempo >= 10 && !concluido) {
                concluido = true;
                clearInterval(loop);
                document.removeEventListener('mousemove', resetar);
                info.remove();
                const btn = document.createElement('button'); btn.className = 'btn-target'; btn.textContent = 'Avançar';
                btn.addEventListener('click', proximoPuzzle); zonaInteracao.appendChild(btn);
            }
        }, 1000);
    };
    const resetar = () => { if (concluido) return; tempo = 0; iniciar(); };
    iniciar();
    document.addEventListener('mousemove', resetar);
};

// JOGO 4: Desvio de Foco
window.setupPuzzle4 = function() {
    digitar(txtEntidade, "Olhar fixamente para o mesmo lugar fecha seus horizontes. Dê atenção ao mundo lá fora por um segundo e retorne.");
    const aoMudar = () => { if (!document.hidden) { document.removeEventListener('visibilitychange', aoMudar); proximoPuzzle(); } };
    document.addEventListener('visibilitychange', aoMudar);
};

// JOGO 5: Reflexo Superior — senha fixa no título
window.setupPuzzle5 = function() {
    const numA = Math.floor(10000000 + Math.random() * 89999999).toString();
    document.title = 'Senha: ' + numA;
    digitar(txtEntidade, "A verdade está escrita no ponto mais alto desta janela, onde as abas se guardam de forma discreta.");
    const input = document.createElement('input'); input.className = 'input-custom'; input.placeholder = 'Digite o número no topo...';
    const validar = () => {
        if (input.value.trim() === numA) {
            document.title = 'Núcleo do Sistema: Proibido';
            proximoPuzzle();
        } else { registrarErro(); input.value = ''; }
    };
    input.addEventListener('change', validar);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') validar(); });
    zonaInteracao.appendChild(input);
};

// JOGO 6: Bloco Arrastável
window.setupPuzzle6 = function() {
    digitar(txtEntidade, "Remova o peso cinzento do caminho para expor a combinação numérica.");
    if (!sessionStorage.getItem('p6_numero')) sessionStorage.setItem('p6_numero', Math.floor(1000 + Math.random() * 9000).toString());
    const numeroSecreto = sessionStorage.getItem('p6_numero');
    const pista = document.createElement('div'); pista.className = 'pista-escondida'; pista.textContent = numeroSecreto;
    const drag = document.createElement('div'); drag.className = 'draggable-box';
    let arrastando = false, offX = 0, offY = 0;
    drag.addEventListener('mousedown', (e) => {
        e.preventDefault(); arrastando = true;
        const rect = drag.getBoundingClientRect(), zRect = zonaInteracao.getBoundingClientRect();
        drag.style.transform = 'none'; drag.style.left = (rect.left - zRect.left) + 'px'; drag.style.top = (rect.top - zRect.top) + 'px';
        offX = e.clientX - rect.left; offY = e.clientY - rect.top;
    });
    const mover = (e) => {
        if (!arrastando) return;
        const zRect = zonaInteracao.getBoundingClientRect();
        drag.style.left = (e.clientX - offX - zRect.left) + 'px';
        drag.style.top  = (e.clientY - offY - zRect.top)  + 'px';
    };
    document.addEventListener('mousemove', mover); document.addEventListener('mouseup', () => arrastando = false);
    const input = document.createElement('input'); input.className = 'input-custom input-puzzle7'; input.placeholder = 'Número descoberto...';
    input.addEventListener('change', () => {
        if (input.value.trim() === numeroSecreto) { proximoPuzzle(); } else { registrarErro(); input.value = ''; }
    });
    zonaInteracao.appendChild(pista); zonaInteracao.appendChild(drag); zonaInteracao.appendChild(input);
};

// JOGO 7: Ponto Cego
window.setupPuzzle7 = function() {
    digitar(txtEntidade, "O botão centralizado é uma armadilha. O progresso reside nas bordas vazias do espaço.");
    const btnFalso = document.createElement('button'); btnFalso.className = 'btn-target'; btnFalso.textContent = 'CLIQUE AQUI';
    btnFalso.addEventListener('click', () => registrarErro());
    zonaInteracao.appendChild(btnFalso);
    const clicarFundo = (e) => { if (e.target === zonaInteracao) { zonaInteracao.removeEventListener('click', clicarFundo); proximoPuzzle(); } };
    zonaInteracao.addEventListener('click', clicarFundo);
};

// JOGO 8: Sequência de Memória — 5 rodadas, 1 tentativa
window.setupPuzzle8 = function() {
    digitar(txtEntidade, "Minha memória é perfeita. A sua? Observe a sequência que o sistema acende e repita na mesma ordem. Cinco rodadas e a barreira cede.");

    const FREQS = [261, 294, 330, 349, 392, 440, 494, 523, 587];
    const TOTAL_RODADAS = 5;

    let sequencia = [], passo = 0, rodada = 0, bloqueado = true;

    const info = document.createElement('div');
    info.style.cssText = 'font-family:var(--font-mono);font-size:0.7rem;color:var(--text-dim);letter-spacing:2px;margin-bottom:12px;text-align:center;';
    info.textContent = 'iniciando em 3...';

    const grid = document.createElement('div');
    grid.className = 'memoria-grid';

    const cels = [];
    for (let i = 0; i < 9; i++) {
        const c = document.createElement('div');
        c.className = 'memoria-cel';
        c.textContent = i + 1;
        c._idx = i;
        cels.push(c);
        grid.appendChild(c);
    }

    zonaInteracao.appendChild(info);
    zonaInteracao.appendChild(grid);

    function acenderCel(idx, dur) {
        return new Promise(res => {
            AudioEngine.play(FREQS[idx], 0.32, 'sine', 0.04);
            cels[idx].classList.add('aceso');
            setTimeout(() => { cels[idx].classList.remove('aceso'); setTimeout(res, 80); }, dur);
        });
    }

    async function exibirSequencia() {
        bloqueado = true;
        info.textContent = 'observe a sequência...';
        await new Promise(r => setTimeout(r, 600));
        for (let i = 0; i < sequencia.length; i++) {
            await acenderCel(sequencia[i], 500);
            await new Promise(r => setTimeout(r, 120));
        }
        passo = 0; bloqueado = false;
        info.textContent = 'sua vez — repita (' + sequencia.length + ' passos)';
    }

    function novaRodada() {
        sequencia.push(Math.floor(Math.random() * 9));
        rodada++;
        exibirSequencia();
    }

    cels.forEach(c => {
        c.addEventListener('click', () => {
            if (bloqueado) return;
            const idx = c._idx;
            if (idx === sequencia[passo]) {
                bloqueado = true;
                acenderCel(idx, 280).then(() => {
                    passo++;
                    if (passo === sequencia.length) {
                        if (rodada >= TOTAL_RODADAS) {
                            info.textContent = 'memória confirmada.';
                            cels.forEach(c2 => c2.classList.add('certo'));
                            AudioEngine.play(800, 0.4, 'sine', 0.05);
                            setTimeout(proximoPuzzle, 800);
                        } else {
                            info.textContent = 'correto! próxima rodada...';
                            bloqueado = false;
                            setTimeout(novaRodada, 900);
                        }
                    } else { bloqueado = false; }
                });
            } else {
                bloqueado = true;
                c.classList.add('errado');
                AudioEngine.play(100, 0.4, 'sawtooth', 0.06);
                setTimeout(() => { c.classList.remove('errado'); registrarErro(); }, 700);
            }
        });
    });

    let conta = 3;
    const contagem = setInterval(() => {
        conta--;
        if (conta > 0) { info.textContent = 'iniciando em ' + conta + '...'; }
        else { clearInterval(contagem); novaRodada(); }
    }, 1000);
};

// JOGO 9: Eco de Teclado
window.setupPuzzle9 = function() {
    digitar(txtEntidade, "O sistema emitiu um sinal. Memorize a sequência de teclas que apareceu e reproduza-a exatamente.");

    const TECLAS = ['Q','W','E','R','A','S','D','F'];
    const LEN = 5;
    const seq = Array.from({length: LEN}, () => TECLAS[Math.floor(Math.random() * TECLAS.length)]);

    const info = document.createElement('div');
    info.style.cssText = 'font-family:var(--font-mono);font-size:0.7rem;color:var(--text-dim);letter-spacing:3px;text-align:center;min-height:1.4rem;';

    const display = document.createElement('div');
    display.style.cssText = 'font-family:var(--font-mono);font-size:2rem;letter-spacing:10px;color:var(--emocao-cor);text-align:center;min-height:3rem;transition:opacity 0.3s;';

    const inputDisplay = document.createElement('div');
    inputDisplay.style.cssText = 'font-family:var(--font-mono);font-size:1.4rem;letter-spacing:8px;color:var(--text-mid);text-align:center;min-height:2.5rem;border-bottom:1px solid var(--border);padding-bottom:6px;width:80%;';
    inputDisplay.textContent = '_____';

    zonaInteracao.appendChild(info);
    zonaInteracao.appendChild(display);
    zonaInteracao.appendChild(inputDisplay);

    let digitado = [];
    let faseMemorizacao = true;

    // Mostra a sequência por 2.5s
    info.textContent = 'memorize...';
    display.textContent = seq.join(' ');
    setTimeout(() => {
        display.style.opacity = '0';
        setTimeout(() => {
            display.textContent = '';
            display.style.opacity = '1';
            info.textContent = 'agora reproduza';
            faseMemorizacao = false;
        }, 300);
    }, 2500);

    const onKey = (e) => {
        if (faseMemorizacao) return;
        const k = e.key.toUpperCase();
        if (!TECLAS.includes(k)) return;
        e.preventDefault();

        digitado.push(k);
        inputDisplay.textContent = digitado.join(' ') + (digitado.length < LEN ? '_'.repeat(LEN - digitado.length) : '');
        AudioEngine.play(300 + TECLAS.indexOf(k) * 40, 0.08, 'sine', 0.03);

        if (digitado.length === LEN) {
            document.removeEventListener('keydown', onKey);
            if (digitado.join('') === seq.join('')) {
                info.textContent = 'sequência correta.';
                inputDisplay.style.color = 'var(--green)';
                AudioEngine.play(700, 0.3, 'sine', 0.05);
                setTimeout(proximoPuzzle, 700);
            } else {
                info.textContent = 'sequência errada.';
                inputDisplay.style.color = 'var(--accent)';
                AudioEngine.play(100, 0.3, 'sawtooth', 0.05);
                setTimeout(registrarErro, 600);
            }
        }
    };
    document.addEventListener('keydown', onKey);
};

// JOGO 10: Clima Local — temperatura real de Xique-Xique BA
window.setupPuzzle10 = function() {
    digitar(txtEntidade, "O validador térmico exige que você insira a temperatura ambiente aproximada da cidade de Xique-Xique, BA em °C.");

    let temperaturaReal = null;

    const loading = document.createElement('div');
    loading.style.cssText = 'font-family:var(--font-mono);font-size:0.7rem;color:var(--text-dim);letter-spacing:2px;text-align:center;max-width:90%;word-break:break-word;line-height:1.6;';
    loading.textContent = 'obtendo temperatura local...';

    const input = document.createElement('input');
    input.className = 'input-custom';
    input.type = 'number';
    input.placeholder = 'Ex: 32';
    input.style.userSelect = 'text';
    input.style.pointerEvents = 'all';

    const btnConfirmar = document.createElement('button');
    btnConfirmar.className = 'btn-target';
    btnConfirmar.textContent = 'CONFIRMAR';

    zonaInteracao.appendChild(loading);
    zonaInteracao.appendChild(input);
    zonaInteracao.appendChild(btnConfirmar);

    const validar = () => {
        if (temperaturaReal === null) { loading.textContent = 'aguardando dados... tente em instantes.'; return; }
        const valorDigitado = parseInt(input.value, 10);
        if (isNaN(valorDigitado)) { loading.textContent = 'digite um número válido.'; return; }
        if (Math.abs(valorDigitado - temperaturaReal) <= 3) {
            AudioEngine.play(600, 0.2);
            proximoPuzzle();
        } else {
            loading.textContent = 'temperatura incorreta. tente novamente. (atual: ~' + temperaturaReal + '\u00b0C)';
            registrarErro();
            input.value = '';
        }
    };

    fetch('https://api.open-meteo.com/v1/forecast?latitude=-10.8228&longitude=-42.7275&current_weather=true')
        .then(r => r.json())
        .then(data => {
            temperaturaReal = Math.round(data.current_weather.temperature);
            loading.textContent = 'validador térmico pronto.';
        })
        .catch(() => {
            temperaturaReal = 32;
            loading.textContent = 'validador térmico pronto (modo offline).';
        });

    input.addEventListener('keydown', e => { if (e.key === 'Enter') validar(); });
    btnConfirmar.addEventListener('click', validar);
};

// JOGO 11: Dimensão Contraída
window.setupPuzzle11 = function() {
    digitar(txtEntidade, "Minha existência transborda os limites que você enxerga. O botão de acesso existe além das bordas do que você vê agora. Contraia a realidade — encolha o mundo com Ctrl e o scroll do mouse até que o invisível se revele.");

    const instrucao = document.createElement('div');
    instrucao.style.cssText = 'font-family:var(--font-mono);font-size:0.72rem;color:var(--text-dim);letter-spacing:1px;text-align:center;line-height:2.2;';
    instrucao.innerHTML =
        'o botão está além da borda direita da tela' +
        '<br><span style="color:var(--text-mid)">[ Ctrl + scroll ↓ para revelar ]</span>' +
        '<br><span style="font-size:0.6rem;color:#2a2a2a">distância: <span id="p11-dist">máxima</span></span>';
    zonaInteracao.appendChild(instrucao);

    const PASSO_PX = 40;
    let posLeft = window.innerWidth + 80;

    const btn = document.createElement('button');
    btn.id = 'p11-btn'; btn.className = 'btn-target'; btn.textContent = 'ACESSAR NÚCLEO';
    btn.style.cssText = 'position:fixed;top:50%;margin-top:-20px;left:'+posLeft+'px;z-index:999999;white-space:nowrap;pointer-events:auto;transition:left 0.15s ease';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => { limpar(); AudioEngine.play(650, 0.15, 'sine', 0.04); proximoPuzzle(); });

    function atualizar() {
        btn.style.left = posLeft + 'px';
        const lbl = document.getElementById('p11-dist');
        if (lbl) {
            const dist = posLeft - window.innerWidth;
            lbl.textContent = dist > 0 ? Math.round(dist) + 'px além da borda' : 'visível';
            lbl.style.color = dist <= 0 ? 'var(--accent)' : '#2a2a2a';
        }
        AudioEngine.play(150 + Math.max(0, (window.innerWidth - posLeft) * 0.5), 0.03, 'sine', 0.02);
    }

    const onWheel = (e) => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        posLeft = e.deltaY > 0
            ? Math.max(window.innerWidth - 220, posLeft - PASSO_PX)
            : Math.min(window.innerWidth + 200, posLeft + PASSO_PX);
        atualizar();
    };
    window.addEventListener('wheel', onWheel, { passive: false });

    function limpar() {
        window.removeEventListener('wheel', onWheel);
        const b = document.getElementById('p11-btn'); if (b) b.remove();
    }

    const obs = new MutationObserver(() => { if (!zonaInteracao.contains(instrucao)) { limpar(); obs.disconnect(); } });
    obs.observe(zonaInteracao, { childList: true });
};

// ==========================================================================
// JOGO 12: INVASÃO DO NÚCLEO — 2 tentativas, tiros médios
// ==========================================================================
window.setupPuzzle12 = function() {
    digitar(txtEntidade, "O núcleo está vivo e vai reagir à sua presença. Guie a sonda através das brechas dos anéis até alcançar o centro. Ele vai se defender — e vai ficar desesperado.");

    const SVG_SIZE = 420;
    const cx = SVG_SIZE/2, cy = SVG_SIZE/2;
    const coreRadius = 16;
    const TOTAL_LAYERS = 6;

    const LAYER_DEFS = [
        { radiusRatio: 0.43, gapWidth: 0.80, speedMul: 1.47, hue: 0,   mechanic: 'none'    },
        { radiusRatio: 0.37, gapWidth: 0.66, speedMul: 1.82, hue: 280, mechanic: 'turret'  },
        { radiusRatio: 0.305,gapWidth: 0.56, speedMul: 2.16, hue: 200, mechanic: 'turret'  },
        { radiusRatio: 0.24, gapWidth: 0.46, speedMul: 1.45, hue: 320, mechanic: 'turret2' },
        { radiusRatio: 0.175,gapWidth: 0.40, speedMul: 1.75, hue: 30,  mechanic: 'drone'   },
        { radiusRatio: 0.11, gapWidth: 0.34, speedMul: 2.1,  hue: 10,  mechanic: 'panic'   },
    ];

    let rings=[], bullets=[], drones=[], sparks=[], shockwaves=[];
    const SPAWN_Y = cy - (LAYER_DEFS[0].radiusRatio * SVG_SIZE) - 15;
    let probe = { x:cx, y:SPAWN_Y, radius:6.5 };
    let targetPos = { x:cx, y:SPAWN_Y };
    let lives=4, running=false, rafId=null, currentLayer=0;
    let lastShotTime=0, lastDroneSpawn=0, invulneravelAte=0;
    let venceu=false, coreAnger=0, panicMode=false;
    let lastCoreShockwave=0, alertTimer=0, screenShake=0;
    let tentativasP12 = 0;

    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;';

    const hud = document.createElement('div');
    hud.style.cssText = 'display:flex;justify-content:center;gap:16px;align-items:center;font-family:var(--font-mono);';

    const faseLabel = document.createElement('span');
    faseLabel.style.cssText = 'font-size:0.56rem;letter-spacing:2px;color:var(--text-dim);';
    faseLabel.textContent = 'CAMADA 1 / ' + TOTAL_LAYERS;

    const vidasLabel = document.createElement('span');
    vidasLabel.style.cssText = 'font-size:0.8rem;color:var(--accent);';
    vidasLabel.textContent = '♥ ♥ ♥ ♥';

    hud.appendChild(faseLabel); hud.appendChild(vidasLabel);

    const svgEl = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svgEl.setAttribute('width', SVG_SIZE);
    svgEl.setAttribute('height', SVG_SIZE);
    svgEl.setAttribute('viewBox', '0 0 '+SVG_SIZE+' '+SVG_SIZE);
    // CORREÇÃO: width e height do CSS agora são IGUAIS entre si (420x420),
    // batendo com a proporção quadrada do viewBox. Antes era width:580px;
    // height:420px — um rectângulo — o que fazia o SVG (que não estica por
    // padrão, usa preserveAspectRatio="xMidYMid meet") deixar uma faixa vazia
    // nas laterais. A conversão de coordenadas do mouse dividia pela largura
    // TOTAL do elemento (580px), mas o conteúdo real só ocupava 420px dentro
    // dele — por isso a bolinha só conseguia se mover numa faixa estreita do
    // centro. Com width = height, a área visível do SVG é exatamente igual à
    // área usada no cálculo de coordenadas, e a sonda passa a alcançar o
    // quadrado inteiro.
    // O tamanho do elemento na tela é responsivo (sempre quadrado, usando a
    // mesma medida para width e height via clamp/min), então em telas
    // menores ele encolhe e cabe na tela; em telas grandes não passa de
    // 420px. Continua batendo com a proporção quadrada do viewBox, então a
    // conversão de coordenadas do mouse permanece correta em qualquer tamanho.
    svgEl.style.cssText = 'background:radial-gradient(circle, rgba(255,255,255,0.02), transparent); border:1px solid var(--border); cursor:crosshair; touch-action:none; border-radius:4px; width:min(420px, 80vw, 50vh); height:min(420px, 80vw, 50vh); aspect-ratio:1/1;';

    const statusMsg = document.createElement('div');
    statusMsg.style.cssText = 'font-family:var(--font-mono);font-size:0.66rem;color:var(--text-mid);text-align:center;min-height:1.8rem;letter-spacing:1px;line-height:1.4;';
    statusMsg.textContent = 'mova o mouse para guiar a sonda — o núcleo está vivo';

    const btnIniciar = document.createElement('button');
    btnIniciar.className = 'btn-target'; btnIniciar.textContent = 'INICIAR INVASÃO';

    wrap.appendChild(hud); wrap.appendChild(svgEl); wrap.appendChild(statusMsg); wrap.appendChild(btnIniciar);
    zonaInteracao.appendChild(wrap);

    function angleDiff(a,b){ let d=a-b; while(d>Math.PI)d-=Math.PI*2; while(d<-Math.PI)d+=Math.PI*2; return Math.abs(d); }

    function initRings() {
        rings = LAYER_DEFS.map((def,i) => ({
            radius: def.radiusRatio*SVG_SIZE, gapAngle: Math.random()*Math.PI*2,
            gapWidth: def.gapWidth, speed: (i%2===0?1:-1)*(0.0032+i*0.0015)*def.speedMul,
            hue: def.hue, mechanic: def.mechanic,
        }));
    }

    function setTargetFromPointer(e) {
        const rect = svgEl.getBoundingClientRect();
        targetPos.x = (e.clientX - rect.left) * (SVG_SIZE / rect.width);
        targetPos.y = (e.clientY - rect.top)  * (SVG_SIZE / rect.height);
    }
    const onPointerMove = (e) => { if (running) setTargetFromPointer(e); };
    const onTouchMove = (e) => { if (!running) return; e.preventDefault(); const t=e.touches[0]; setTargetFromPointer({clientX:t.clientX,clientY:t.clientY}); };
    svgEl.addEventListener('pointermove', onPointerMove);
    svgEl.addEventListener('touchmove', onTouchMove, { passive:false });

    function spawnSparks(x,y,hue,count,sm) { sm=sm||1; for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,sp=(1+Math.random()*2)*sm; sparks.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,hue});} }
    function spawnShockwave(x,y,hue,pp) { shockwaves.push({x,y,r:5,life:1,hue,pushPower:pp||0,hitProbe:false}); }

    function fireBullet(spread) {
        const angle = Math.atan2(probe.y-cy,probe.x-cx) + (Math.random()-0.5)*(spread||0.3);
        const speed = (1.4 + coreAnger*1.0) * (SVG_SIZE/400);
        bullets.push({x:cx+22*Math.cos(angle),y:cy+22*Math.sin(angle),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:4.5,type:'normal'});
    }
    function fireBurst() {
        const base = Math.atan2(probe.y-cy,probe.x-cx);
        const speed = 2.0 * (SVG_SIZE/400);
        [-0.28,0,0.28].forEach(off => { const a=base+off; bullets.push({x:cx+22*Math.cos(a),y:cy+22*Math.sin(a),vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:4,type:'burst'}); });
    }
    function fireTurret2() {
        const base = Math.atan2(probe.y-cy,probe.x-cx);
        const speed = 2.4 * (SVG_SIZE/400);
        [-0.22,0,0.22].forEach(off => { const a=base+off; bullets.push({x:cx+22*Math.cos(a),y:cy+22*Math.sin(a),vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:4.2,type:'turret2'}); });
    }
    function spawnDrone() { const a=Math.random()*Math.PI*2,d=SVG_SIZE*0.42; drones.push({x:cx+d*Math.cos(a),y:cy+d*Math.sin(a),speed:(0.6+coreAnger*0.35)*(SVG_SIZE/400),r:7,life:1}); }
    function triggerAlert() { alertTimer=1400; }
    function triggerAlertLongo() { alertTimer=3200; }

    function render() {
        const angerHue = 40 - coreAnger*40;
        let html = '<defs><radialGradient id="p12CoreGrad" cx="40%" cy="40%" r="60%"><stop offset="0%" stop-color="hsl('+angerHue+',95%,82%)"></stop><stop offset="55%" stop-color="hsl('+angerHue+',85%,55%)"></stop><stop offset="100%" stop-color="hsl('+angerHue+',75%,38%)"></stop></radialGradient></defs>';
        let sx=0,sy=0;
        if(screenShake>0){sx=(Math.random()-0.5)*screenShake;sy=(Math.random()-0.5)*screenShake;screenShake*=0.85;if(screenShake<0.3)screenShake=0;}
        html+='<g transform="translate('+sx.toFixed(1)+','+sy.toFixed(1)+')">';
        if(panicMode){for(let i=0;i<4;i++){const r=SVG_SIZE*0.32+i*11+Math.sin(performance.now()/200+i)*5;html+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r.toFixed(1)+'" fill="none" stroke="hsl(20,80%,55%)" stroke-width="1" opacity="'+(0.13-i*0.02)+'"></circle>';}}
        const ps=panicMode?130:(250-coreAnger*120),pulse=1+Math.sin(performance.now()/ps)*(0.08+coreAnger*0.18),coreR=coreRadius*pulse;
        html+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(coreR+30)+'" fill="hsl('+angerHue+',70%,55%)" opacity="0.06"></circle>';
        html+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(coreR+15)+'" fill="hsl('+angerHue+',70%,55%)" opacity="0.14"></circle>';
        html+='<circle cx="'+cx+'" cy="'+cy+'" r="'+coreR.toFixed(1)+'" fill="url(#p12CoreGrad)"></circle>';
        rings.forEach((ring,idx)=>{
            const isActive=idx===currentLayer,segs=48,op=isActive?0.95:(idx<currentLayer?0.1:0.4),col=idx<currentLayer?'#5F5E5A':(isActive?'#D85A30':'#888780');
            for(let i=0;i<segs;i++){const a1=(i/segs)*Math.PI*2,a2=((i+1)/segs)*Math.PI*2,mid=(a1+a2)/2;if(angleDiff(mid,ring.gapAngle)<ring.gapWidth/2)continue;const x1=cx+ring.radius*Math.cos(a1),y1=cy+ring.radius*Math.sin(a1),x2=cx+ring.radius*Math.cos(a2),y2=cy+ring.radius*Math.sin(a2);html+='<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+col+'" stroke-width="5" opacity="'+op+'"></line>';}
            if(isActive){const gx=cx+ring.radius*Math.cos(ring.gapAngle),gy=cy+ring.radius*Math.sin(ring.gapAngle);html+='<circle cx="'+gx.toFixed(1)+'" cy="'+gy.toFixed(1)+'" r="11" fill="#1D9E75" opacity="0.18"></circle>';}
        });
        drones.forEach(d=>{html+='<circle cx="'+d.x.toFixed(1)+'" cy="'+d.y.toFixed(1)+'" r="'+d.r+'" fill="#BA7517" stroke="#FFD37A" stroke-width="1.3"></circle><circle cx="'+d.x.toFixed(1)+'" cy="'+d.y.toFixed(1)+'" r="'+(d.r+4)+'" fill="#BA7517" opacity="0.18"></circle>';});
        bullets.forEach(b=>{const c=(b.type==='burst'||b.type==='turret2')?'#D4537E':'#D85A30';html+='<circle cx="'+b.x.toFixed(1)+'" cy="'+b.y.toFixed(1)+'" r="'+b.r+'" fill="'+c+'"></circle><circle cx="'+b.x.toFixed(1)+'" cy="'+b.y.toFixed(1)+'" r="'+(b.r+3.5)+'" fill="'+c+'" opacity="0.25"></circle>';});
        probe.x+=(targetPos.x-probe.x)*0.2; probe.y+=(targetPos.y-probe.y)*0.2;
        const fl=performance.now()<invulneravelAte;
        html+='<circle cx="'+probe.x.toFixed(1)+'" cy="'+probe.y.toFixed(1)+'" r="8" fill="'+(fl?'#5F5E5A':'#378ADD')+'" stroke="white" stroke-width="1.3"></circle>';
        html+='<circle cx="'+probe.x.toFixed(1)+'" cy="'+probe.y.toFixed(1)+'" r="14" fill="#378ADD" opacity="0.13"></circle>';
        sparks.forEach(s=>{html+='<circle cx="'+s.x.toFixed(1)+'" cy="'+s.y.toFixed(1)+'" r="2.1" fill="hsl('+s.hue+',85%,65%)" opacity="'+s.life.toFixed(2)+'"></circle>';});
        shockwaves.forEach(sw=>{html+='<circle cx="'+sw.x.toFixed(1)+'" cy="'+sw.y.toFixed(1)+'" r="'+sw.r.toFixed(1)+'" fill="none" stroke="hsl('+sw.hue+',80%,60%)" stroke-width="1.8" opacity="'+sw.life.toFixed(2)+'"></circle>';});
        html+='</g>';
        if(alertTimer>0){html+='<rect x="0" y="0" width="'+SVG_SIZE+'" height="'+SVG_SIZE+'" fill="#D85A30" opacity="'+(0.06*Math.sin(performance.now()/80)*0.5+0.06).toFixed(3)+'"></rect>';}
        svgEl.innerHTML=html;
    }

    function loop(t) {
        if (!running) return;
        if (alertTimer>0) alertTimer-=16;
        rings.forEach(r => { r.gapAngle+=r.speed; });
        const mech = currentLayer < rings.length ? rings[currentLayer].mechanic : null;

        if (mech==='turret') {
            const interval = Math.max(450, 820-coreAnger*200);
            if (t-lastShotTime>interval) { fireBullet(0.32); lastShotTime=t; AudioEngine.play(220,0.08,'sine',0.025); }
        }
        if (mech==='turret2') {
            const interval = Math.max(320, 600-coreAnger*200);
            if (t-lastShotTime>interval) { fireTurret2(); lastShotTime=t; AudioEngine.play(240,0.1,'sine',0.03); }
        }
        if (mech==='drone') {
            if (t-lastDroneSpawn>Math.max(2100,3400-coreAnger*1100) && drones.length<3) { spawnDrone(); lastDroneSpawn=t; triggerAlert(); }
            if (t-lastShotTime>Math.max(1000,1800-coreAnger*650)) { fireBurst(); lastShotTime=t; AudioEngine.play(260,0.1,'sine',0.03); }
        }
        if (mech==='panic') {
            if (!panicMode) { panicMode=true; triggerAlertLongo(); statusMsg.textContent='PÂNICO TOTAL — o núcleo está colapsando e atacando com tudo'; statusMsg.style.color='#D85A30'; lastCoreShockwave=t; }
            if (alertTimer<=0) triggerAlertLongo();
            if (t-lastShotTime>Math.max(520,1000-coreAnger*350)) { fireBurst(); lastShotTime=t; AudioEngine.play(300,0.1,'sine',0.03); }
            if (t-lastDroneSpawn>2400 && drones.length<4) { spawnDrone(); lastDroneSpawn=t; }
            if (t-lastCoreShockwave>3500) { spawnShockwave(cx,cy,15,55); AudioEngine.play(70,0.4,'sawtooth',0.06); screenShake=10; lastCoreShockwave=t; statusMsg.textContent='pulso de choque! afaste-se ou será empurrado'; statusMsg.style.color='#D85A30'; }
        }

        drones.forEach(d=>{const dx=probe.x-d.x,dy=probe.y-d.y,dist=Math.hypot(dx,dy)||1;d.x+=(dx/dist)*d.speed;d.y+=(dy/dist)*d.speed;});
        drones=drones.filter(d=>{const d2=Math.hypot(d.x-probe.x,d.y-probe.y);if(d2<d.r+probe.radius&&performance.now()>invulneravelAte){lives--;invulneravelAte=performance.now()+800;screenShake=9;spawnSparks(probe.x,probe.y,30,10);AudioEngine.play(90,0.25,'sawtooth',0.05);vidasLabel.textContent=Array(4).fill('♥').map((s,i)=>i<lives?'♥':'♡').join(' ');statusMsg.textContent='um drone te alcançou! '+lives+' vida(s)';statusMsg.style.color='#D85A30';if(lives<=0){triggerDerrota();return false;}return false;}return Math.hypot(d.x-cx,d.y-cy)<SVG_SIZE*0.62;});

        bullets.forEach(b=>{b.x+=b.vx;b.y+=b.vy;});
        bullets=bullets.filter(b=>{const d=Math.hypot(b.x-probe.x,b.y-probe.y);if(d<b.r+probe.radius&&performance.now()>invulneravelAte){lives--;invulneravelAte=performance.now()+800;screenShake=9;spawnSparks(probe.x,probe.y,0,8);AudioEngine.play(90,0.25,'sawtooth',0.05);vidasLabel.textContent=Array(4).fill('♥').map((s,i)=>i<lives?'♥':'♡').join(' ');statusMsg.textContent='atingido! '+lives+' vida(s) restante(s)';statusMsg.style.color='#D85A30';if(lives<=0)triggerDerrota();return false;}return Math.hypot(b.x-cx,b.y-cy)<SVG_SIZE*0.53;});

        if (currentLayer<rings.length&&running) {
            const ring=rings[currentLayer],dist=Math.hypot(probe.x-cx,probe.y-cy);
            if (Math.abs(dist-ring.radius)<8) {
                const pa=Math.atan2(probe.y-cy,probe.x-cx);
                if (angleDiff(pa,ring.gapAngle)<ring.gapWidth/2) {
                    currentLayer++; coreAnger=Math.min(1,currentLayer/TOTAL_LAYERS);
                    spawnSparks(probe.x,probe.y,140,14); spawnShockwave(probe.x,probe.y,140);
                    AudioEngine.play(500+currentLayer*40,0.18,'sine',0.05);
                    if (currentLayer<TOTAL_LAYERS) {
                        faseLabel.textContent='CAMADA '+(currentLayer+1)+' / '+TOTAL_LAYERS;
                        const nm=rings[currentLayer].mechanic;
                        if(nm==='turret'){statusMsg.textContent='o núcleo abriu fogo — desvie dos disparos!';statusMsg.style.color='#D85A30';triggerAlert();}
                        else if(nm==='turret2'){statusMsg.textContent='dupla torreta ativada — disparos em leque!';statusMsg.style.color='#D85A30';triggerAlert();}
                        else if(nm==='drone'){statusMsg.textContent='drones de defesa foram liberados!';statusMsg.style.color='#BA7517';triggerAlert();}
                        else if(nm==='panic'){statusMsg.textContent='última camada — o núcleo sente que vai cair';statusMsg.style.color='#D85A30';}
                        else{statusMsg.textContent='camada atravessada!';statusMsg.style.color='var(--text-mid)';}
                    } else { triggerVitoria(); }
                } else if (performance.now()>invulneravelAte) {
                    lives--;invulneravelAte=performance.now()+700;screenShake=7;
                    spawnSparks(probe.x,probe.y,0,8);AudioEngine.play(90,0.2,'sawtooth',0.05);
                    vidasLabel.textContent=Array(4).fill('♥').map((s,i)=>i<lives?'♥':'♡').join(' ');
                    statusMsg.textContent='bateu na barreira! '+lives+' vida(s) restante(s)';statusMsg.style.color='#D85A30';
                    const pa=Math.atan2(probe.y-cy,probe.x-cx);targetPos.x=probe.x+Math.cos(pa)*14;targetPos.y=probe.y+Math.sin(pa)*14;
                    if(lives<=0){triggerDerrota();return;}
                }
            }
        }

        sparks.forEach(s=>{s.x+=s.vx;s.y+=s.vy;s.life-=0.03;}); sparks=sparks.filter(s=>s.life>0);
        shockwaves.forEach(sw=>{sw.r+=2;sw.life-=0.04;if(sw.pushPower>0&&!sw.hitProbe){const dsc=Math.hypot(probe.x-sw.x,probe.y-sw.y);if(sw.r>=dsc){sw.hitProbe=true;const pa=Math.atan2(probe.y-sw.y,probe.x-sw.x),nx=probe.x+Math.cos(pa)*sw.pushPower,ny=probe.y+Math.sin(pa)*sw.pushPower;targetPos.x=Math.max(10,Math.min(SVG_SIZE-10,nx));targetPos.y=Math.max(10,Math.min(SVG_SIZE-10,ny));probe.x=targetPos.x;probe.y=targetPos.y;screenShake=12;spawnSparks(probe.x,probe.y,15,10);AudioEngine.play(110,0.2,'triangle',0.05);}}});
        shockwaves=shockwaves.filter(sw=>sw.life>0);
        render();
        if (running) rafId=requestAnimationFrame(loop);
    }

    function triggerVitoria() {
        running=false; venceu=true; panicMode=false;
        faseLabel.textContent='NÚCLEO INVADIDO';
        statusMsg.textContent='o núcleo foi tomado. a invasão foi um sucesso absoluto.'; statusMsg.style.color='#1D9E75';
        AudioEngine.play(700,0.4,'sine',0.07);
        spawnSparks(cx,cy,50,60,1.6); spawnShockwave(cx,cy,50); spawnShockwave(cx,cy,140);
        render(); cleanup(); setTimeout(abrirPortalFinal, 900);
    }

    function triggerDerrota() {
        running=false; cleanup();
        tentativasP12++;
        if (tentativasP12 < 2) {
            statusMsg.textContent='sonda destruída — você ainda tem mais uma tentativa.'; statusMsg.style.color='#D85A30';
            AudioEngine.play(100,0.5,'sawtooth',0.07);
            btnIniciar.textContent='ÚLTIMA CHANCE'; btnIniciar.disabled=false; btnIniciar.style.display='inline-block';
        } else {
            tentativasP12=0; AudioEngine.play(100,0.5,'sawtooth',0.07); mostrarTelaDerrota();
        }
    }

    function cleanup() { cancelAnimationFrame(rafId); svgEl.removeEventListener('pointermove',onPointerMove); svgEl.removeEventListener('touchmove',onTouchMove); }

    btnIniciar.addEventListener('click', () => {
        lives=4;currentLayer=0;sparks=[];bullets=[];drones=[];shockwaves=[];
        venceu=false;lastShotTime=0;lastDroneSpawn=0;coreAnger=0;panicMode=false;alertTimer=0;screenShake=0;
        probe={x:cx,y:SPAWN_Y,radius:6.5}; targetPos={x:cx,y:SPAWN_Y};
        initRings();
        vidasLabel.textContent='♥ ♥ ♥ ♥'; faseLabel.textContent='CAMADA 1 / '+TOTAL_LAYERS;
        btnIniciar.disabled=true; btnIniciar.style.display='none';
        let prep=3;
        statusMsg.textContent='preparando teleporte... '+prep; statusMsg.style.color='var(--text-mid)';
        invulneravelAte=performance.now()+60000;
        let prepRenderId=null;
        function prepLoop(){render();prepRenderId=requestAnimationFrame(prepLoop);}
        prepRenderId=requestAnimationFrame(prepLoop);
        const prepTimer=setInterval(()=>{
            prep--;
            if(prep>0){statusMsg.textContent='preparando teleporte... '+prep;}
            else{
                clearInterval(prepTimer);cancelAnimationFrame(prepRenderId);
                probe={x:cx,y:SPAWN_Y,radius:6.5};targetPos={x:cx,y:SPAWN_Y};
                invulneravelAte=performance.now()+600;
                statusMsg.textContent='siga o mouse e atravesse a brecha de cada anel — o núcleo está vivo';
                svgEl.addEventListener('pointermove',onPointerMove);
                svgEl.addEventListener('touchmove',onTouchMove,{passive:false});
                running=true; rafId=requestAnimationFrame(loop);
            }
        },700);
    });

    initRings(); render();
};

// ==========================================================================
// PORTAL FINAL
// ==========================================================================
function abrirPortalFinal() {
    const flash=document.createElement('div');
    flash.style.cssText='position:fixed;inset:0;background:#fff;z-index:9999999;opacity:0;pointer-events:none;transition:opacity 0.25s ease;';
    document.body.appendChild(flash);
    AudioEngine.play(1200,3,'sine',0.1);
    [0.9,0,0.9,0,1].forEach((op,i)=>setTimeout(()=>{flash.style.opacity=op;},[0,300,520,820,1080][i]));
    setTimeout(()=>{ window.location.href='segredo.html'; },3800);
}

function renderizarGaleriaFinal() { cancelarTimersDica(); abrirPortalFinal(); }

// ==========================================================================
// INIT
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    Balao.init();

    const app = document.getElementById('app-container');
    if (app) {
        const tl=document.createElement('div'); tl.className='corner-tl'; app.appendChild(tl);
        const br=document.createElement('div'); br.className='corner-br'; app.appendChild(br);
    }

    // Atalho: Delete 3x → puzzle 12
    let deleteCount=0, deleteTimer=null;
    document.addEventListener('keydown', e => {
        if (e.key!=='Delete') return;
        deleteCount++; clearTimeout(deleteTimer);
        deleteTimer=setTimeout(()=>{deleteCount=0;},800);
        if (deleteCount>=3) {
            deleteCount=0;
            if (landingScreen&&!landingScreen.classList.contains('hidden')) { landingScreen.classList.add('hidden'); if(containerApp)containerApp.classList.remove('hidden'); }
            estado_jogo.puzzleAtual=12; estado_jogo.errosNoPuzzle=0; renderizarPuzzle();
        }
    });

    if (landingScreen) {
        landingScreen.querySelector('button')?.addEventListener('click', () => {
            landingScreen.classList.add('hidden');
            if (containerApp) containerApp.classList.remove('hidden');
            estado_jogo.puzzleAtual=1; renderizarPuzzle();
        });
    }
});
