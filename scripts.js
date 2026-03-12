let gameState = {
    clicks: 0,
    clicksPerClick: 1,
    autoRate: 0,
    multiplier: 1,
    prestigeLevel: 0,
    prestigeMultiplier: 1,
    combo: 1,
    comboTimer: null,
    lastClickTime: 0,
    achievements: {},
    upgrades: {
        clicks: 0,
        auto: 0,
        multiplier: 0
    },
    gameStats: {
        totalClicks: 0,
        totalAutoClicks: 0,
        totalSpent: 0,
        prestigeCount: 0,
        clicksPerSecond: 0
    }
};

const upgradesList = [
    { id: 'click1', name: '+1 Click', cost: 10, effect: { clicksPerClick: 1 }, category: 'clicks' },
    { id: 'click5', name: '+5 Clicks', cost: 100, effect: { clicksPerClick: 5 }, category: 'clicks' },
    { id: 'click25', name: '+25 Clicks', cost: 1000, effect: { clicksPerClick: 25 }, category: 'clicks' },
    { id: 'click100', name: '+100 Clicks', cost: 10000, effect: { clicksPerClick: 100 }, category: 'clicks' },
    { id: 'click500', name: '+500 Clicks', cost: 100000, effect: { clicksPerClick: 500 }, category: 'clicks' },
    
    { id: 'auto1', name: 'Basic Auto (+1/s)', cost: 500, effect: { autoRate: 1 }, category: 'auto' },
    { id: 'auto10', name: 'Fast Auto (+10/s)', cost: 5000, effect: { autoRate: 10 }, category: 'auto' },
    { id: 'auto100', name: 'Super Auto (+100/s)', cost: 50000, effect: { autoRate: 100 }, category: 'auto' },
    { id: 'auto500', name: 'Mega Auto (+500/s)', cost: 500000, effect: { autoRate: 500 }, category: 'auto' },
    
    { id: 'mult2', name: 'x2 Multiplier', cost: 1000, effect: { multiplier: 2 }, category: 'multiplier' },
    { id: 'mult3', name: 'x3 Multiplier', cost: 10000, effect: { multiplier: 3 }, category: 'multiplier' },
    { id: 'mult5', name: 'x5 Multiplier', cost: 100000, effect: { multiplier: 5 }, category: 'multiplier' }
];

const achievements = {
    firstClick: { name: '🎯 First Click', desc: 'Click the emoji once', condition: () => gameState.gameStats.totalClicks >= 1 },
    hundredClicks: { name: '💯 Century', desc: 'Reach 100 total clicks', condition: () => gameState.gameStats.totalClicks >= 100 },
    thousandClicks: { name: '🔥 Thousand', desc: 'Reach 1,000 total clicks', condition: () => gameState.gameStats.totalClicks >= 1000 },
    millionClicks: { name: '💎 Million', desc: 'Reach 1,000,000 total clicks', condition: () => gameState.gameStats.totalClicks >= 1000000 },
    firstUpgrade: { name: '⬆️ Upgrade Hunter', desc: 'Buy your first upgrade', condition: () => gameState.upgrades.clicks + gameState.upgrades.auto + gameState.upgrades.multiplier >= 1 },
    firstAuto: { name: '🤖 Automation', desc: 'Buy your first auto-clicker', condition: () => gameState.upgrades.auto >= 1 },
    multiplierMaster: { name: '📈 Multiplier Master', desc: 'Buy 5 multiplier upgrades', condition: () => gameState.upgrades.multiplier >= 5 },
    prestigeOnce: { name: '✨ Prestige', desc: 'Complete your first prestige', condition: () => gameState.gameStats.prestigeCount >= 1 },
    richest: { name: '💰 Richest', desc: 'Have 1,000,000 clicks at once', condition: () => gameState.clicks >= 1000000 },
    comboMaster: { name: '⚡ Combo Master', desc: 'Reach x50 combo', condition: () => gameState.combo >= 50 },
    speedclicker: { name: '🚀 Speed Clicker', desc: 'Achieve 10 clicks per second', condition: () => gameState.gameStats.clicksPerSecond >= 10 },
    autoIncome: { name: '💸 Passive Income', desc: 'Generate 100 clicks per second', condition: () => gameState.autoRate >= 100 }
};

const emojis = ['😀', '😎', '🔥', '🚀', '🌎', '👑', '🐉', '⚡', '🌟', '💎', '🏆', '🎯', '🎪', '🎨', '🎭'];

let currentEmojiIndex = 0;

function handleClick() {
    const clickAmount = gameState.clicksPerClick * gameState.multiplier * gameState.combo * gameState.prestigeMultiplier;
    gameState.clicks += clickAmount;
    gameState.gameStats.totalClicks += gameState.clicksPerClick;
    
    createParticles();
    updateCombo();
    updateDisplay();
    checkAchievements();
    rotateEmoji();
}

function createParticles() {
    const emoji = document.getElementById('emoji');
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = '+' + formatNumber(gameState.clicksPerClick * gameState.multiplier * gameState.combo);
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animation = 'float 1s ease-out forwards';
        emoji.parentElement.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
}

