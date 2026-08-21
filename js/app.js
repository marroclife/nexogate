/**
 * NEXO Gateway App
 * Web Audio API Implementation for Binaural Beats
 */

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
                const card = e.target.closest('.freq-card');
                const base = parseFloat(card.dataset.base);
                const diff = parseFloat(card.dataset.diff);
                
                await this.initAudio();
                
                if (this.isPlaying && this.currentFreq.base === base && this.currentFreq.diff === diff) {
                    this.stop();
                    e.target.innerText = 'Iniciar';
                } else {
                    this.start(base, diff);
                    document.querySelectorAll('.play-btn').forEach(b => b.innerText = 'Iniciar');
                    e.target.innerText = 'Parar';
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
    }

    start(base, diff) {
        this.stop();

        this.currentFreq = { base, diff };
        
        // Setup Nodes
        this.leftOsc = this.audioCtx.createOscillator();
        this.rightOsc = this.audioCtx.createOscillator();
        this.leftGain = this.audioCtx.createGain();
        this.rightGain = this.audioCtx.createGain();
        this.merger = this.audioCtx.createChannelMerger(2);

        // Frequencies
        // Left: Base, Right: Base + Diff
        this.leftOsc.frequency.setValueAtTime(base, this.audioCtx.currentTime);
        this.rightOsc.frequency.setValueAtTime(base + diff, this.audioCtx.currentTime);

        // Volume
        const vol = parseFloat(this.volumeControl.value);
        this.leftGain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
        this.rightGain.gain.setValueAtTime(vol, this.audioCtx.currentTime);

        // Routing
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

// Prompt Copy Logic
document.querySelectorAll('.copyable').forEach(el => {
    el.addEventListener('click', () => {
        navigator.clipboard.writeText(el.innerText).then(() => {
            const originalText = el.innerText;
            el.innerText = 'Copiado!';
            el.style.color = '#fff';
            setTimeout(() => {
                el.innerText = originalText;
                el.style.color = '#888';
            }, 1000);
        });
    });
});

// Initialize Player
window.addEventListener('DOMContentLoaded', () => {
    new BinauralPlayer();

    // Registro copy logic
    const btnSalvar = document.getElementById('btnSalvarRegistro');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', () => {
            const form = document.querySelector('.registro-form');
            if (!form) return;
            const inputs = form.querySelectorAll('input, select, textarea');
            const labels = form.querySelectorAll('label');
            let text = '## Registro de Sessão NEXO Gateway\n\n';
            inputs.forEach((input, i) => {
                const label = labels[i] ? labels[i].innerText : '';
                const value = input.value || '(não preenchido)';
                text += `- **${label}:** ${value}\n`;
            });
            text += `\n_Registrado em: ${new Date().toLocaleString('pt-BR')}_`;

            navigator.clipboard.writeText(text).then(() => {
                const original = btnSalvar.innerText;
                btnSalvar.innerText = 'Registro Copiado!';
                btnSalvar.style.background = '#00ff88';
                setTimeout(() => {
                    btnSalvar.innerText = original;
                    btnSalvar.style.background = '';
                }, 1500);
            }).catch(err => {
                console.error('Erro ao copiar:', err);
                alert('Não foi possível copiar automaticamente. Verifique permissões do navegador.');
            });
        });
    }
});
