// Global variable to track completed quests for level up
let completedQuestCount = 0;

// Exercise definitions with "counted" property
const exercises = {
  pushups: { current: 0, max: 100, expPerUnit: 10, stat: 'strength', counted: false },
  situps: { current: 0, max: 100, expPerUnit: 10, stat: 'endurance', counted: false },
  squats: { current: 0, max: 100, expPerUnit: 10, stat: 'strength', counted: false },
  running: { current: 0, max: 10, expPerUnit: 100, stat: 'agility', counted: false }
};

// Player data
const player = {
  level: 1,
  exp: 0,
  maxExp: 1000,
  skillPoints: 0,
  stats: {
    strength: 10,
    endurance: 10,
    agility: 10
  },
  buffs: []
};

// Function to add bonus experience
function addBonusExperience(bonusExp) {
  player.exp += bonusExp;
  updateExpDisplay();
  savePlayerData();
}

// Initialize on window load
window.onload = function() {
  const savedPlayer = localStorage.getItem('player');
  if (savedPlayer) {
    const saved = JSON.parse(savedPlayer);
    player.level = saved.level || player.level;
    player.exp = saved.exp || player.exp;
    player.maxExp = saved.maxExp || player.maxExp;
    player.skillPoints = saved.skillPoints || player.skillPoints;
    player.stats = saved.stats || player.stats;
    player.buffs = saved.buffs || player.buffs;
    
    // Update UI with saved data
    document.getElementById('level').textContent = player.level;
    document.getElementById('current-exp').textContent = Math.floor(player.exp);
    document.getElementById('max-exp').textContent = player.maxExp;
    document.getElementById('strength').textContent = Math.floor(player.stats.strength);
    document.getElementById('endurance').textContent = Math.floor(player.stats.endurance);
    document.getElementById('agility').textContent = Math.floor(player.stats.agility);
    
    const levelProgress = document.getElementById('level-progress');
    const expPercentage = (player.exp / player.maxExp) * 100;
    levelProgress.style.width = `${expPercentage}%`;
  }
  document.getElementById('quest-level').textContent = "Level " + player.level;

  // Event Listeners
  document.getElementById('quest-level').addEventListener('click', openPlayerDetailsModal);
  document.querySelector('.developer').addEventListener('click', resetLevel);
  document.getElementById('closePopup').addEventListener('click', () => {
    document.getElementById('popupModal').style.display = "none";
  });
  document.getElementById('closeTerms').addEventListener('click', () => {
    document.getElementById('termsModal').style.display = "none";
  });
  document.getElementById('termsButton').addEventListener('click', () => {
    document.getElementById('termsModal').style.display = "block";
  });
  document.getElementById('resetQuestsButton').addEventListener('click', () => {
    resetExercises();
    showNotification("Quests have been reset!");
  });

  // Close modals when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target == document.getElementById('popupModal')) {
      document.getElementById('popupModal').style.display = "none";
    }
    if (event.target == document.getElementById('termsModal')) {
      document.getElementById('termsModal').style.display = "none";
    }
  });
};

// Open player details modal
function openPlayerDetailsModal() {
  document.getElementById('modal-level').textContent = player.level;
  document.getElementById('modal-exp').textContent = Math.floor(player.exp);
  document.getElementById('modal-maxexp').textContent = player.maxExp;
  document.getElementById('modal-strength').textContent = Math.floor(player.stats.strength);
  document.getElementById('modal-endurance').textContent = Math.floor(player.stats.endurance);
  document.getElementById('modal-agility').textContent = Math.floor(player.stats.agility);
  document.getElementById('popupModal').style.display = "block";
}

// Save player data to localStorage
function savePlayerData() {
  localStorage.setItem('player', JSON.stringify(player));
}

// Update experience display
function updateExpDisplay() {
  document.getElementById('current-exp').textContent = Math.floor(player.exp);
  document.getElementById('max-exp').textContent = player.maxExp;
  const levelProgress = document.getElementById('level-progress');
  const expPercentage = (player.exp / player.maxExp) * 100;
  levelProgress.style.width = `${expPercentage}%`;
  levelProgress.classList.add('highlight');
  setTimeout(() => levelProgress.classList.remove('highlight'), 500);
}

