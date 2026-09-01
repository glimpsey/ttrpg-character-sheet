let character = {
  "Мощь тела": 0,
  "Контроль движений": 0,
  "Скорость реакции": 0,
  "Острота чувств": 0,
  "Запас сил": 0,
  "Искусность рук": 0,
  "Духовная стойкость": 0,
  "Глубина разума": 0,
  "Поиск деталей": 0,
  "Влияние личности": 0,
  "Жизненный опыт": 0
};

let smallBonuses = {
  "Мощь тела": 0,
  "Контроль движений": 0,
  "Скорость реакции": 0,
  "Острота чувств": 0,
  "Запас сил": 0,
  "Искусность рук": 0,
  "Духовная стойкость": 0,
  "Глубина разума": 0,
  "Поиск деталей": 0,
  "Влияние личности": 0,
  "Жизненный опыт": 0
};

const statIds = {
  "Мощь тела": "physicalpower",
  "Контроль движений": "movementcontrol",
  "Скорость реакции": "reactionspeed",
  "Острота чувств": "acutenessoffeeling",
  "Запас сил": "reserveofstrength",
  "Искусность рук": "manualdexterity",
  "Духовная стойкость": "spiritualfortitude",
  "Глубина разума": "thedepthofthemind",
  "Поиск деталей": "analysisofdetails",
  "Влияние личности": "theinfluenceofpersonality",
  "Жизненный опыт": "lifeexperience"
};

let derived = {
  healthMax: 0,
  healthCurrent: 0,
  moving: 0,
  clockcycklesMax: 0,
  clockcycklesCurrent: 0,
  forcesMax: 0,
  forcesCurrent: 0
};

let skills = [];
let forceDice = 0;

// --- ВИТРИНА И РАСЧЕТ ПУЛОВ ---

function updatePoolDisplays() {
  let totalSpentStats = 0;
  
  for (let key in character) {
    let val = character[key] || 0;
    let bonus = smallBonuses[key] || 0;
    
    if (val > 0) {
      totalSpentStats += (val * (val + 1)) / 2 + bonus;
    } else if (val < 0) {
      let absVal = Math.abs(val);
      totalSpentStats -= (absVal * (absVal + 1)) / 2;
      totalSpentStats += bonus;
    } else {
      totalSpentStats += bonus;
    }
  }
  
  let gmStatInput = document.getElementById("gmStatPoolInput");
  let maxStats = gmStatInput ? Number(gmStatInput.value) || 0 : 0;
  let statsLeft = maxStats - totalSpentStats;
  
  let statLeftSpan = document.getElementById("gmStatPoolLeft");
  if (statLeftSpan) {
    statLeftSpan.innerText = statsLeft;
    statLeftSpan.style.color = statsLeft < 0 ? "#ff5555" : (statsLeft === 0 ? "#aaa" : "#88ff88");
  }

  let totalSpentSkills = 0;
  skills.forEach(skill => {
    let val = skill.value || 1;
    totalSpentSkills += (val * (val + 1)) / 2 + (skill.smallBonuses || 0);
  });

  let gmSkillInput = document.getElementById("gmSkillPoolInput");
  let maxSkills = gmSkillInput ? Number(gmSkillInput.value) || 0 : 0;
  let skillsLeft = maxSkills - totalSpentSkills;

  let skillLeftSpan = document.getElementById("gmSkillPoolLeft");
  if (skillLeftSpan) {
    skillLeftSpan.innerText = skillsLeft;
    skillLeftSpan.style.color = skillsLeft < 0 ? "#ff5555" : (skillsLeft === 0 ? "#aaa" : "#88ff88");
  }
}

function canAddStatBonus() { return true; }
function canAddSkillBonus() { return true; }

function syncInputsWithCharacter() {
  for (let stat in character) {
    let input = document.getElementById(statIds[stat]);
    if (input) {
      input.value = character[stat];
    }
  }
}

function saveToLocalStorage() {
  localStorage.setItem("character", JSON.stringify(character));
  localStorage.setItem("smallBonuses", JSON.stringify(smallBonuses));
}

