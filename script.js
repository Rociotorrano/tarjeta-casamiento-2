// --- DOM Elements ---
const introOverlay = document.getElementById('intro-overlay');
const introVideo = document.getElementById('intro-video');
const envelopeWrapper = document.getElementById('envelope-wrapper');
const mainContent = document.getElementById('main-content');
const bgVideoWrapper = document.getElementById('bg-video-wrapper');
const bgVideo = document.getElementById('bg-video');

const btnOpenEnvelope = document.getElementById('btn-open-envelope');
const giftIconTrigger = document.getElementById('gift-icon-trigger');
const rsvpForm = document.getElementById('rsvp-form');
const copyButtons = document.querySelectorAll('.copy-btn');

// --- Control de Burbujas Continuas ---
let bubbleInterval = null; // Guardará el bucle infinito de burbujas

// Genera una burbuja individual dentro del contenedor existente
function createSingleBubble() {
    const bubbleContainer = document.getElementById('bubble-container');
    if (!bubbleContainer) return;

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    
    // Tamaños variados y aleatorios
    const size = Math.random() * 25 + 10; 
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    
    // Velocidad de subida suave
    const duration = Math.random() * 2 + 3; 
    bubble.style.animationDuration = `${duration}s`;
    
    // Balanceo lateral
    const drift = (Math.random() - 0.5) * 140;
    bubble.style.setProperty('--drift', `${drift}px`);
    
    bubbleContainer.appendChild(bubble);

    // Se autodestruye al terminar la animación para no saturar la memoria
    setTimeout(() => { bubble.remove(); }, duration * 1000);
}

// Inicializa el contenedor general y activa la máquina de burbujas continuas
function startContinuousBubbles() {
    let bubbleContainer = document.getElementById('bubble-container');
    if (!bubbleContainer) {
        bubbleContainer = document.createElement('div');
        bubbleContainer.id = 'bubble-container';
        bubbleContainer.style.position = 'fixed';
        bubbleContainer.style.top = '0';
        bubbleContainer.style.left = '0';
        bubbleContainer.style.width = '100%';
        bubbleContainer.style.height = '100%';
        bubbleContainer.style.zIndex = '4500';
        bubbleContainer.style.pointerEvents = 'none';
        document.body.appendChild(bubbleContainer);
        
        // Estilos integrados de las burbujas para mayor seguridad
        const bubbleStyle = document.createElement('style');
        bubbleStyle.innerHTML = `
            .bubble {
                position: absolute;
                bottom: -60px;
                background: rgba(255, 255, 255, 0.65);
                border-radius: 50%;
                box-shadow: inset 0 0 10px rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.04);
                animation: floatUpBubble linear forwards;
            }
            @keyframes floatUpBubble {
                0% { transform: translateY(0) translateX(0); opacity: 0; }
                10% { opacity: 0.85; }
                90% { opacity: 0.85; }
                100% { transform: translateY(-115vh) translateX(var(--drift)); opacity: 0; }
            }
        `;
        document.head.appendChild(bubbleStyle);
    }

    // Lanza una burbuja nueva cada 180 milisegundos sin detenerse
    if (!bubbleInterval) {
        bubbleInterval = setInterval(createSingleBubble, 180);
    }
}

// --- Initial State and Video Autoplay ---
document.addEventListener('DOMContentLoaded', () => {
    initSparkles();
    document.body.style.overflowY = 'hidden';

    // Intenta reproducir el video de intro automáticamente
    if (introVideo) {
        introVideo.play().catch(() => {
            // Si el navegador bloquea el autoplay por políticas de audio, salta directo al botón de entrada
            introOverlay.style.display = 'none';
            envelopeWrapper.style.display = 'flex';
            startContinuousBubbles(); // Inicia burbujas si salta directo
        });
    }
});

// Cuando termina el video de intro, muestra la pantalla intermedia ("Click Aquí")
if (introVideo) {
    introVideo.onended = () => {
        introOverlay.style.opacity = '0';
        setTimeout(() => {
            introOverlay.style.display = 'none';
            envelopeWrapper.style.display = 'flex';
            
            // Arrancan las burbujas infinitas mientras lee la pantalla intermedia
            startContinuousBubbles();
        }, 1200);
    };
}

function openEnvelope() {
    if (envelopeWrapper.classList.contains('open')) return;
    envelopeWrapper.classList.add('open');

    // 1. Ocultar el texto de la intro inmediatamente
    const introContent = document.querySelector('.intro-mirror-content');
    if (introContent) introContent.style.opacity = '0';

    // 2. Frenar la máquina de burbujas infinitas al hacer click
    if (bubbleInterval) {
        clearInterval(bubbleInterval);
        bubbleInterval = null;
    }

    // 3. Dejamos que las burbujas actuales floten hacia afuera de la pantalla y borramos el contenedor
    setTimeout(() => {
        const bubbleContainer = document.getElementById('bubble-container');
        if (bubbleContainer) bubbleContainer.remove();
    }, 1500); 

    // 4. Extinción del video de fondo e intro
    if (bgVideo) {
        bgVideo.pause();
    }
    if (bgVideoWrapper) {
        bgVideoWrapper.remove(); 
    }

    // Cambiamos el fondo del body al color marfil claro de tu invitación
    document.body.style.backgroundColor = '#F9F9F4';

    // 5. Preparar y revelar la invitación limpia con los brillitos de fondo
    mainContent.style.display = 'block';

    setTimeout(() => {
        envelopeWrapper.style.opacity = '0';
        setTimeout(() => {
            envelopeWrapper.style.display = 'none';
            mainContent.classList.add('visible');
            document.body.style.overflowY = 'auto'; // Habilitar scroll del sitio
            initScrollReveal(); // Inicializar efectos al bajar el scroll
        }, 600);
    }, 1000);
}

