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

function updatePoolDisplays() {
  // --- 1. СЧИТАЕМ ПЛЮСЫ ХАРАКТЕРИСТИК ---
  let totalSpentStats = 0;
  
  for (let key in character) {
    let val = character[key] || 0;
    
    if (val > 0) {
      // Положительная характеристика: тратит очки из пула
      totalSpentStats += (val * (val + 1)) / 2;
      // Каждый накопленный плюс приближает к еще большему значению (тратит очки)
      totalSpentStats += (smallBonuses[key] || 0);
    } 
    else if (val < 0) {
      // Отрицательная характеристика: ВОЗВРАЩАЕТ очки в пул ГМа (ценой дебаффа)
      let absVal = Math.abs(val);
      totalSpentStats -= (absVal * (absVal + 1)) / 2;
      
      // Малые плюсы в минусовой зоне двигают характеристику обратно к НУЛЮ.
      // То есть они уменьшают штраф и "выкупают" её обратно (тратят очки пула)
      totalSpentStats += (smallBonuses[key] || 0);
    }
    else {
      // Если характеристика равна 0, просто учитываем малые плюсы на ней (они тратят очки)
      totalSpentStats += (smallBonuses[key] || 0);
    }
  }
  
  let maxStats = Number(document.getElementById("gmStatPoolInput").value) || 0;
  let statsLeft = maxStats - totalSpentStats;
  
  let statLeftSpan = document.getElementById("gmStatPoolLeft");
  if (statLeftSpan) {
    statLeftSpan.innerText = statsLeft;
    statLeftSpan.style.color = statsLeft < 0 ? "#ff5555" : (statsLeft === 0 ? "#aaa" : "#88ff88");
  }

// --- 2. СЧИТАЕМ ПЛЮСЫ МАСТЕРСТВ ---
  let totalSpentSkills = 0;
  
  skills.forEach(skill => {
    let val = skill.value || 1; // Текущий уровень (минимум 1)
    
    // Чистая стоимость уровня по формуле n*(n+1)/2
    totalSpentSkills += (val * (val + 1)) / 2;
    
    // Добавляем малые плюсы, которые влиты СВЕРХ текущего уровня
    totalSpentSkills += (skill.smallBonuses || 0);
  });

  let maxSkills = Number(document.getElementById("gmSkillPoolInput").value) || 0;
  let skillsLeft = maxSkills - totalSpentSkills;

  let skillLeftSpan = document.getElementById("gmSkillPoolLeft");
  if (skillLeftSpan) {
    skillLeftSpan.innerText = skillsLeft;
    skillLeftSpan.style.color = skillsLeft < 0 ? "#ff5555" : (skillsLeft === 0 ? "#aaa" : "#88ff88");
  }
}

function canAddStatBonus() {
  return true; // Блокировка отключена, можно добавлять всегда
}

function canAddSkillBonus() {
  return true; // Блокировка отключена, можно добавлять всегда
}

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

  localStorage.setItem("character", JSON.stringify(character));
  localStorage.setItem("smallBonuses", JSON.stringify(smallBonuses));
  
  syncInputsWithCharacter();
  updateDerivedStats();
  displayDerivedStats();
  updateSmallBonusDisplay();
  updatePoolDisplays(); // Пул просто пересчитает цифру на экране
}

