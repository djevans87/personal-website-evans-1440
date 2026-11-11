/*
 * PopUp Storm Assignment
 * Description: Simulates a popup storm as  divs on a page. Each popup's coordinates are
 *              derived from a fixed seed, so the same inputs always produce
 *              the same output.
 */

const SEED = 1234;
const POPUP_WIDTH = 150;
const POPUP_HEIGHT = 60;

const stormArea = document.querySelector('#storm-area');
const stormCountInput = document.querySelector('#storm-count');
const stormStartButton = document.querySelector('#storm-start');
const stormClearButton = document.querySelector('#storm-clear');
const stormError = document.querySelector('#storm-error');

// Track every pending timeout so a Clear or a second Unleash can cancel them.
let stormTimers = [];


/**
 * The assignment's formula, returning a coordinate pair.
 */
function popupPosition(i, maxX, maxY) {
    const x = Math.floor(Math.abs(Math.sin(SEED + i) * 10000) % maxX);
    const y = Math.floor(Math.abs(Math.cos(SEED + i) * 10000) % maxY);
    return {x, y};
}


function clearStorm() {
    for (let i = 0; i < stormTimers.length; i++) {
        clearTimeout(stormTimers[i]);
    }
    stormTimers.length = 0;
    stormArea.innerHTML = '';
}

function showStormError(message) {
    stormError.textContent = message;
    stormError.hidden = false;
    stormCountInput.setAttribute('aria-invalid', 'true');
}

function hideStormError() {
    stormError.textContent = '';
    stormError.hidden = true;
    stormCountInput.removeAttribute('aria-invalid');
}

function validateStormCount() {
    const validateCount = stormCountInput.validity;
    const minCount = stormCountInput.min;
    const maxCount = stormCountInput.max;

    if (validateCount.valueMissing || validateCount.badInput) {
        return 'Please enter at least one number';
    }
    if (validateCount.rangeOverflow) {
        return 'Number entered is to large! Max number is ' + maxCount;
    }
    if (validateCount.rangeUnderflow) {
        return 'Number entered is to small! Min number is ' + minCount;
    }
    if (validateCount.stepMismatch) {
        return ' Whole number only.';
    }
    return '';
}

function unleashStorm() {
    const error = validateStormCount();
    if (error) {
        showStormError(error);
        return;
    }
    hideStormError();

    clearStorm();

    let count = Number(stormCountInput.value);

    if (!Number.isFinite(count)) {
        count = 15;
    }
    count = Math.min(100, Math.max(1, count));

    const maxX = Math.max(1, stormArea.clientWidth - POPUP_WIDTH);
    const maxY = Math.max(1, stormArea.clientHeight - POPUP_HEIGHT);

    for (let i = 1; i <= count; i++) {
        const spot = popupPosition(i, maxX, maxY);

        const popup = document.createElement('div');
        popup.classList.add('popup');
        popup.style.left = spot.x + 'px';
        popup.style.top = spot.y + 'px';
        popup.textContent = 'Popup #' + i;

        const timerId = setTimeout(function () {
            stormArea.appendChild(popup);
        }, i * 120);

        stormTimers.push(timerId);
    }
}

if (stormStartButton) {
    stormStartButton.addEventListener('click', unleashStorm);
}

if (stormClearButton) {
    stormClearButton.addEventListener('click', clearStorm);
}

stormCountInput.addEventListener('input', function () {
    if (!stormError.hidden && validateStormCount() === '') {
        hideStormError();
    }
});

/*
 * Hunter Level Up System Assignment
 * Description: Create a character/hunter that simulates a leveling up process. Each time a character levels up,
 * using levels and a
 */
const HUNTER_BUFF = {health: 30, mana: 10, strength: 5, agility: 2};
const STAT_NAMES = ['health', 'mana', 'strength', 'agility'];

const hunterForm = document.querySelector('#hunter-form');
const hunterError = document.querySelector('#hunter-error');
const levelsInput = document.querySelector('#hunter-levels');
const levelsOutput = document.querySelector('#hunter-levels-out');
const cardName = document.querySelector('#hunter-card-name');
const leveledUpCardName = document.querySelector('#leveled-up-hunter-card-name');
const levelValue = document.querySelector('#hunter-level-value');
const statRows = document.querySelectorAll('.stat');
const levelUpButton = document.querySelector('#hunter-level-up');

let currentHunter = null;

