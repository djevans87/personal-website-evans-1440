const nameForm = document.querySelector('#name-form');
const nameInput = document.querySelector('#name-input');
const lastVisitedEl = document.querySelector('#last-visit'); //paragraph to declare last time visited NOT a date
const greetingEl = document.querySelector('#greeting');
const weatherIconEl = document.querySelector('#weather-icon');
const WEATHER_URL =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=42.3314&longitude=-83.0458' +
    '&current_weather=true&temperature_unit=fahrenheit&wind_speed_unit=mph';

let weatherText = '';
//these are the WMO codes used in open-meteo api
const WEATHER_DESCRIPTIONS = {
    0: "clear",
    1: "mostly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "foggy",
    48: "foggy with freezing fog",
    51: "drizzling lightly",
    53: "drizzling",
    55: "drizzling heavily",
    56: "freezing drizzle",
    57: "heavy freezing drizzle",
    61: "raining lightly",
    63: "raining",
    65: "raining heavily",
    66: "freezing rain",
    67: "heavy freezing rain",
    71: "snowing lightly",
    73: "snowing",
    75: "snowing heavily",
    77: "hailing snow grains",
    80: "showering lightly",
    81: "showering",
    82: "showering heavily",
    85: "snow showering",
    86: "heavily snow showering",
    95: "thunderstorming",
    96: "thunderstorming with hail",
    99: "thunderstorming with heavy hail"
};
const ICONS = {
    cloudy: "images/icons/cloudy.svg",
    drizzle: "images/icons/drizzle.svg",
    fog: "images/icons/fog.svg",
    moon: "images/icons/moon.svg",
    partly: "images/icons/partly-cloudy.svg",
    rain: "images/icons/rain.svg",
    snow: "images/icons/snow.svg",
    sun: "images/icons/sun.svg",
    thunder: "images/icons/thunder.svg",
};

const NAME_KEY = 'visitor-name';
let currentVisitor = localStorage.getItem(NAME_KEY);

const LAST_VISIT_KEY = 'darian-site-last-visit';

const TIME_ZONE = 'America/New_York';
function formatDate(date) {
    const getDate=  date.toLocaleDateString('en-US', {
        timeZone: TIME_ZONE,
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });
    const getTime =  date.toLocaleTimeString('en-US', {
        timeZone: TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
    return getDate + ' at ' + getTime ;
}

function getCurrentHour(date) {
    const hour = date.toLocaleTimeString('en-US', {
        timeZone: TIME_ZONE,
        hour: '2-digit',
        hourCycle: 'h23',
    });
    return Number(hour);
}
function getTimeOfDayGreeting(hour) {
    if (hour < 12) {
        return 'Good morning';
    }
    if (hour < 18) {
        return 'Good afternoon';
    }
    return 'Good evening';
}

function showLastTimeVisit() {
    const prevVisit = localStorage.getItem(LAST_VISIT_KEY);
    if (prevVisit) {
        const prevVisitDate = new Date(prevVisit);
        lastVisitedEl.textContent = `Last time you visited was on ${formatDate(prevVisitDate)}`;
    } else {
        lastVisitedEl.textContent = 'This is your first time visiting the site!';
    }
    localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
}

function getIconName(code, isDay) {
   if(code === 0 || code === 1) {
        return isDay ? 'sun' : 'moon';
    }
   if (code === 2) {
        return 'partly';
    }
   if (code === 3) {
       return 'cloudy';
   }
   if (code === 45 || code === 48) {
       return 'fog';
   }
   if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) {
       return 'drizzle';
   }

   if (code === 95 || code === 96 || code === 99) {
       return 'thunder';
   }
   if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86) {
       return 'snow';
   }
   if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67 || code === 80 || code === 81 || code === 82) {
       return 'rain';
   }
}

async function loadWeather() {

    try {
        const response = await fetch(WEATHER_URL);

        if (!response.ok) {
            throw new Error('Weather request failed with status ' + response.status);
        }

        const data = await response.json();
        console.log(data);
        const current = data.current_weather;

        const code = current.weathercode;
        const isDay = current.is_day === 1;

        const description = WEATHER_DESCRIPTIONS[code] || "I don't even have words to describe this weather!";
        const temperature = Math.round(current.temperature);

        weatherText = "it's " + temperature + "\u00B0F and " + description + " right now";

        if (weatherIconEl) {
            const img = document.createElement("img");
            img.src = ICONS[getIconName(code, isDay)];
            img.alt = '';
            weatherIconEl.append(img);
        }
    } catch (error) {
        console.error('Could not load weather:', error);
        weatherText = '';
    }
    showGreeting();
}

function showGreeting() {
    if (!greetingEl) {
        return;
    }
    const currentDateTime = new Date();
    const hour = getCurrentHour(currentDateTime);
    const timeOfDayGreeting = getTimeOfDayGreeting(hour);
    const greetingName = currentVisitor ? `, ${currentVisitor}` : '';

    let greetingText = '';

    greetingText = timeOfDayGreeting + greetingName + '! It is currently ' + formatDate(currentDateTime);
    greetingText += weatherText ? ', and ' + weatherText + '.' : '.';
    greetingEl.textContent = greetingText;
}
if (nameForm) {
    nameForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const nameGiven = nameInput.value.trim();
        if (nameGiven === '') {
            return;
        }
        currentVisitor = nameGiven;
        localStorage.setItem(NAME_KEY, nameGiven);
        nameForm.hidden = true;
        showGreeting(); // leaving this here so the name shows right away even though interval overwrites it
    });
}

nameForm.hidden = Boolean(currentVisitor); // Hides the form input if the user has visited the site before and goes straight to the greeting and time stamp
showLastTimeVisit();
showGreeting();

setInterval(showGreeting, 1000); // Updates the greeting every second to reflect the current time of day
loadWeather();