// Update stat value
function updateStat(stat, amount) {
  player.stats[stat] += amount;
  document.getElementById(stat).textContent = Math.floor(player.stats[stat]);
  savePlayerData();
}

// Update exercise progress
function updateProgress(exercise, amount) {
  const data = exercises[exercise];
  const oldValue = data.current;
  data.current = Math.min(data.current + amount, data.max);
  const progressBar = document.getElementById(`${exercise}-progress`);
  const percentage = (data.current / data.max) * 100;
  progressBar.style.width = `${percentage}%`;
  
  const exerciseItem = progressBar.closest('.exercise-item');
  const span = exerciseItem.querySelector('span');
  const unit = exercise === 'running' ? 'km' : '';
  span.textContent = `${exercise.charAt(0).toUpperCase() + exercise.slice(1)} (${data.current}/${data.max}${unit})`;
  
  if (data.current === data.max) {
    span.classList.add('complete');
    if (!data.counted) {
      data.counted = true;
      completedQuestCount++;
      addBonusExperience(100);
      updateStat(data.stat, 5);
      if (completedQuestCount >= 2) {
        levelUp();
        completedQuestCount -= 2;
      }
    }
  }
}

// Level up function
function levelUp() {
  player.level++;
  showNotification(`Level Up! You are now level ${player.level}!`);
  document.getElementById('quest-level').textContent = "Level " + player.level;
  document.getElementById('level').textContent = player.level;
  savePlayerData();
}

// Reset level
function resetLevel() {
  player.level = 1;
  player.exp = 0;
  player.stats.strength = 10;
  player.stats.endurance = 10;
  player.stats.agility = 10;
  completedQuestCount = 0;
  
  for (let ex in exercises) {
    exercises[ex].counted = false;
    exercises[ex].current = 0;
    const progressBar = document.getElementById(`${ex}-progress`);
    progressBar.style.width = '0%';
    const exerciseItem = progressBar.closest('.exercise-item');
    const span = exerciseItem.querySelector('span');
    const unit = ex === 'running' ? 'km' : '';
    span.textContent = `${ex.charAt(0).toUpperCase() + ex.slice(1)} (0/${exercises[ex].max}${unit})`;
    span.classList.remove('complete');
  }
  
  document.getElementById('quest-level').textContent = "Level " + player.level;
  document.getElementById('level').textContent = player.level;
  document.getElementById('current-exp').textContent = 0;
  document.getElementById('strength').textContent = 10;
  document.getElementById('endurance').textContent = 10;
  document.getElementById('agility').textContent = 10;
  showNotification("Level and stats have been reset!");
  savePlayerData();
}

// Show notification
function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.add('show');
  setTimeout(() => notification.classList.remove('show'), 3000);
}

// Reset exercises
function resetExercises() {
  for (let ex in exercises) {
    exercises[ex].current = 0;
    exercises[ex].counted = false;
    const progressBar = document.getElementById(`${ex}-progress`);
    progressBar.style.width = '0%';
    const exerciseItem = progressBar.closest('.exercise-item');
    const span = exerciseItem.querySelector('span');
    const unit = ex === 'running' ? 'km' : '';
    span.textContent = `${ex.charAt(0).toUpperCase() + ex.slice(1)} (0/${exercises[ex].max}${unit})`;
    span.classList.remove('complete');
  }
}

// Timer functionality
let hours = 23;
let minutes = 59;
let seconds = 59;

function updateTimerDisplay() {
  let h = hours < 10 ? "0" + hours : hours;
  let m = minutes < 10 ? "0" + minutes : minutes;
  let s = seconds < 10 ? "0" + seconds : seconds;
  document.querySelector('.warning').textContent =
    "System Warning: Quest Time Remaining - " + h + ":" + m + ":" + s;
}

function startTimer() {
  setInterval(() => {
    if (hours === 0 && minutes === 0 && seconds === 0) {
      resetExercises();
      hours = 23;
      minutes = 59;
      seconds = 59;
    } else {
      if (seconds === 0) {
        if (minutes === 0) {
          if (hours !== 0) {
            hours--;
            minutes = 59;
            seconds = 59;
          }
        } else {
          minutes--;
          seconds = 59;
        }
      } else {
        seconds--;
      }
    }
    updateTimerDisplay();
  }, 1000);
}

startTimer();