function addSmallBonus(statName) {
  let val = Number(character[statName]) || 0;
  let need = val === 0 ? 1 : (val > 0 ? val + 1 : Math.abs(val));

  if (smallBonuses[statName] === undefined) smallBonuses[statName] = 0;
  smallBonuses[statName]++;

  if (smallBonuses[statName] >= need) {
    smallBonuses[statName] = 0;
    character[statName] = val + 1;
  }

  saveToLocalStorage();
  syncInputsWithCharacter();
  updateDerivedStats();
  displayDerivedStats();
  updateSmallBonusDisplay();
  updatePoolDisplays();
}

function removeSmallBonus(stat) {
  if ((smallBonuses[stat] || 0) > 0) {
    smallBonuses[stat]--;
  } else {
    character[stat]--;
    let newVal = character[stat];
    let needForNewLevel = newVal >= 0 ? (newVal + 1) : Math.abs(newVal);
    smallBonuses[stat] = needForNewLevel - 1;

    let input = document.getElementById(statIds[stat]);
    if (input) input.value = character[stat];
  }

  saveToLocalStorage();
  updateDerivedStats();
  displayDerivedStats();
  updateSmallBonusDisplay();
  updatePoolDisplays();
}

// --- СИЛЫ И КУБЫ ---

function getForceCost(dice) {
  return (dice * (dice + 1)) / 2;
}

function changeForceDice(amount) {
  let newDice = Math.max(0, forceDice + amount);
  let cost = getForceCost(newDice);

  if (cost > derived.forcesCurrent) return;

  forceDice = newDice;
  updateForceDisplay();
}

function updateForceDisplay() {
  let input = document.getElementById("extraDice");
  let costDisplay = document.getElementById("forceCost");
  let diceInfo = document.getElementById("forceDiceInfo");
  let cost = getForceCost(forceDice);

  if (input) input.value = cost;
  if (costDisplay) costDisplay.innerText = cost;
  if (diceInfo) diceInfo.innerText = forceDice + "d6";
}

function saveStats() {
  for (let stat in character) {
    let input = document.getElementById(statIds[stat]);
    if (input) {
      let newValue = Number(input.value) || 0;
      character[stat] = newValue;
      let newNeed = newValue >= 0 ? (newValue + 1) : Math.abs(newValue);

      if ((smallBonuses[stat] || 0) >= newNeed) {
        smallBonuses[stat] = 0; 
      }
    }
  }
  
  saveToLocalStorage();
  updateDerivedStats();
  displayDerivedStats();
  updateSmallBonusDisplay();
  updatePoolDisplays();
}

function loadSmallBonuses() {
  let saved = localStorage.getItem("smallBonuses");
  if (saved) smallBonuses = JSON.parse(saved);
}

function loadCharacter() {
  let saved = localStorage.getItem("character");
  if (saved) character = JSON.parse(saved);
}

function updateDerivedStats() {
  let oldHealthMax = derived.healthMax;
  let oldForcesMax = derived.forcesMax;
  let oldClockMax = derived.clockcycklesMax;

  derived.healthMax = 9 + (Number(character["Мощь тела"]) || 0) * 3;
  derived.moving = 3 + (Number(character["Контроль движений"]) || 0);
  derived.clockcycklesMax = 3 + (Number(character["Скорость реакции"]) || 0);
  derived.forcesMax = 9 + (Number(character["Запас сил"]) || 0) * 3;

  if (derived.healthCurrent === 0 && oldHealthMax === 0) derived.healthCurrent = derived.healthMax;
  if (derived.forcesCurrent === 0 && oldForcesMax === 0) derived.forcesCurrent = derived.forcesMax;
  if (derived.clockcycklesCurrent === 0 && oldClockMax === 0) derived.clockcycklesCurrent = derived.clockcycklesMax;
}

