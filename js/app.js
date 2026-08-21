/**
 * NEXO Gateway Mobile App
 * Refactored for Mobile-First Experience
 */

const FOCUS_DATA = {
    'F10': { name: 'Focus 10', tag: 'Mente Desperta / Corpo Dormindo', desc: 'O estado básico de separação. O corpo físico está profundamente relaxado, mas a mente permanece alerta.', goal: 'Estabilizar a consciência fora da percepção sensorial.', how: 'Deite-se em posição semi-reclinada. Deixe o corpo "afundar" enquanto a consciência observa.' },
    'F12': { name: 'Focus 12', tag: 'Expansão da Consciência', desc: 'Estado de conscientização expandida. Percebe-se a energia ao redor do corpo.', goal: 'Ampliar a percepção sensorial para além do físico.', how: 'Mova a atenção para o topo da cabeça ou para o espaço ao redor do corpo.' },
    'F15': { name: 'Focus 15', tag: 'Estado de Agora', desc: 'O ponto zero. Não há tempo, nem espaço, nem ego. Apenas a existência pura.', goal: 'Desapego total e cura profunda.', how: 'Afirme: "Agora dissolve o tempo." Permita que passado, presente e futuro ocupem o mesmo espaço.' },
    'F21': { name: 'Focus 21', tag: 'Acesso ao Sistema de Conhecimento', desc: 'A ponte para a Akasha. Acesso a informações não locais e memórias universais.', goal: 'Obter insights e respostas complexas.', how: 'Formule uma pergunta clara. Não force a resposta. Mantenha a intenção como farol.' },
    'F22': { name: 'Focus 22', tag: 'Vida Após a Morte / Santuário', desc: 'Realidade de transição pós-física. Encontro com consciências que deixaram o corpo físico.', goal: 'Compreensão da continuidade da consciência.', how: 'Requer F10/F12 estáveis. Use afirmações específicas.' },
    'F23': { name: 'Focus 23', tag: 'Inanimado / Vazio', desc: 'Estado de ausência de atividade consciencial ativa. Usado para descanso e limpeza.', goal: 'Recuperação energética e dissolução do ego.', how: 'Foco no vazio absoluto, desidentificação total.' },
    'F24': { name: 'Focus 24', tag: 'Ativo Consciente / Coletivo de Crenças', desc: 'Nível onde sistemas de crença coletivos se manifestam como estruturas percebíveis.', goal: 'Estudar e navegar padrões culturais.', how: 'Observação analítica de padrões de crença.' },
    'F25': { name: 'Focus 25', tag: 'Crenças / Padrões Históricos', desc: 'Acesso a padrões culturais, históricos e arquetípicos.', goal: 'Compreender e ressignificar crenças.', how: 'Sintonia com frequências históricas.' },
    'F26': { name: 'Focus 26', tag: 'Seres de Luz / Mentores', desc: 'Interação com entidades de orientação e mentores espirituais.', goal: 'Receber orientação e alinhamento.', how: 'Chamada por intenção e abertura para a luz.' },
    'F27': { name: 'Focus 27', tag: 'O Park / Ponto de Encontro', desc: 'Local de planejamento, integração e encontro. Ponto de retorno seguro.', goal: 'Integrar experiências e planejar próximos passos.', how: 'Afirme: "Vou ao Park em F27 para integrar".' },
};

class BinauralPlayer {
    constructor() {
        this.audioCtx = null;
        this.leftOsc = null;
        this.rightOsc = null;
        this.leftGain = null;
        this.rightGain = null;
        this.merger = null;
        this.isPlaying = false;
        this.currentFreq = { base: 0, diff: 0 };
        
        this.volumeControl = document.getElementById('volume');
        this.initEventListeners();
    }

    async initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }
    }

    initEventListeners() {
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const card = e.target.closest('.session-card');
                const base = parseFloat(card.dataset.base);
                const diff = parseFloat(card.dataset.diff);
                
                await this.initAudio();
                
                if (this.isPlaying && this.currentFreq.base === base && this.currentFreq.diff === diff) {
                    this.stop();
                    this.updateUI();
                } else {
                    this.start(base, diff);
                    this.updateUI();
                }
            });
        });

        this.volumeControl.addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value);
            if (this.leftGain && this.rightGain) {
                this.leftGain.gain.setTargetAtTime(vol, this.audioCtx.currentTime, 0.1);
                this.rightGain.gain.setTargetAtTime(vol, this.audioCtx.currentTime, 0.1);
            }
        });

        document.getElementById('btn-emergency').addEventListener('click', () => {
            this.stop();
            this.updateUI();
        });
    }

    updateUI() {
        document.querySelectorAll('.play-btn').forEach(btn => {
            const card = btn.closest('.session-card');
            const base = parseFloat(card.dataset.base);
            const diff = parseFloat(card.dataset.diff);
            
            if (this.isPlaying && this.currentFreq.base === base && this.currentFreq.diff === diff) {
                btn.innerText = 'Parar';
                btn.classList.add('active');
            } else {
                btn.innerText = 'Iniciar';
                btn.classList.remove('active');
            }
        });
    }

    start(base, diff) {
        this.stop();
        this.currentFreq = { base, diff };
        
        this.leftOsc = this.audioCtx.createOscillator();
        this.rightOsc = this.audioCtx.createOscillator();
        this.leftGain = this.audioCtx.createGain();
        this.rightGain = this.audioCtx.createGain();
        this.merger = this.audioCtx.createChannelMerger(2);

        this.leftOsc.frequency.setValueAtTime(base, this.audioCtx.currentTime);
        this.rightOsc.frequency.setValueAtTime(base + diff, this.audioCtx.currentTime);

        const vol = parseFloat(this.volumeControl.value);
        this.leftGain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
        this.rightGain.gain.setValueAtTime(vol, this.audioCtx.currentTime);

        this.leftOsc.connect(this.leftGain);
        this.leftGain.connect(this.merger, 0, 0);
        this.rightOsc.connect(this.rightGain);
        this.rightGain.connect(this.merger, 0, 1);
        this.merger.connect(this.audioCtx.destination);

        this.leftOsc.start();
        this.rightOsc.start();
        this.isPlaying = true;
    }

    stop() {
        if (this.leftOsc) {
            this.leftOsc.stop();
            this.leftOsc.disconnect();
        }
        if (this.rightOsc) {
            this.rightOsc.stop();
            this.rightOsc.disconnect();
        }
        this.isPlaying = false;
    }
}

