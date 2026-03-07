const apiKey = '8ea4031b309d23bcde8d56cade6b514b';
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const historyList = document.getElementById('history-list');
const currentWeather = document.getElementById('current-weather');
const forecastCards = document.getElementById('forecast-cards');

let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

function updateHistory() {
    historyList.innerHTML = '';
    recentCities.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.addEventListener('click', () => fetchWeather(city));
        historyList.appendChild(li);
    });
}

function cityHistory(city) {
    if (!recentCities.includes(city)) {
        recentCities.unshift(city);
        if (recentCities.length > 5) recentCities.pop(); 
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
        updateHistory();
    }
}

function displayCurrentWeather(data) {
    const date = new Date(data.dt * 1000).toLocaleDateString('en-US');
    const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    currentWeather.innerHTML = `
        <h2>${data.name} (${date}) <img src="${iconUrl}" alt="${data.weather[0].description}"></h2>
        <p>Temp: ${data.main.temp}°F</p>
        <p>Wind: ${data.wind.speed} MPH</p>
        <p>Humidity: ${data.main.humidity}%</p>
    `;
}

function displayForecast(data) {
    forecastCards.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const item = data.list[i * 8];
        if (!item) continue;
        const date = new Date(item.dt * 1000).toLocaleDateString('en-US');
        const iconUrl = `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
        const card = document.createElement('div');
        card.classList.add('forecast-card');
        card.innerHTML = `
            <h3>${date}</h3>
            <img src="${iconUrl}" alt="${item.weather[0].description}">
            <p>Temp: ${item.main.temp}°F</p>
            <p>Wind: ${item.wind.speed} MPH</p>
            <p>Humidity: ${item.main.humidity}%</p>
        `;
        forecastCards.appendChild(card);
    }
}

function fetchWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`)
        .then(response => {
            if (!response.ok) throw new Error('City not found');
            return response.json();
        })
        .then(data => {
            displayCurrentWeather(data);
            cityHistory(city);
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`);
        })
        .then(response => response.json())
        .then(data => displayForecast(data))
        .catch(error => {
            console.error(error);
            currentWeather.innerHTML = '<p>City not found. Please try again.</p>';
        });
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
});

updateHistory();
if (recentCities.length > 0) {
    fetchWeather(recentCities[0]);
} else {
    fetchWeather('San Jose');
}