function updateSmallBonusDisplay() {
  let html = "";
  for (let stat in character) {
    let current = smallBonuses[stat] || 0;
    let val = character[stat] || 0;
    let need = val >= 0 ? (val + 1) : Math.abs(val);
    let inputId = statIds[stat];

    html += `
      <div class="stat-row" style="display: flex; align-items: center; margin-bottom: 14px; gap: 10px;">
        <span style="font-weight: bold; color: #fce1d4; flex: 1; font-size: 0.95em; min-width: 140px;">${stat}:</span>
        <input id="${inputId}" type="number" value="${val}" onchange="saveStats()"
               style="width: 45px; padding: 4px; text-align: center; border-radius: 4px; border: 1px solid #444; background-color: #222; color: #fff; height: 28px; box-sizing: border-box;">
        <div class="small-bonus-block" style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.08); padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); gap: 4px;">
          <button onclick="removeSmallBonus('${stat}')" 
                  style="cursor: pointer; border: none; background: transparent; color: #fce1d4; font-size: 0.8em; padding: 2px 6px;">➖</button>
          <span style="font-size: 0.85em; min-width: 30px; text-align: center; color: #bbb; font-family: monospace;">${current}/${need}</span>
          <button onclick="addSmallBonus('${stat}')" 
                  style="cursor: pointer; border: none; background: transparent; color: #fce1d4; font-size: 0.8em; padding: 2px 6px;">➕</button>
        </div>
      </div>
    `;
  }

  let container = document.getElementById("mainStatsContainer");
  if (container) container.innerHTML = html;
}

function getHealthColor(current, max) {
  if (max <= 0) return "#fff";
  let ratio = current / max;
  if (ratio <= 1/3) return "#ff5555";
  if (ratio <= 2/3) return "#FF8000";
  return "#ffffff";
}