function createCharacter(name, health, mana, strength, agility) {
    return {
        name: name,
        health: health,
        mana: mana,
        strength: strength,
        agility: agility,
        level: 1,

        applyBuff: function (buff) {
            this.health += buff.health;
            this.mana += buff.mana;
            this.strength += buff.strength;
            this.agility += buff.agility;
        },

        levelUp: function (levels, buff) {
            for (let i = 0; i < levels; i++) {
                this.applyBuff(buff);
                this.level += 1;
            }
        }
    };
}

function snapshotStats(character) {
    const stats = {};

    for (let i = 0; i < STAT_NAMES.length; ++i) {
        const name = STAT_NAMES[i];
        stats[name] = character[name];
    }
    return stats;
}

function validateHunterForm() {
    const inputs = hunterForm.querySelectorAll('input');
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const label = input.labels[0].textContent;
        const validity = input.validity;
        const minCount = input.min;
        const maxCount = input.max;

        if ( input.type === 'text' && input.value.trim() === '') {
            return {input: input, message: label + ' is missing, Please add a name.'};
        }
        if (validity.valueMissing || validity.badInput) {
            return {input: input, message: label + ' is missing, Please enter missing required field.'};
        }
        if (validity.rangeOverflow) {
            return { input: input, message: label + ' is too large. Max is ' + maxCount + '.' };
        }
        if (validity.rangeUnderflow) {
            return { input: input, message: label + ' is to small! Min number is ' + minCount + '.'};
        }
        if (validity.stepMismatch) {
            return { input: input, message: label + ' should be a whole number'} ;
        }
    }
    return null;
}

function showHunterError(input, message) {
    hunterError.textContent = message;
    hunterError.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
}

function hideHunterError() {
    hunterError.textContent = '';
    hunterError.hidden = true;
   const invalidAttributes = hunterForm.querySelectorAll('[aria-invalid]');
   for (let i = 0; i < invalidAttributes.length; ++i) {
       invalidAttributes[i].removeAttribute('aria-invalid');
   }
}

function readHunterForm() {
    const nameInput = document.querySelector('#hunter-name');
    const hunterObject = {
        name: nameInput.value.trim()
    };
    for (const stat of STAT_NAMES) {
        const statInput = document.querySelector(`#hunter-${stat}`);
        hunterObject[stat] = Number(statInput.value);
    }

    return hunterObject;
}

function handleCreate(event) {
    event.preventDefault();
    const error = validateHunterForm();
    if (error) {
        showHunterError(error.input, error.message);
        return;
    }
    hideHunterError();

    const values = readHunterForm(hunterForm);
   currentHunter = createCharacter(values.name, values.health, values.mana, values.strength, values.agility);
    hideHunterError();
    startNewHunter();

}

function updateLevelsOutput() {
    levelsOutput.value = levelsInput.value;

}

function setBar(bar, before, after) {
    const fill = bar.querySelector('.stat-fill');

    const start = before / after;
    fill.style.transition = 'none';
    bar.style.setProperty('--fill', start);
    bar.style.setProperty('--prev', start);
    void fill.offsetWidth;
    fill.style.transition = '';
    bar.style.setProperty('--fill', 1);
}
function renderHunter(character, before) {

    cardName.textContent = character.name;
    leveledUpCardName.textContent = 'Leveled ' + character.name;
    levelValue.textContent = character.level;

    for (const row of statRows) {
        const stat = row.dataset.stat;
        const afterValue = character[stat];
        const beforeValue = before[stat];
        const beforeSpan = row.querySelector('.stat-before');
        const afterSpan = row.querySelector('.stat-after');
        const bar = row.querySelector('.stat-bar');

        beforeSpan.textContent = beforeValue;
        afterSpan.textContent = afterValue;

        setBar(bar, beforeValue, afterValue);
    }
}

function startNewHunter() {
    const values = readHunterForm();
    currentHunter = createCharacter(values.name, values.health, values.mana,
        values.strength, values.agility);

    renderHunter(currentHunter, snapshotStats(currentHunter));
}
function handleLevelUp() {
if (!currentHunter) {
    return;
}
const levels = Number(levelsInput.value);
const before = snapshotStats(currentHunter);
currentHunter.levelUp(levels, HUNTER_BUFF);
renderHunter(currentHunter, before);
}

    hunterForm.addEventListener('submit', handleCreate);
    levelsInput.addEventListener('input', updateLevelsOutput);
    levelUpButton.addEventListener('click', handleLevelUp);
    startNewHunter();

