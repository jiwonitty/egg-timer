let sndClick, sndErro, sndStartTimer, sndAgua, sndVitoria;
let audioInicializado = false;

function inicializarAudios() {
    if (audioInicializado) return;

    sndClick = new Audio('assets/audio/click_suave_confirmar.mp3');
    sndErro = new Audio('assets/audio/erro.mp3');
    sndStartTimer = new Audio('assets/audio/start_timer.mp3');
    sndAgua = new Audio('assets/audio/agua_borbulhando.mp3');
    sndVitoria = new Audio('assets/audio/vitoria.wav');

    sndClick.preload = 'auto';
    sndErro.preload = 'auto';
    sndStartTimer.preload = 'auto';
    sndAgua.preload = 'auto';
    sndVitoria.preload = 'auto';

    sndAgua.loop = true;
    sndVitoria.loop = true;

    audioInicializado = true;
}

function playSound(audioObject) {
    if (!audioInicializado) inicializarAudios();
    
    if (audioObject) {
        audioObject.currentTime = 0;
        audioObject.play().catch(e => {
            console.error("Erro ao tentar tocar o som. Motivo:", e.message, audioObject.src);
        });
    }
}

function goToScreen(screenNumber) {
    inicializarAudios();

    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(`screen-${screenNumber}`);
    if (target) target.classList.remove('hidden');

    if (screenNumber < 3) {
        clearInterval(timerInterval);
        isRunning = false;
        
        if (sndAgua) sndAgua.pause();
        if (sndVitoria) sndVitoria.pause();
    }
}

const gemaBaseTimes = { 'mole': 420, 'cremosa': 540, 'dura': 720 };