function displayDerivedStats() {
  let container = document.getElementById("derivedStats");
  if (!container) return;

  let hpColor = getHealthColor(derived.healthCurrent, derived.healthMax);

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
      <span style="color: #fce1d4; font-weight: bold;">Здоровье:</span>
      <div style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.08); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); gap: 4px; min-width: 95px; justify-content: space-between; white-space: nowrap;">
        <button onclick="changeDerivedValue('health', -1)" style="cursor: pointer; border: none; background: transparent; color: #ff8888; font-size: 0.8em; padding: 2px 4px;">➖</button>
        <div style="display:flex; align-items:center; flex:1; justify-content:center; gap:2px;">
          <input type="number" value="${derived.healthCurrent}" min="0" max="${derived.healthMax}" onchange="setDerivedValue('health', this.value)"
            style="width:42px; text-align:center; background:#222; color:${hpColor}; border:1px solid #444; border-radius:4px;">
          <span style="color:#fff;">/${derived.healthMax}</span>
        </div>
        <button onclick="changeDerivedValue('health', 1)" style="cursor: pointer; border: none; background: transparent; color: #88ff88; font-size: 0.8em; padding: 2px 4px;">➕</button>
      </div>
    </div>

    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
      <span style="color: #fce1d4; font-weight: bold;">Такты:</span>
      <div style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.08); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); gap: 4px; min-width: 95px; justify-content: space-between; white-space: nowrap;">
        <button onclick="changeDerivedValue('clockcyckles', -1)" style="cursor: pointer; border: none; background: transparent; color: #ff8888; font-size: 0.8em; padding: 2px 4px;">➖</button>
        <div style="display:flex; align-items:center; flex:1; justify-content:center; gap:2px;">
          <input type="number" value="${derived.clockcycklesCurrent}" min="0" max="${derived.clockcycklesMax}" onchange="setDerivedValue('clockcyckles', this.value)"
            style="width:42px; text-align:center; background:#222; color:#fff; border:1px solid #444; border-radius:4px;">
          <span style="color: #fff;">/${derived.clockcycklesMax}</span>
        </div>
        <button onclick="changeDerivedValue('clockcyckles', 1)" style="cursor: pointer; border: none; background: transparent; color: #88ff88; font-size: 0.8em; padding: 2px 4px;">➕</button>
      </div>
    </div>

    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
      <span style="color: #fce1d4; font-weight: bold;">Силы:</span>
      <div style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.08); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); gap: 4px; min-width: 95px; justify-content: space-between; white-space: nowrap;">
        <button onclick="changeDerivedValue('forces', -1)" style="cursor: pointer; border: none; background: transparent; color: #ff8888; font-size: 0.8em; padding: 2px 4px;">➖</button>
        <div style="display:flex; align-items:center; flex:1; justify-content:center; gap:2px;">
          <input type="number" value="${derived.forcesCurrent}" min="0" max="${derived.forcesMax}" onchange="setDerivedValue('forces', this.value)"
            style="width:42px; text-align:center; background:#222; color:#fff; border:1px solid #444; border-radius:4px;">
          <span style="color: #fff;">/${derived.forcesMax}</span>
        </div>
        <button onclick="changeDerivedValue('forces', 1)" style="cursor: pointer; border: none; background: transparent; color: #88ff88; font-size: 0.8em; padding: 2px 4px;">➕</button>
      </div>
    </div>

    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
      <span style="color: #fce1d4; font-weight: bold;">Перемещение:</span>
      <span style="color:#fff; font-family: monospace; font-size:1.35em; line-height:30px; display:inline-block; width:42px; text-align:center;">
        ${derived.moving}
      </span>
    </div>
  `;
}

function setDerivedValue(statType, value) {
  value = Number(value) || 0;

  if (statType === "health") derived.healthCurrent = Math.max(0, Math.min(value, derived.healthMax));
  else if (statType === "clockcyckles") derived.clockcycklesCurrent = Math.max(0, Math.min(value, derived.clockcycklesMax));
  else if (statType === "forces") derived.forcesCurrent = Math.max(0, Math.min(value, derived.forcesMax));

  localStorage.setItem("derivedStatsState", JSON.stringify(derived));
  displayDerivedStats();
}

function changeDerivedValue(statType, amount) {
  if (statType === 'health') derived.healthCurrent = Math.min(derived.healthMax, Math.max(0, derived.healthCurrent + amount));
  else if (statType === 'clockcyckles') derived.clockcycklesCurrent = Math.min(derived.clockcycklesMax, Math.max(0, derived.clockcycklesCurrent + amount));
  else if (statType === 'forces') derived.forcesCurrent = Math.min(derived.forcesMax, Math.max(0, derived.forcesCurrent + amount));
  
  localStorage.setItem("derivedStatsState", JSON.stringify(derived));
  displayDerivedStats();
}

// --- МАСТЕРСТВА ---

function addSkill() {
  let nameInput = document.getElementById("skillName");
  let valueInput = document.getElementById("skillValue");
  let name = nameInput ? nameInput.value.trim() : "";
  let value = valueInput ? Number(valueInput.value) || 0 : 0;

  if (name === "") {
    alert("Введите название мастерства.");
    return;
  }

  if (value < 1) value = 1;

  skills.push({ name: name, value: value, smallBonuses: 0 });
  localStorage.setItem("skills", JSON.stringify(skills));

  updateSkillList();
  updatePoolDisplays();
  
  if (nameInput) nameInput.value = "";
  if (valueInput) valueInput.value = 0;
}

function addSkillSmallBonus(index) {
  let skill = skills[index];
  let val = skill.value;
  let need = val + 1;

  if (skill.smallBonuses === undefined) skill.smallBonuses = 0;
  skill.smallBonuses++;

  if (skill.smallBonuses >= need) {
    skill.smallBonuses = 0;
    skill.value++;
  }

  localStorage.setItem("skills", JSON.stringify(skills));
  updateSkillList();
  updatePoolDisplays();
}

function removeSkillSmallBonus(skillIndex) {
  let skill = skills[skillIndex];
  
  if ((skill.smallBonuses || 0) > 0) {
    skill.smallBonuses--;
  } else if (skill.value > 1) {
    skill.value--;
    skill.smallBonuses = skill.value; // needForNewLevel - 1
  }

  localStorage.setItem("skills", JSON.stringify(skills));
  updateSkillList();
  updatePoolDisplays();
}

function deleteSkill(index) {
  skills.splice(index, 1);
  localStorage.setItem("skills", JSON.stringify(skills));
  updateSkillList();
  updatePoolDisplays();
}

function toggleGmPanel() {
  let panel = document.getElementById("gmPointBuyPanel");
  if (panel) {
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  }
}

function changeSkill(index, amount) {
  skills[index].value = Math.max(1, skills[index].value + amount);
  localStorage.setItem("skills", JSON.stringify(skills));
  updateSkillList();
}

function updateSkillList() {
  let html = "";
  skills.forEach((skill, index) => {
    let current = skill.smallBonuses || 0;
    let val = skill.value;
    let need = val + 1;

    html += `
      <div class="skill-item" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; width: 100%; padding-right: 15px; box-sizing: border-box;">
        <span style="color: #fff; font-size: 0.95em;"><b>${skill.name}</b> (${val >= 0 ? "+" : ""}${val})</span>
        <div class="skill-controls" style="display: flex; gap: 12px; align-items: center;">
          <div class="small-bonus-block" style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.08); padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); gap: 4px;">
            <button onclick="removeSkillSmallBonus(${index})" style="cursor: pointer; border: none; background: transparent; color: #fce1d4; font-size: 0.8em; padding: 2px 6px;">➖</button>
            <span style="font-size: 0.85em; min-width: 30px; text-align: center; color: #bbb; font-family: monospace;">${current}/${need}</span>
            <button onclick="addSkillSmallBonus(${index})" style="cursor: pointer; border: none; background: transparent; color: #fce1d4; font-size: 0.8em; padding: 2px 6px;">➕</button>
          </div>
          <button onclick="deleteSkill(${index})" style="cursor: pointer; border: none; background: transparent; color: #ff8888; font-size: 0.9em; padding: 2px 4px;">❌</button>
        </div>
      </div>
    `;
  });

  let listContainer = document.getElementById("skillList");
  if (listContainer) listContainer.innerHTML = html;

  let select = document.getElementById("skillSelect");
  if (select) {
    select.innerHTML = `<option value="none">Без мастерства</option>`;
    skills.forEach(skill => {
      select.innerHTML += `<option value="${skill.name}">${skill.name}</option>`;
    });
  }
}

function loadSkills() {
  let saved = localStorage.getItem("skills");
  if (saved) skills = JSON.parse(saved);
  updateSkillList();
}

function resetAllData() {
  if (confirm("Вы уверены, что хотите полностью стереть данные персонажа и сбросить лист?")) {
    localStorage.clear();
    window.location.reload();
  }
}

// --- МЕХАНИКА БРОСКОВ И РИСКА ---

function convertRoll(value, sides) {
  if (sides == 6) {
    if (value == 1) return 0;
    if (value == 2 || value == 3) return 1;
    if (value == 4 || value == 5) return 2;
    if (value == 6) return 3;
  }
  if (sides == 4) {
    if (value == 1) return 0;
    if (value == 2 || value == 3) return 1;
    if (value == 4) return 2;
  }
  if (sides == 8) {
    if (value == 1) return 0;
    if (value == 2 || value == 3) return 1;
    if (value == 4 || value == 5) return 2;
    if (value == 6 || value == 7) return 3;
    if (value == 8) return 4;
  }
  if (sides == 10) {
    if (value == 1) return 0;
    if (value == 2 || value == 3) return 1;
    if (value == 4 || value == 5) return 2;
    if (value == 6 || value == 7) return 3;
    if (value == 8 || value == 9) return 4;
    if (value == 10) return 5;
  }
  if (sides == 12) {
    if (value == 1) return 0;
    if (value == 2 || value == 3) return 1;
    if (value == 4 || value == 5) return 2;
    if (value == 6 || value == 7) return 3;
    if (value == 8 || value == 9) return 4;
    if (value == 10 || value == 11) return 5;
    if (value == 12) return 6;
  }
  return value;
}

function updateRiskInputsDefaults() {
  let statSelect = document.getElementById("statSelect");
  let skillSelect = document.getElementById("skillSelect");
  if (!statSelect || !skillSelect) return;

  let stat = statSelect.value;
  let statValue = (stat === "0") ? 0 : Math.abs(character[stat] || 0);

  let skillName = skillSelect.value;
  let skillValue = 0;
  if (skillName && skillName !== "none") {
    let skill = skills.find(s => s.name == skillName);
    if (skill) skillValue = Math.min(Math.abs(skill.value), statValue);
  }

  let d10Max = skillValue;
  let d6Max = statValue - d10Max;

  let d6SuccInput = document.getElementById("d6Success");
  let d6RiskInput = document.getElementById("d6Risk");
  let d10SuccInput = document.getElementById("d10Success");
  let d10RiskInput = document.getElementById("d10Risk");

  if (d6SuccInput) d6SuccInput.value = d6Max;
  if (d6RiskInput) d6RiskInput.value = 0;
  if (d10SuccInput) d10SuccInput.value = d10Max;
  if (d10RiskInput) d10RiskInput.value = 0;

  let forcesRisk = document.getElementById("forcesRisk");
  let forcesSuccess = document.getElementById("forcesSuccess");
  if (forcesRisk) forcesRisk.value = 0;
  if (forcesSuccess) forcesSuccess.value = 0;

  validateRiskInputs();
}

function validateRiskInputs() {
  let statSelect = document.getElementById("statSelect");
  let skillSelect = document.getElementById("skillSelect");
  if (!statSelect || !skillSelect) return;

  let stat = statSelect.value;
  let statValue = (stat === "0") ? 0 : Math.abs(character[stat] || 0);

  let skillName = skillSelect.value;
  let skillValue = 0;
  if (skillName && skillName !== "none") {
    let skill = skills.find(s => s.name == skillName);
    if (skill) skillValue = Math.min(Math.abs(skill.value), statValue);
  }

  let maxD10 = skillValue;
  let maxD6 = statValue - maxD10;

  let d6RiskInput = document.getElementById("d6Risk");
  let d6SuccInput = document.getElementById("d6Success");

  let d6Risk = Math.max(0, Number(d6RiskInput?.value) || 0);
  if (d6Risk > maxD6) d6Risk = maxD6;
  let d6Succ = maxD6 - d6Risk;

  if (d6RiskInput) d6RiskInput.value = d6Risk;
  if (d6SuccInput) d6SuccInput.value = d6Succ;

  let d10RiskInput = document.getElementById("d10Risk");
  let d10SuccInput = document.getElementById("d10Success");

  let d10Risk = Math.max(0, Number(d10RiskInput?.value) || 0);
  if (d10Risk > maxD10) d10Risk = maxD10;
  let d10Succ = maxD10 - d10Risk;

  if (d10RiskInput) d10RiskInput.value = d10Risk;
  if (d10SuccInput) d10SuccInput.value = d10Succ;

  let forcesRiskInput = document.getElementById("forcesRisk");
  let forcesSuccessInput = document.getElementById("forcesSuccess");

  let forcesRiskDice = Math.max(0, Number(forcesRiskInput?.value) || 0);
  let forcesSuccessDice = Math.max(0, Number(forcesSuccessInput?.value) || 0);

  let totalForceCost = getForceCost(forcesRiskDice) + getForceCost(forcesSuccessDice);

  if (totalForceCost > derived.forcesCurrent) {
    if (forcesSuccessInput) forcesSuccessInput.value = 0;
    if (forcesRiskInput) forcesRiskInput.value = 0;
  }
}

function toggleRiskUI() {
  let isChecked = document.getElementById("useRiskSystem")?.checked || false;
  let block = document.getElementById("riskAllocationBlock");
  let extraDice = document.getElementById("extraDice");
  let normalBlock = document.getElementById("normalForcesBlock");

  if (block) block.style.display = isChecked ? "block" : "none";
  if (normalBlock) normalBlock.style.display = isChecked ? "none" : "block";

  if (isChecked) {
    updateRiskInputsDefaults();
    if (extraDice) extraDice.readOnly = true;
  } else {
    if (extraDice) extraDice.readOnly = false;
  }
}

function rollDice() {
  let stat = document.getElementById("statSelect")?.value || "0";
  let statValue = (stat === "0") ? 0 : (character[stat] || 0);

  let skillName = document.getElementById("skillSelect")?.value || "none";
  let skillValue = 0;
  if (skillName !== "none") {
    let skill = skills.find(s => s.name == skillName);
    if (skill) skillValue = skill.value;
  }

  let isRiskMode = document.getElementById("useRiskSystem")?.checked || false;

  if (!isRiskMode) {
    // --- ОБЫЧНЫЙ БРОСОК ---
    let forcesSpent = getForceCost(forceDice);

    if (forcesSpent > derived.forcesCurrent) {
      alert(`Недостаточно Сил! Нужно: ${forcesSpent}, доступно: ${derived.forcesCurrent}`);
      return;
    }

    if (forcesSpent > 0) {
      derived.forcesCurrent -= forcesSpent;
      localStorage.setItem("derivedStatsState", JSON.stringify(derived));
      displayDerivedStats();
    }

    let statTotal = 0, skillTotal = 0, extraTotal = 0, total = 0;
    let statOutput = "", skillOutput = "", extraOutput = "";

    let statDice = Math.abs(statValue);
    let skillDice = Math.min(Math.abs(skillValue), statDice);
    let normalDice = statDice - skillDice;

    for (let i = 0; i < normalDice; i++) {
      let roll = Math.floor(Math.random() * 6) + 1;
      let converted = convertRoll(roll, 6);
      if (statValue >= 0) { statTotal += converted; total += converted; } 
      else { statTotal -= converted; total -= converted; }
      statOutput += `${roll} (${converted}) `;
    }

    for (let i = 0; i < skillDice; i++) {
      let roll = Math.floor(Math.random() * 10) + 1;
      let converted = convertRoll(roll, 10);
      if (skillValue >= 0) { skillTotal += converted; total += converted; } 
      else { skillTotal -= converted; total -= converted; }
      skillOutput += `${roll} (${converted}) `;
    }

    // --- ВНУТРИ rollDice(), В СЕКЦИИ ОБЫЧНОГО БРОСКА (!isRiskMode) ---

for (let i = 0; i < forceDice; i++) {
  let roll = Math.floor(Math.random() * 6) + 1;
  let converted = convertRoll(roll, 6);

  extraTotal += converted;
  total += converted;

  // Форматируем так же, как и обычные кубы: через пробел
  extraOutput += `${roll} (${converted}) `;
}

let resElem = document.getElementById("result");
if (resElem) {
  resElem.innerHTML = `
    <b>Характеристика:</b> ${stat === "0" ? "Без модификатора" : stat} (${statValue >= 0 ? "+" : ""}${statValue})<br><br>
    Обычные кубы (d6):<br>${statOutput || "нет"}<br>
    Сумма характеристики: ${statTotal}<hr>
    <b>Мастерство:</b> ${skillName == "none" ? "нет" : skillName}<br><br>
    Усиленные кубы (d10):<br>${skillOutput || "нет"}<br>
    Сумма мастерства: ${skillTotal}<hr>
    <b>Вложено Сил:</b> ${forcesSpent}<br><br>
    Кубы Сил (d6):<br>${extraOutput.trim() || "нет"}<br>
    Сумма Сил: ${extraTotal}<hr>
    Итог: <b>${total}</b>
  `;
}

  } else {
    // --- БРОСОК В РЕЖИМЕ РИСКА ---
    validateRiskInputs();

    let d6Risk = Number(document.getElementById("d6Risk")?.value) || 0;
    let d6Succ = Number(document.getElementById("d6Success")?.value) || 0;
    let d10Risk = Number(document.getElementById("d10Risk")?.value) || 0;
    let d10Succ = Number(document.getElementById("d10Success")?.value) || 0;

    let forcesRiskDice = Number(document.getElementById("forcesRisk")?.value) || 0;
    let forcesSuccessDice = Number(document.getElementById("forcesSuccess")?.value) || 0;

    let totalForcesSpent = getForceCost(forcesRiskDice) + getForceCost(forcesSuccessDice);

    if (derived.forcesCurrent < totalForcesSpent) {
      alert(`Недостаточно Сил! Нужно: ${totalForcesSpent}, доступно: ${derived.forcesCurrent}`);
      return;
    }

    // ЕДИНОРАЗОВОЕ списание
    if (totalForcesSpent > 0) {
      derived.forcesCurrent -= totalForcesSpent;
      localStorage.setItem("derivedStatsState", JSON.stringify(derived));
      displayDerivedStats();
    }

    let riskSuccTotal = 0, riskDamageTotal = 0;
    let riskLogs = [], succLogs = [];

    // 1. КУБЫ РИСКА
    for (let i = 0; i < d6Risk; i++) {
      let r = Math.floor(Math.random() * 6) + 1;
      let c = convertRoll(r, 6);
      riskDamageTotal += c;
      riskLogs.push(`d6: ${r} (${c})`);
    }
    for (let i = 0; i < d10Risk; i++) {
      let r = Math.floor(Math.random() * 10) + 1;
      let c = convertRoll(r, 10);
      riskDamageTotal += c;
      riskLogs.push(`d10: ${r} (${c})`);
    }
    for (let i = 0; i < forcesRiskDice; i++) {
      let r = Math.floor(Math.random() * 6) + 1;
      let c = convertRoll(r, 6);
      riskDamageTotal += c;
      riskLogs.push(`d6 (Сила): ${r} (${c})`);
    }

    // 2. КУБЫ УСПЕХА
    for (let i = 0; i < d6Succ; i++) {
      let r = Math.floor(Math.random() * 6) + 1;
      let c = convertRoll(r, 6);
      riskSuccTotal += c;
      succLogs.push(`d6: ${r} (${c})`);
    }
    for (let i = 0; i < d10Succ; i++) {
      let r = Math.floor(Math.random() * 10) + 1;
      let c = convertRoll(r, 10);
      riskSuccTotal += c;
      succLogs.push(`d10: ${r} (${c})`);
    }
    for (let i = 0; i < forcesSuccessDice; i++) {
      let r = Math.floor(Math.random() * 6) + 1;
      let c = convertRoll(r, 6);
      riskSuccTotal += c;
      succLogs.push(`d6 (Сила): ${r} (${c})`);
    }

    let resElem = document.getElementById("result");
    if (resElem) {
      resElem.innerHTML = `
        <div style="font-weight:bold; color:#fce1d4; margin-bottom:12px;">Бросок: Риск и Успех</div>
        <div style="display:flex; justify-content:space-between; gap:10px;">
          <div style="flex:1; background:rgba(255, 255, 255, 0.05); padding:10px; border-radius:6px; border:1px solid rgba(255, 255, 255, 0.2);">
            <b style="color:#ffffff;">РИСК: ${riskDamageTotal}</b><br>
            <div style="font-size:0.8em; color:#bbb; margin-top:6px; line-height: 1.4;">
              ${riskLogs.join("<br>") || "нет кубов"}
            </div>
          </div>
          <div style="flex:1; background:rgba(255, 255, 255, 0.05); padding:10px; border-radius:6px; border:1px solid rgba(255, 255, 255, 0.2);">
            <b style="color:#ffffff;">УСПЕХ: ${riskSuccTotal}</b><br>
            <div style="font-size:0.8em; color:#bbb; margin-top:6px; line-height: 1.4;">
              ${succLogs.join("<br>") || "нет кубов"}
            </div>
          </div>
        </div>
      `;
    }
  }
}

// --- ИНИЦИАЛИЗАЦИЯ И СЛУШАТЕЛИ СОБЫТИЙ ---

window.addEventListener("DOMContentLoaded", () => {
  loadCharacter();
  loadSmallBonuses();
  loadSkills();

  updateDerivedStats();

  updateSmallBonusDisplay();
  displayDerivedStats();
  updateSkillList();
  updatePoolDisplays();

  // Навешивание обработчиков
  document.getElementById("statSelect")?.addEventListener("change", () => {
    if (document.getElementById("useRiskSystem")?.checked) updateRiskInputsDefaults();
  });
  
  document.getElementById("skillSelect")?.addEventListener("change", () => {
    if (document.getElementById("useRiskSystem")?.checked) updateRiskInputsDefaults();
  });

  document.getElementById("forcesRisk")?.addEventListener("input", validateRiskInputs);
  document.getElementById("forcesSuccess")?.addEventListener("input", validateRiskInputs);
  document.getElementById("d6Risk")?.addEventListener("input", validateRiskInputs);
  document.getElementById("d10Risk")?.addEventListener("input", validateRiskInputs);
});
