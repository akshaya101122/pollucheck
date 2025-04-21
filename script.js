async function fetchData() {
    const location = document.getElementById('location').value.trim();
    const errorMessage = document.getElementById('error-message');
    const dataContainer = document.getElementById('data-container');

    if (location === '') {
        errorMessage.textContent = 'Please enter a valid location name.';
        return;
    }

    errorMessage.textContent = '';
    dataContainer.style.display = 'none';

    const apiKey = '8e9068bccebc50945fab73e3708a53a6'; 
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;

    try {
        const geoResponse = await fetch(geoUrl);
        if (!geoResponse.ok) {
            throw new Error(`Error fetching location data: ${geoResponse.status} - ${geoResponse.statusText}`);
        }
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            throw new Error(`Could not find location "${location}".`);
        }

        const { lat, lon } = geoData[0];

        const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        const [airResponse, weatherResponse] = await Promise.all([
            fetch(airQualityUrl),
            fetch(weatherUrl),
        ]);

        if (!airResponse.ok || !weatherResponse.ok) {
            throw new Error(`Error fetching air or weather data.`);
        }

        const airData = await airResponse.json();
        const weatherData = await weatherResponse.json();

        document.getElementById('temperature').textContent = (weatherData.main.temp - 273.15).toFixed(2) + '°C';
        document.getElementById('pm25').textContent = airData.list[0].components.pm2_5 + ' µg/m³';
        document.getElementById('pm10').textContent = airData.list[0].components.pm10 + ' µg/m³';
        document.getElementById('no2').textContent = airData.list[0].components.no2 + ' µg/m³';
        document.getElementById('o3').textContent = airData.list[0].components.o3 + ' µg/m³';
        document.getElementById('so2').textContent = airData.list[0].components.so2 + ' µg/m³';

        const pm25Value = airData.list[0].components.pm2_5;
        const airStatus = pm25Value <= 50
            ? 'Good'
            : pm25Value <= 100
            ? 'Moderate'
            : 'Poor';

        document.getElementById('air-status').textContent = 'Air Quality Status: ' + airStatus;

        dataContainer.style.display = 'block';
    } catch (error) {
        errorMessage.textContent = 'Error: ' + error.message;
        console.error('Error details:', error);
    }
}