function removeSmallBonus(stat) {
  let val = character[stat];
  
  if (smallBonuses[stat] > 0) {
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
  updatePoolDisplays(); // <-- ВОТ ЭТОТ ВЫЗОВ ОБЯЗАТЕЛЬНО НУЖЕН ЗДЕСЬ!
}

let derived = {
  healthMax: 0,
  healthCurrent: 0,
  moving: 0,
  clockcycklesMax: 0,
  clockcycklesCurrent: 0,
  forcesMax: 0,
  forcesCurrent: 0
};

function saveStats() {
  for (let stat in character) {
    let input = document.getElementById(statIds[stat]);
    if (input) {
      let newValue = Number(input.value) || 0;
      character[stat] = newValue;

      // Корректный перерасчет порога с учетом знака характеристики
      let newNeed = newValue >= 0 ? (newValue + 1) : Math.abs(newValue);

      // Если малые бонусы вылетели за пределы нового порога, сбрасываем их
      if ((smallBonuses[stat] || 0) >= newNeed) {
        smallBonuses[stat] = 0; 
      }
    }
  }
  
  saveToLocalStorage();
  updateDerivedStats();
  displayDerivedStats();
  updateSmallBonusDisplay();
  updatePoolDisplays(); // Пересчитываем пул после ручного ввода
}

function loadSmallBonuses() {
  let saved = localStorage.getItem("smallBonuses");
  if (saved) {
    smallBonuses = JSON.parse(saved);
  }
}

function loadCharacter() {
  let saved = localStorage.getItem("character");
  if (saved) {
    character = JSON.parse(saved);
  }
}

function updateDerivedStats() {
  let oldHealthMax = derived.healthMax;
  let oldForcesMax = derived.forcesMax;
  let oldClockMax = derived.clockcycklesMax;

  // Расчет максимумов по твоим формулам
  derived.healthMax = 9 + (Number(character["Мощь тела"]) || 0) * 3;
  derived.moving = 3 + (Number(character["Контроль движений"]) || 0);
  derived.clockcycklesMax = 3 + (Number(character["Скорость реакции"]) || 0);
  derived.forcesMax = 9 + (Number(character["Запас сил"]) || 0) * 3;

  // Если это первая загрузка (текущие значения равны 0), приравниваем их к максимуму
  if (derived.healthCurrent === 0 && oldHealthMax === 0) derived.healthCurrent = derived.healthMax;
  if (derived.forcesCurrent === 0 && oldForcesMax === 0) derived.forcesCurrent = derived.forcesMax;
  if (derived.clockcycklesCurrent === 0 && oldClockMax === 0) derived.clockcycklesCurrent = derived.clockcycklesMax;
}

function updateSmallBonusDisplay() {
  let html = "";

  for (let stat in character) {
    let current = smallBonuses[stat];
    let val = character[stat];
    // Рассчитываем правильный порог для отображения в интерфейсе
    let need = val >= 0 ? (val + 1) : Math.abs(val);
    let inputId = statIds[stat];

    // Если характеристика отрицательная, можно визуально подсказать, что мы копим "минусики" к нулю
    // Но математически это те же самые аккуратные кнопочки
    html += `
      <div class="stat-row" style="display: flex; align-items: center; margin-bottom: 14px; gap: 10px;">
        <!-- Название характеристики -->
        <span style="font-weight: bold; color: #fce1d4; flex: 1; font-size: 0.95em; min-width: 140px;">${stat}:</span>
        
        <!-- Поле ввода характеристики -->
        <input id="${inputId}" type="number" value="${character[stat]}" onchange="saveStats()"
               style="width: 45px; padding: 4px; text-align: center; border-radius: 4px; border: 1px solid #444; background-color: #222; color: #fff; height: 28px; box-sizing: border-box;">
        
        <!-- Аккуратный компактный блок малых плюсов/минусов -->
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
  if (container) {
    container.innerHTML = html;
  }
}

function getHealthColor(current, max) {
  if (max <= 0) return "#fff"; // Защита от деления на ноль
  
  let ratio = current / max;
  
  if (ratio <= 1/3) {
    return "#ff5555"; // Ярко-красный для критического состояния (1/3 и меньше)
  } else if (ratio <= 2/3) {
    return "#FF8000"; // Оранжевый для ранений (между 1/3 и 2/3)
  }
  
  return "#ffffff"; // Белый, если здоровье в порядке (больше 2/3)
}

function displayDerivedStats() {
  let container = document.getElementById("derivedStats");
  if (!container) return;

  // Вычисляем цвет для текущего здоровья
  let hpColor = getHealthColor(derived.healthCurrent, derived.healthMax);

  container.innerHTML = `
    <!-- Здоровье -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
      <span style="color: #fce1d4; font-weight: bold;">Здоровье:</span>
      <div style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.08); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); gap: 4px; min-width: 95px; justify-content: space-between; white-space: nowrap;">
        <button onclick="changeDerivedValue('health', -1)" style="cursor: pointer; border: none; background: transparent; color: #ff8888; font-size: 0.8em; padding: 2px 4px;">➖</button>
        <!-- Меняем цвет здесь с помощью переменной hpColor -->
        <div style="display:flex; align-items:center; flex:1; justify-content:center; gap:2px;">
  <input
    type="number"
    value="${derived.healthCurrent}"
    min="0"
    max="${derived.healthMax}"
    onchange="setDerivedValue('health', this.value)"
    style="width:42px; text-align:center; background:#222; color:${hpColor}; border:1px solid #444; border-radius:4px;">
  <span style="color:#fff;">/${derived.healthMax}</span>
</div>
        <button onclick="changeDerivedValue('health', 1)" style="cursor: pointer; border: none; background: transparent; color: #88ff88; font-size: 0.8em; padding: 2px 4px;">➕</button>
      </div>
    </div>

<!-- Такты -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
      <span style="color: #fce1d4; font-weight: bold;">Такты:</span>
      <div style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.08); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); gap: 4px; min-width: 95px; justify-content: space-between; white-space: nowrap;">
        <button onclick="changeDerivedValue('clockcyckles', -1)" style="cursor: pointer; border: none; background: transparent; color: #ff8888; font-size: 0.8em; padding: 2px 4px;">➖</button>
        <div style="display:flex; align-items:center; flex:1; justify-content:center; gap:2px;">
          <input
            type="number"
            value="${derived.clockcycklesCurrent}"
            min="0"
            max="${derived.clockcycklesMax}"
            onchange="setDerivedValue('clockcyckles', this.value)"
            style="width:42px; text-align:center; background:#222; color:#fff; border:1px solid #444; border-radius:4px;">
          <span style="color: #fff;">/${derived.clockcycklesMax}</span>
        </div>
        <button onclick="changeDerivedValue('clockcyckles', 1)" style="cursor: pointer; border: none; background: transparent; color: #88ff88; font-size: 0.8em; padding: 2px 4px;">➕</button>
      </div>
    </div>

    <!-- Силы -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
      <span style="color: #fce1d4; font-weight: bold;">Силы:</span>
      <div style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.08); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); gap: 4px; min-width: 95px; justify-content: space-between; white-space: nowrap;">
        <button onclick="changeDerivedValue('forces', -1)" style="cursor: pointer; border: none; background: transparent; color: #ff8888; font-size: 0.8em; padding: 2px 4px;">➖</button>
        <div style="display:flex; align-items:center; flex:1; justify-content:center; gap:2px;">
          <input
            type="number"
            value="${derived.forcesCurrent}"
            min="0"
            max="${derived.forcesMax}"
            onchange="setDerivedValue('forces', this.value)"
            style="width:42px; text-align:center; background:#222; color:#fff; border:1px solid #444; border-radius:4px;">
          <span style="color: #fff;">/${derived.forcesMax}</span>
        </div>
        <button onclick="changeDerivedValue('forces', 1)" style="cursor: pointer; border: none; background: transparent; color: #88ff88; font-size: 0.8em; padding: 2px 4px;">➕</button>
      </div>
    </div>

    <!-- Перемещение -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
      <span style="color: #fce1d4; font-weight: bold;">Перемещение:</span>
      <b style="color: #fff; font-family: monospace; min-width: 95px; text-align: center; padding-right: 14px; box-sizing: border-box; font-size: 1em;">${derived.moving}</b>
    </div>
  `;
}

function setDerivedValue(statType, value) {
  value = Number(value) || 0;

  if (statType === "health") {
    derived.healthCurrent = Math.max(0, Math.min(value, derived.healthMax));
  }
  else if (statType === "clockcyckles") {
    derived.clockcycklesCurrent = Math.max(0, Math.min(value, derived.clockcycklesMax));
  }
  else if (statType === "forces") {
    derived.forcesCurrent = Math.max(0, Math.min(value, derived.forcesMax));
  }

  localStorage.setItem("derivedStatsState", JSON.stringify(derived));
  displayDerivedStats();
}

function changeDerivedValue(statType, amount) {
  if (statType === 'health') {
    derived.healthCurrent = Math.min(derived.healthMax, Math.max(0, derived.healthCurrent + amount));
  } else if (statType === 'clockcyckles') {
    derived.clockcycklesCurrent = Math.min(derived.clockcycklesMax, Math.max(0, derived.clockcycklesCurrent + amount));
  } else if (statType === 'forces') {
    derived.forcesCurrent = Math.min(derived.forcesMax, Math.max(0, derived.forcesCurrent + amount));
  }
  
  localStorage.setItem("derivedStatsState", JSON.stringify(derived));
  displayDerivedStats();
}

// --- Мастерства ---
let skills = [];

function addSkill() {
  let name = document.getElementById("skillName").value.trim();
  let value = Number(document.getElementById("skillValue").value) || 0;

  if (name === "") {
    alert("Введите название мастерства.");
    return;
  }

  if (value < 1) value = 1;

  skills.push({ 
    name: name, 
    value: value, 
    smallBonuses: 0 
  });
  
  localStorage.setItem("skills", JSON.stringify(skills));

  updateSkillList();
  updatePoolDisplays(); // Добавь эту строчку, чтобы пул ГМа обновлялся при создании навыка!
  
  document.getElementById("skillName").value = "";
  document.getElementById("skillValue").value = 0;
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
  updatePoolDisplays(); // Пул просто пересчитает цифру на экране
}

function removeSkillSmallBonus(skillIndex) {
  let skill = skills[skillIndex];
  
  if ((skill.smallBonuses || 0) > 0) {
    skill.smallBonuses--;
  } else {
    // Если малых бонусов 0, уменьшаем сам уровень мастерства
    if (skill.value > 1) {
      skill.value--;
      // Новый порог для малых бонусов равен текущему (уменьшенному) уровню + 1
      let needForNewLevel = skill.value + 1;
      skill.smallBonuses = needForNewLevel - 1;
    }
  }

  // ВАЖНО: сохраняем именно мастерства, так как saveToLocalStorage их не трогает
  localStorage.setItem("skills", JSON.stringify(skills));
  
  updateSkillList();     // Перерисовываем интерфейс мастерств
  updatePoolDisplays(); // Пересчитываем пулы очков ГМа
}

function deleteSkill(index) {
  skills.splice(index, 1);
  localStorage.setItem("skills", JSON.stringify(skills));
  updateSkillList();
}

function toggleGmPanel() {
  let panel = document.getElementById("gmPointBuyPanel");
  if (panel) {
    // Если сейчас панель скрыта — показываем, если видна — скрываем
    if (panel.style.display === "none") {
      panel.style.display = "block";
    } else {
      panel.style.display = "none";
    }
  }
}
function changeSkill(index, amount) {
  skills[index].value += amount;
  if (skills[index].value < 1) {
    skills[index].value = 1;
  }
  localStorage.setItem("skills", JSON.stringify(skills));
  updateSkillList();
}

function updateSkillList() {
  let html = "";
  skills.forEach((skill, index) => {
    // Гарантируем наличие свойства малых бонусов при отрисовке
    let current = skill.smallBonuses || 0;
    let val = skill.value;
    let need = val + 1;

    html += `
      <div class="skill-item" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; width: 100%; padding-right: 15px; box-sizing: border-box;">
        <!-- Название мастерства слева -->
        <span style="color: #fff; font-size: 0.95em;"><b>${skill.name}</b> (${val >= 0 ? "+" : ""}${val})</span>
        
        <!-- Блок управления справа -->
        <div class="skill-controls" style="display: flex; gap: 12px; align-items: center;">
          
          <!-- Компактный блок малых бонусов мастерства -->
          <div class="small-bonus-block" style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.08); padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); gap: 4px;">
            <button onclick="removeSkillSmallBonus(${index})" 
                    style="cursor: pointer; border: none; background: transparent; color: #fce1d4; font-size: 0.8em; padding: 2px 6px;">➖</button>
            
            <span style="font-size: 0.85em; min-width: 30px; text-align: center; color: #bbb; font-family: monospace;">${current}/${need}</span>
            
            <button onclick="addSkillSmallBonus(${index})" 
                    style="cursor: pointer; border: none; background: transparent; color: #fce1d4; font-size: 0.8em; padding: 2px 6px;">➕</button>
          </div>

          <!-- Кнопка полного удаления мастерства -->
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
  if (saved) {
    skills = JSON.parse(saved);
  }
  updateSkillList();
}

