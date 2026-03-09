const apiKey = '8ea4031b309d23bcde8d56cade6b514b';
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const historyList = document.getElementById('history-list');
const currentWeather = document.getElementById('current-weather');
const forecastCards = document.getElementById('forecast-cards');
const errorModalEl = document.getElementById('errorModal');
const modalMessage = document.getElementById('modal-message');

let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
const errorModal = new bootstrap.Modal(errorModalEl);

function updateHistory() {
    historyList.innerHTML = '';
    recentCities.forEach(city => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = city;
        li.onclick = () => fetchWeather(city);
        historyList.appendChild(li);
    });
}

function saveCity(city) {
    if (!recentCities.includes(city)) {
        recentCities.unshift(city);
        if (recentCities.length > 6) recentCities.pop();
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
        updateHistory();
    }
}

function showCurrent(data) {
    const date = new Date(data.dt * 1000).toLocaleDateString();
    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    currentWeather.innerHTML = `
        <div class="card-body">
            <h4>${data.name} (${date})</h4>
            <img src="${icon}" alt="${data.weather[0].description}">
            <h2>${Math.round(data.main.temp)} °F</h2>
            <p>${data.weather[0].description}</p>
            <p>Wind: ${data.wind.speed} mph</p>
            <p>Humidity: ${data.main.humidity}%</p>
        </div>
    `;
}

function showForecast(data) {
    forecastCards.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const day = data.list[i * 8];
        if (!day) continue;
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'});
        const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

        const col = document.createElement('div');
        col.className = 'col-6 col-sm-4 col-lg-2';
        col.innerHTML = `
            <div class="forecast-card card text-center p-2">
                <div>${date}</div>
                <img src="${icon}" alt="">
                <div class="fs-5">${Math.round(day.main.temp)} °F</div>
                <small>${day.weather[0].description}</small>
                <small>Wind: ${day.wind.speed} mph</small>
            </div>
        `;
        forecastCards.appendChild(col);
    }
}

function fetchWeather(query) {
    let url;
    if (typeof query === 'string') {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=imperial&appid=${apiKey}`;
    } else {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&units=imperial&appid=${apiKey}`;
    }

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error('City not found');
            return res.json();
        })
        .then(data => {
            showCurrent(data);
            saveCity(data.name);
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(data.name)}&units=imperial&appid=${apiKey}`);
        })
        .then(res => res.json())
        .then(data => showForecast(data))
        .catch(err => {
            modalMessage.textContent = err.message.includes('not found')
                ? 'City not found. Try another name.'
                : 'Something went wrong. Please try again.';
            errorModal.show();
        });
}

searchBtn.onclick = () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
};

cityInput.onkeypress = e => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) fetchWeather(city);
    }
};

locationBtn.onclick = () => {
    if (!navigator.geolocation) {
        modalMessage.textContent = 'Geolocation not supported.';
        errorModal.show();
        return;
    }
    locationBtn.disabled = true;
    locationBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Finding...';

    navigator.geolocation.getCurrentPosition(
        pos => {
            fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            locationBtn.disabled = false;
            locationBtn.innerHTML = '<i class="bi bi-geo-alt"></i> My Location';
        },
        () => {
            modalMessage.textContent = 'Could not get location. Check permissions.';
            errorModal.show();
            locationBtn.disabled = false;
            locationBtn.innerHTML = '<i class="bi bi-geo-alt"></i> My Location';
        }
    );
};

updateHistory();
if (recentCities.length > 0) {
    fetchWeather(recentCities[0]);
} else {
    fetchWeather('Dallas');
}