function setActive(btn) {
    inicializarAudios();
    playSound(sndClick);
    
    if (btn.classList.contains('active')) {
        btn.classList.remove('active');
    } else {
        const parent = btn.parentElement;
        parent.querySelectorAll('.btn-outline').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    btn.blur(); 
    updateTimer(); 
}

function setActiveCard(card) {
    inicializarAudios();
    playSound(sndClick);
    
    if (card.classList.contains('active')) {
        card.classList.remove('active');
    } else {
        const parent = card.closest('.gema-row');
        parent.querySelectorAll('.gema-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
    }
    card.blur(); 
    updateTimer();
}

function updateTimer() {
    const timerDisplay = document.querySelector('.timer-pixel');
    const activeGema = document.querySelector('.gema-card.active strong');
    if (!activeGema) {
        if (timerDisplay) timerDisplay.innerHTML = `00:00 <span class="min">MIN</span>`;
        return;
    }
    
    let totalSeconds = gemaBaseTimes[activeGema.innerText.toLowerCase()];
    const activeButtons = document.querySelectorAll('.btn-outline.active');
    activeButtons.forEach(btn => {
        if (btn.innerText === 'P') totalSeconds -= 30;
        if (btn.innerText === 'G') totalSeconds += 30;
        if (btn.innerText === 'Alta') totalSeconds -= 60;
    });

    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (timerDisplay) timerDisplay.innerHTML = `${m}:${s.toString().padStart(2, '0')} <span class="min">MIN</span>`;
}

let timerInterval, timeLeft, totalTime, isRunning = false;

const dicasCozimento = [
    "Depois de cozinhar, colocar o ovo na água gelada ajuda a parar o cozimento e facilita descascar.",
    "Para ovos mais fáceis de descascar, adicione uma colher de vinagre ou bicarbonato na água fervendo.",
    "Nunca coloque ovos direto da geladeira na água fervendo muito forte para evitar que a casca trinque.",
    "Ovos um pouco mais velhos (mas bons) são muito mais fáceis de descascar depois de cozidos do que ovos super frescos.",
    "Gire o ovo cozido na mesa aplicando uma leve pressão com a mão para trincar a casca inteira antes de descascar.",
    "Descascar o ovo debaixo de água corrente fria ajuda a remover os pedacinhos de casca grudados sem quebrar a clara."
];

function prepareTimer() {
    inicializarAudios();

    const timerDisplay = document.querySelector('.timer-pixel');
    const activeGema = document.querySelector('.gema-card.active strong')?.innerText;
    const activeTempBtn = document.querySelector('.selection-group:nth-of-type(1) .btn-outline.active');
    const activeTamanhoBtn = document.querySelector('.selection-group:nth-of-type(2) .btn-outline.active');

    if (!activeGema || !activeTempBtn || !activeTamanhoBtn) {
        let title = "";
        let message = "";

        if (!activeTempBtn && !activeTamanhoBtn && !activeGema) {
            title = "OPS! O OVO QUEBROU...";
            message = "Você não selecionou nada! Ajuste o fogo, o tamanho e a gema antes de começar.";
        }
        else if (activeTempBtn && !activeTamanhoBtn && !activeGema) {
            title = "QUASE LÁ...";
            message = "O fogo está pronto, mas preciso saber o tamanho do ovo e o tipo da gema!";
        }
        else if (!activeTempBtn && activeTamanhoBtn && !activeGema) {
            title = "FALTA COISA AÍ!";
            message = "Já sei o tamanho do ovo, mas falta escolher o fogo e o ponto da gema.";
        }
        else if (!activeTempBtn && !activeTamanhoBtn && activeGema) {
            title = "PREPARA O FOGO!";
            message = "Belo ponto de gema! Agora selecione a temperatura e o tamanho do ovo.";
        }
        else if (!activeTempBtn && activeTamanhoBtn && activeGema) {
            title = "FOGO APAGADO!";
            message = "Falta escolher a temperatura! A água vai ferver em fogo Alto ou Baixo?";
        }
        else if (activeTempBtn && !activeTamanhoBtn && activeGema) {
            title = "QUE OVO É ESSE?";
            message = "Esqueceu de me dizer o tamanho do ovo. É P, M ou G?";
        }
        else if (activeTempBtn && activeTamanhoBtn && !activeGema) {
            title = "E A GEMA?";
            message = "Como você quer a gema? Escolha entre mole, cremosa ou dura!";
        }

        playSound(sndErro);
        showErrorModal(title, message);
        return; 
    }

    playSound(sndClick);

    if (!timerDisplay || timerDisplay.innerText.includes("00:00")) return;

    let tempValue = activeTempBtn.innerText === 'Alta' ? '100°C' : '95°C';

    const displayGema = document.getElementById('display-gema');
    const displayTemp = document.getElementById('display-temp');
    const title = document.getElementById('timer-title-text');
    const displayDica = document.querySelector('.cooking-tip p');
    const btnAcao = document.getElementById('timer-action-btn');

    if (displayGema) displayGema.innerText = `Gema ${activeGema.toLowerCase()}`;
    if (displayTemp) displayTemp.innerText = `~${tempValue}`; 
    if (title) title.innerText = `OVO COM GEMA ${activeGema.toUpperCase()}`;
    if (btnAcao) btnAcao.innerText = 'INICIAR'; 
    
    if (displayDica) {
        const indiceAleatorio = Math.floor(Math.random() * dicasCozimento.length);
        displayDica.innerText = dicasCozimento[indiceAleatorio];
    }

    const timeOnly = timerDisplay.innerText.split(' ')[0];
    const parts = timeOnly.split(':');
    totalTime = (parseInt(parts[0]) * 60) + parseInt(parts[1]);
    timeLeft = totalTime;

    updateTimerDisplay();
    goToScreen(3);
}

function toggleTimer() {
    inicializarAudios();
    const btn = document.getElementById('timer-action-btn');
    
    if (btn.innerText === 'RECOMEÇAR') {
        playSound(sndClick); 
        goToScreen(2);
        return;
    }

    if (isRunning) {
        clearInterval(timerInterval);
        btn.innerText = 'CONTINUAR'; 
        isRunning = false;
        
        playSound(sndClick); 
        if (sndAgua) sndAgua.pause();    
    } else {
        btn.innerText = 'PARAR';
        isRunning = true;
        
        playSound(sndStartTimer);
        if (sndAgua) sndAgua.play().catch(e => {});
        
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                finishTimer();
            }
        }, 1000);
    }
}

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    const timeString = `${m}:${s.toString().padStart(2, '0')}`;
    
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        if (countdownElement.firstChild && countdownElement.firstChild.nodeType === Node.TEXT_NODE) {
            countdownElement.firstChild.textContent = timeString + " ";
        } else {
            countdownElement.innerHTML = `${timeString} <span class="min-label">MIN</span>`;
        }
    }
    
    const bar = document.getElementById('progress-bar');
    if (bar) {
        const offset = 722.5 - (timeLeft / totalTime) * 722.5;
        bar.style.strokeDashoffset = offset;

        const percent = (timeLeft / totalTime) * 100;

        if (percent <= 20) {
            bar.style.stroke = "#FF4B4B";
        } else if (percent <= 50) {
            bar.style.stroke = "#FF8A48";
        } else {
            bar.style.stroke = "#FFD95A";
        }
    }
}

function finishTimer() {
    isRunning = false;
    if (sndAgua) {
        sndAgua.pause();
        sndAgua.currentTime = 0;
    }
    
    playSound(sndVitoria);
    
    document.getElementById('timer-action-btn').innerText = 'RECOMEÇAR';
    document.getElementById('timer-title-text').innerText = 'PRONTINHO!';
}

function showErrorModal(titulo, message) {
    const modal = document.getElementById('error-modal');
    const titleElement = document.getElementById('error-title');
    const msgElement = document.getElementById('error-message');
    
    if (modal && titleElement && msgElement) {
        titleElement.innerText = titulo;
        msgElement.innerText = message;
        modal.classList.remove('hidden');
    }
}

function closeErrorModal() {
    playSound(sndClick); 
    const modal = document.getElementById('error-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

window.onload = function() {
    updateTimer();
    
    const btnComecar = document.querySelector('.screen:nth-of-type(1) button') || document.getElementById('btn-comecar');
    
    if (btnComecar) {
        btnComecar.addEventListener('click', function() {
            inicializarAudios();
            playSound(sndClick);
            goToScreen(2);
        });
    }
};