function updateCombo() {
    clearTimeout(gameState.comboTimer);
    gameState.combo = Math.min(gameState.combo + 1, 100);
    gameState.comboTimer = setTimeout(() => {
        gameState.combo = 1;
        updateDisplay();
    }, 3000);
}

function buyUpgrade(upgradeId) {
    const upgrade = upgradesList.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    if (gameState.clicks >= upgrade.cost) {
        gameState.clicks -= upgrade.cost;
        gameState.gameStats.totalSpent += upgrade.cost;
        
        Object.keys(upgrade.effect).forEach(key => {
            gameState[key] += upgrade.effect[key];
        });
        
        gameState.upgrades[upgrade.category]++;
        updateDisplay();
        checkAchievements();
        saveGame();
    }
}

function prestige() {
    const prestigeGain = Math.floor(Math.sqrt(gameState.clicks / 1000));
    if (prestigeGain > 0) {
        gameState.prestigeLevel += prestigeGain;
        gameState.prestigeMultiplier = 1 + (gameState.prestigeLevel * 0.1);
        gameState.gameStats.prestigeCount++;
        
        // Reset game but keep prestige
        gameState.clicks = 0;
        gameState.clicksPerClick = 1;
        gameState.autoRate = 0;
        gameState.multiplier = 1;
        gameState.combo = 1;
        gameState.upgrades = { clicks: 0, auto: 0, multiplier: 0 };
        
        updateDisplay();
        checkAchievements();
        saveGame();
    }
}

function rotateEmoji() {
    const milestone = 100000;
    const newIndex = Math.floor(gameState.gameStats.totalClicks / milestone) % emojis.length;
    if (newIndex !== currentEmojiIndex) {
        currentEmojiIndex = newIndex;
        document.getElementById('emoji').textContent = emojis[currentEmojiIndex];
    }
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return Math.floor(num).toString();
}

function updateDisplay() {
    document.getElementById('score').textContent = 'Clicks: ' + formatNumber(gameState.clicks);
    document.getElementById('combo').textContent = 'Combo: x' + gameState.combo;
    document.getElementById('multiplier').textContent = 'Multiplier: x' + (gameState.multiplier * gameState.prestigeMultiplier).toFixed(1);
    document.getElementById('prestige-system').textContent = 'Prestige: ' + gameState.prestigeLevel + ' (x' + gameState.prestigeMultiplier.toFixed(1) + ')';
    document.getElementById('cps').textContent = 'Clicks/sec: ' + formatNumber(gameState.autoRate);
    
    gameState.gameStats.clicksPerSecond = gameState.autoRate;
    
    // Update upgrade buttons
    upgradesList.forEach(upgrade => {
        const btn = document.getElementById('btn-' + upgrade.id);
        if (btn) {
            btn.disabled = gameState.clicks < upgrade.cost;
            btn.textContent = upgrade.name + ' (Cost: ' + formatNumber(upgrade.cost) + ')';
        }
    });
    
    updateAchievementsDisplay();
    saveGame();
}

function checkAchievements() {
    Object.keys(achievements).forEach(key => {
        if (!gameState.achievements[key] && achievements[key].condition()) {
            gameState.achievements[key] = true;
            showAchievementNotification(achievements[key].name);
        }
    });
}

function showAchievementNotification(name) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.textContent = '🎉 ' + name;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function updateAchievementsDisplay() {
    const container = document.getElementById('achievements');
    container.innerHTML = '<h3>Achievements:</h3>';
    Object.keys(achievements).forEach(key => {
        if (gameState.achievements[key]) {
            const badge = document.createElement('span');
            badge.className = 'achievement-badge';
            badge.title = achievements[key].desc;
            badge.textContent = achievements[key].name;
            container.appendChild(badge);
        }
    });
}

function saveGame() {
    localStorage.setItem('emojiClickerSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('emojiClickerSave');
    if (saved) {
        gameState = JSON.parse(saved);
    }
    updateDisplay();
}

// Auto-click loop
setInterval(() => {
    gameState.clicks += gameState.autoRate * gameState.multiplier * gameState.prestigeMultiplier;
    gameState.gameStats.totalAutoClicks += gameState.autoRate;
    gameState.gameStats.clicksPerSecond = gameState.autoRate;
    updateDisplay();
}, 1000);

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    createUpgradeButtons();
    updateDisplay();
    rotateEmoji();
});

function createUpgradeButtons() {
    const clickContainer = document.getElementById('click-upgrades');
    const autoContainer = document.getElementById('auto-upgrades');
    const multContainer = document.getElementById('mult-upgrades');
    
    upgradesList.forEach(upgrade => {
        const btn = document.createElement('button');
        btn.id = 'btn-' + upgrade.id;
        btn.onclick = () => buyUpgrade(upgrade.id);
        
        if (upgrade.category === 'clicks') clickContainer.appendChild(btn);
        else if (upgrade.category === 'auto') autoContainer.appendChild(btn);
        else multContainer.appendChild(btn);
    });
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        handleClick();
    }
});