function resetAllData() {
  if (confirm("Вы уверены, что хотите полностью стереть данные персонажа и сбросить лист?")) {
    localStorage.clear();
    // Обходной путь для CodePen, который заменяет location.reload()
    window.location.href = window.location.href; 
  }
}

// --- Броски ---
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

function rollDice() {
  let stat = document.getElementById("statSelect").value;
  let statValue = (stat === "0") ? 0 : (character[stat] || 0);

  let skillName = document.getElementById("skillSelect").value;
  let skillValue = 0;

  if (skillName && skillName !== "none") {
    let skill = skills.find(s => s.name == skillName);
    if (skill) {
      skillValue = skill.value;
    }
  }

  // --- НОВАЯ ДИНАМИЧЕСКАЯ СИСТЕМА СИЛ ---
  // Считываем число из твоего текущего инпута extraDice
  let forcesSpent = Number(document.getElementById("extraDice").value) || 0;

  // Проверка на лимит: смотрим на текущие доступные силы
  if (derived.forcesCurrent < forcesSpent) {
    alert(`Недостаточно Сил! Вложено: ${forcesSpent}, доступно: ${derived.forcesCurrent}`);
    return;
  }

  // АВТОМАТИЧЕСКОЕ ВЫЧИТАНИЕ СИЛ
  if (forcesSpent > 0) {
    derived.forcesCurrent -= forcesSpent; // Списываем потраченные силы
    localStorage.setItem("derivedStatsState", JSON.stringify(derived)); // Сохраняем новое значение в память
    displayDerivedStats(); // Перерисовываем блок производных характеристик с новыми цифрами
  }

  // Массив, куда мы запишем все грани кубов, которые нужно бросить
  let diceToRoll = [];

  // Временная переменная для расчета остатка сил
  let tempForces = forcesSpent;

  // 1. Считаем, сколько полных кубов d12 (по 6 сил) помещается в трату
  while (tempForces >= 6) {
    diceToRoll.push(12);
    tempForces -= 6;
  }

  // 2. Смотрим на остаток сил и добавляем хвостик по твоей таблице
  if (tempForces === 2) diceToRoll.push(4);
  else if (tempForces === 3) diceToRoll.push(6);
  else if (tempForces === 4) diceToRoll.push(8);
  else if (tempForces === 5) diceToRoll.push(10);
  // Если осталась 1 сила, она сгорает/не дает куба по схеме (так как старт с 2 сил)

  let statTotal = 0;
  let skillTotal = 0;
  let extraTotal = 0;
  let total = 0;

  let statOutput = "";
  let skillOutput = "";
  let extraOutput = "";

  let statDice = Math.abs(statValue);
  let skillDice = Math.min(Math.abs(skillValue), statDice);
  let normalDice = statDice - skillDice;

  // Бросок обычных кубов характеристики (d6)
  for (let i = 0; i < normalDice; i++) {
    let roll = Math.floor(Math.random() * 6) + 1;
    let converted = convertRoll(roll, 6);
    if (statValue >= 0) { statTotal += converted; total += converted; } 
    else { statTotal -= converted; total -= converted; }
    statOutput += `${roll} (${converted}) `;
  }

  // Бросок усиленных кубов мастерства (d10)
  for (let i = 0; i < skillDice; i++) {
    let roll = Math.floor(Math.random() * 10) + 1;
    let converted = convertRoll(roll, 10);
    if (skillValue >= 0) { skillTotal += converted; total += converted; } 
    else { skillTotal -= converted; total -= converted; }
    skillOutput += `${roll} (${converted}) `;
  }

  // 3. Динамический бросок кубов за Силы на основе сгенерированного массива
  diceToRoll.forEach(sides => {
    let roll = Math.floor(Math.random() * sides) + 1;
    let converted = convertRoll(roll, sides); // Твоя функция уже умеет обрабатывать и d12!
    extraTotal += converted;
    total += converted;
    extraOutput += `d${sides}: ${roll} (${converted})<br>`;
  });

// Вывод результата броска на экран
  document.getElementById("result").innerHTML = `
    <b>Характеристика:</b> ${stat === "0" ? "Без модификатора" : stat} (${statValue >= 0 ? "+" : ""}${statValue})
    <br><br>
    Обычные кубы характеристики (d6):<br>${statOutput || "нет"}<br>
    Сумма характеристики: ${statTotal}
    <hr>
    <b>Мастерство:</b> ${skillName == "none" ? "нет" : skillName} ${skillName == "none" ? "" : `(${skillValue >= 0 ? "+" : ""}${skillValue})`}
    <br><br>
    Усиленные кубы характеристики (d10):<br>${skillOutput || "нет"}<br>
    Сумма мастерства: ${skillTotal}
    <hr>
    <b>Вложено Сил:</b> ${forcesSpent}
    <br><br>
    Результат броска Сил (d${forcesSpent === 0 ? "0" : diceToRoll.join("/d")}):<br>
    ${extraOutput.trim() || "нет кубов"}<br>
    Сумма кубов Сил: ${extraTotal}
    <hr>
    🎲 Итог: <b>${total}</b>
  `;
  
}

window.addEventListener("DOMContentLoaded", () => {
  loadCharacter();
  loadSmallBonuses();
  loadSkills();
  
  // Добавляем загрузку текущих динамических хитов/сил
  let savedDerived = localStorage.getItem("derivedStatsState");
  if (savedDerived) {
    let parsed = JSON.parse(savedDerived);
    derived.healthCurrent = parsed.healthCurrent || 0;
    derived.clockcycklesCurrent = parsed.clockcycklesCurrent || 0;
    derived.forcesCurrent = parsed.forcesCurrent || 0;
  }
  
  syncInputsWithCharacter();
  updateDerivedStats();
  displayDerivedStats();
  updateSmallBonusDisplay();
});