// --- Desplegar Datos Bancarios ---
if (giftIconTrigger) {
    giftIconTrigger.addEventListener('click', () => {
        const container = document.getElementById('bank-details-container');
        if (container) container.classList.toggle('show');
    });
}

// --- Copiar al Portapapeles ---
copyButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-copy');
        const textToCopy = document.getElementById(targetId).innerText;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("¡Copiado al portapapeles! ✨");
        }).catch(() => {
            alert("No se pudo copiar de forma automática.");
        });
    });
});

// --- Scroll Reveal Animation ---
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    
    reveals.forEach(r => observer.observe(r));
}

// --- Formulario de Confirmación RSVP ---
if (rsvpForm) {
    rsvpForm.onsubmit = function (e) {
        e.preventDefault();
        const btn = this.querySelector('button');
        btn.innerText = "Enviando...";
        btn.disabled = true;

        fetch(this.action, { method: 'POST', body: new FormData(this), mode: 'no-cors' })
            .then(() => {
                this.innerHTML = `
                    <h3 class="section-title">¡Gracias por confirmar!</h3>
                    <p style="font-size: 1.2rem;">Tu respuesta ha sido guardada con éxito.</p>
                `;
            })
            .catch(() => {
                alert("Hubo un error al enviar. Por favor intenta de nuevo.");
                btn.innerText = "Enviar Confirmación";
                btn.disabled = false;
            });
    };
}

// --- Sparkle Canvas Stars Animation ---
function initSparkles() {
    const canvas = document.getElementById('sparkle-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const sparkles = [];
    const SPARKLE_COUNT = 35;

    function createSparkle() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 3 + 1.5,
            maxSize: Math.random() * 6 + 3,
            opacity: Math.random(),
            speed: Math.random() * 0.015 + 0.005,
            phase: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            rotation: Math.random() * Math.PI * 2,
            driftX: (Math.random() - 0.5) * 0.3,
            driftY: (Math.random() - 0.5) * 0.15,
            r: 200 + Math.floor(Math.random() * 55),
            g: 180 + Math.floor(Math.random() * 50),
            b: 120 + Math.floor(Math.random() * 40),
        };
    }

    for (let i = 0; i < SPARKLE_COUNT; i++) {
        sparkles.push(createSparkle());
    }

    function drawStar(cx, cy, spikes, outerR, innerR, rotation, opacity, r, g, b) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerR : innerR;
            const angle = (Math.PI / spikes) * i - Math.PI / 2;
            if (i === 0) {
                ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            } else {
                ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            }
        }
        ctx.closePath();
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity * 0.8})`;
        ctx.shadowBlur = outerR * 3;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, innerR * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 240, ${opacity * 0.9})`;
        ctx.fill();
        ctx.restore();
    }

    function drawCross(cx, cy, size, rotation, opacity, r, g, b) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity * 0.6})`;
        ctx.shadowBlur = size * 2.5;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -size); ctx.lineTo(0, size);
        ctx.moveTo(-size, 0); ctx.lineTo(size, 0);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 240, ${opacity})`;
        ctx.fill();
        ctx.restore();
    }

    let time = 0;
    function animate() {
        ctx.clearRect(0, 0, width, height);
        time += 0.016;

        sparkles.forEach((s, i) => {
            const pulse = Math.sin(time * s.speed * 60 + s.phase);
            const pulse2 = Math.sin(time * s.speed * 30 + s.phase * 1.7);
            s.opacity = 0.3 + (pulse * 0.5 + 0.5) * 0.7;
            const currentSize = s.size + (pulse2 * 0.5 + 0.5) * (s.maxSize - s.size);

            s.x += s.driftX * Math.sin(time * 0.5 + s.phase);
            s.y += s.driftY * Math.cos(time * 0.3 + s.phase);
            s.rotation += s.rotationSpeed;

            if (s.x < -20) s.x = width + 20;
            if (s.x > width + 20) s.x = -20;
            if (s.y < -20) s.y = height + 20;
            if (s.y > height + 20) s.y = -20;

            if (i % 3 === 0) {
                drawCross(s.x, s.y, currentSize * 1.5, s.rotation, s.opacity, s.r, s.g, s.b);
            } else if (i % 3 === 1) {
                drawStar(s.x, s.y, 4, currentSize, currentSize * 0.3, s.rotation, s.opacity, s.r, s.g, s.b);
            } else {
                drawStar(s.x, s.y, 6, currentSize * 0.8, currentSize * 0.35, s.rotation, s.opacity, s.r, s.g, s.b);
            }
        });

        requestAnimationFrame(animate);
    }

    animate();
}