class SessionTimer {
    constructor() {
        this.timerInterval = null;
        this.timeLeft = 0;
        this.display = document.getElementById('timer-display');
        
        this.initEventListeners();
    }

    initEventListeners() {
        document.querySelectorAll('.timer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mins = parseInt(e.target.dataset.min);
                this.startTimer(mins * 60);
                
                document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    startTimer(seconds) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timeLeft = seconds;
        this.updateDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            if (this.timeLeft <= 0) {
                this.complete();
            }
        }, 1000);
    }

    updateDisplay() {
        this.timeLeft = this.timeLeft < 0 ? 0 : this.timeLeft;
        const m = Math.floor(this.timeLeft / 60);
        const s = this.timeLeft % 60;
        this.display.innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    complete() {
        clearInterval(this.timerInterval);
        this.display.innerText = '00:00';
        
        // Soft alert
        const alertSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        alertSound.play().catch(() => {});
        
        alert('Sessão finalizada. Inicie o processo de Grounding e Registro.');
    }
}

class AppController {
    constructor() {
        this.currentTab = 'home';
        this.init();
    }

    init() {
        this.initTabs();
        this.initFocos();
        this.initRegistration();
        this.initHome();
        
        // Initialize global systems
        window.player = new BinauralPlayer();
        window.timer = new SessionTimer();
    }

    initTabs() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => this.switchTab(item.dataset.tab));
        });
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        
        const activeTab = document.getElementById(`tab-${tabId}`);
        const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
        
        if (activeTab && activeNav) {
            activeTab.classList.add('active');
            activeNav.classList.add('active');
        }
        this.currentTab = tabId;
    }

    initFocos() {
        const list = document.getElementById('focos-list');
        Object.entries(FOCUS_DATA).forEach(([key, data]) => {
            const item = document.createElement('div');
            item.className = 'focus-item';
            item.innerHTML = `
                <div class="focus-header" onclick="this.nextElementSibling.classList.toggle('open')">
                    <h4>${data.name} <span class="toggle-icon">▼</span></h4>
                    <span class="card-tag">${data.tag}</span>
                </div>
                <div class="focus-content">
                    <p>${data.desc}</p>
                    <p><strong>Objetivo:</strong> ${data.goal}</p>
                    <p><strong>Como Alcançar:</strong> ${data.how}</p>
                </div>
            `;
            list.appendChild(item);
        });
    }

    initRegistration() {
        const form = document.getElementById('session-form');
        const saveBtn = document.getElementById('btn-save-reg');
        const historyList = document.getElementById('reg-history');

        // Load initial date
        const now = new Date();
        document.getElementById('reg-date').value = now.toISOString().slice(0, 16);

        saveBtn.addEventListener('click', () => {
            const reg = {
                date: document.getElementById('reg-date').value,
                foco: document.getElementById('reg-foco').value,
                intent: document.getElementById('reg-intent').value,
                insights: document.getElementById('reg-insights').value,
                id: Date.now()
            };

            if (!reg.intent || !reg.insights) {
                alert('Por favor, preencha a intenção e os insights.');
                return;
            }

            localStorage.setItem(`nexo_reg_${reg.id}`, JSON.stringify(reg));
            this.updateHistory();
            form.reset();
            document.getElementById('reg-date').value = new Date().toISOString().slice(0, 16);
        });

        this.updateHistory();
    }

    updateHistory() {
        const historyList = document.getElementById('reg-history');
        historyList.innerHTML = '';
        
        const regs = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('nexo_reg_')) {
                regs.push(JSON.parse(localStorage.getItem(key)));
            }
        }
        
        regs.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        regs.forEach(reg => {
            const card = {
                id: reg.id,
                date: reg.date.replace('T', ' '),
                foco: reg.foco,
                intent: reg.intent,
                insights: reg.insights
            };
            
            const div = document.createElement('div');
            div.className = 'history-card';
            div.innerHTML = `
                <h4>
                    <span class="h-foco">${card.foco}</span> 
                    <span class="h-date">${card.date}</span>
                </h4>
                <p><strong>Intenção:</strong> ${card.intent}</p>
                <p><strong>Insights:</strong> ${card.insights}</p>
                <button class="btn-delete" onclick="app.deleteReg(${card.id})" style="background:none; border:none; color:#ff0055; cursor:pointer; font-size:0.7rem; float:right;">Excluir</button>
            `;
            historyList.appendChild(div);
        });
    }

    deleteReg(id) {
        localStorage.removeItem(`nexo_reg_${id}`);
        this.updateHistory();
    }

    initHome() {
        const dateDisplay = document.getElementById('date-display');
        dateDisplay.innerText = new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    app = new AppController();
});
