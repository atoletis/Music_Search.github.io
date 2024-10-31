// JavaScript for Random Fast Motion
const symbols = document.querySelectorAll('.music-symbol');

function getRandomPosition(element) {
    const x = Math.floor(Math.random() * window.innerWidth);
    const y = Math.floor(Math.random() * window.innerHeight);
    element.style.transform = `translate(${x}px, ${y}px)`;
}

function animateSymbols() {
    symbols.forEach(symbol => {
        getRandomPosition(symbol);
    });
}

// Repeat animation every 0.5 seconds for faster movement
setInterval(animateSymbols, 500);
animateSymbols();  // Initial call to start movement
