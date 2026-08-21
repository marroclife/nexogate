// NEXO Gateway — Timer Web Worker
// Roda em background mesmo quando a tela do celular apaga.

let timerInterval = null;
let endTime = 0;

function tick() {
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
    
    postMessage({ type: 'tick', remaining });
    
    if (remaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        postMessage({ type: 'complete' });
    }
}

self.onmessage = function(e) {
    const { command, seconds } = e.data;
    
    if (command === 'start') {
        if (timerInterval) clearInterval(timerInterval);
        endTime = Date.now() + (seconds * 1000);
        tick(); // immediate first tick
        timerInterval = setInterval(tick, 1000);
    }
    
    if (command === 'stop') {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        postMessage({ type: 'stopped' });
    }
};
