function initPage() {
    // Get DOM elements
    const cityEl = document.getElementById("enter-city");
    const searchEl = document.getElementById("search-button");
    const clearEl = document.getElementById("clear-history");
    const nameEl = document.getElementById("city-name");
    const currentPicEl = document.getElementById("current-pic");
    const currentTempEl = document.getElementById("temperature");
    const currentHumidityEl = document.getElementById("humidity");
    const currentWindEl = document.getElementById("wind-speed");
    const currentUVEl = document.getElementById("UV-index");
    const historyEl = document.getElementById("history");
    const fivedayEl = document.getElementById("fiveday-header");
    const todayweatherEl = document.getElementById("today-weather");
  
    // Retrieve search history from local storage or initialize as empty array
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
  
    const APIKey = "3d4daf5414f6cffcb0973f190a764ba4";
  
    function getWeather(cityName) {
      // API URLs
      const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKey}`;
      const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${APIKey}`;
  
      // Fetch current weather data
      axios.get(weatherURL)
        .then(function (response) {
          todayweatherEl.classList.remove("d-none");
  
          // Display current weather data
          const currentDate = new Date(response.data.dt * 1000);
          const day = currentDate.getDate();
          const month = currentDate.getMonth() + 1;
          const year = currentDate.getFullYear();
          nameEl.innerHTML = `${response.data.name} (${month}/${day}/${year})`;
          const weatherPic = response.data.weather[0].icon;
          currentPicEl.setAttribute("src", `https://openweathermap.org/img/wn/${weatherPic}.png`);
          currentPicEl.setAttribute("alt", response.data.weather[0].description);
          currentTempEl.innerHTML = `Temperature: ${k2f(response.data.main.temp)} &#176F`;
          currentHumidityEl.innerHTML = `Humidity: ${response.data.main.humidity}%`;
          currentWindEl.innerHTML = `Wind Speed: ${response.data.wind.speed} MPH`;
  
          // Fetch UV index data
          const lat = response.data.coord.lat;
          const lon = response.data.coord.lon;
          const uvURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${APIKey}`;
          return axios.get(uvURL);
        })
        .then(function (response) {
          const UVIndex = response.data.value;
  
          // Apply appropriate badge class based on UV index value
          if (UVIndex < 4) {
            currentUVEl.setAttribute("class", "badge badge-success");
          } else if (UVIndex < 8) {
            currentUVEl.setAttribute("class", "badge badge-warning");
          } else {
            currentUVEl.setAttribute("class", "badge badge-danger");
          }
  
          currentUVEl.innerHTML = `UV Index: ${UVIndex}`;
        })
        .catch(function (error) {
          console.log(error);
        });
  
      // Fetch 5-day forecast data
      axios.get(forecastURL)
        .then(function (response) {
          fivedayEl.classList.remove("d-none");
  
          // Display forecast data for next 5 days
          const forecastEls = document.querySelectorAll(".forecast");
  
          for (let i = 0; i < forecastEls.length; i++) {
            forecastEls[i].innerHTML = "";
  
            const forecastIndex = i * 8 + 4;
  
            // Gets Forecast Dates 
            const forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
            const forecastDay = forecastDate.getDate();
            const forecastMonth = forecastDate.getMonth() + 1;
            const forecastYear = forecastDate.getFullYear();
            const forecastDateEl = document.createElement("p");
            forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
            forecastDateEl.innerHTML = `${forecastMonth}/${forecastDay}/${forecastYear}`;
            forecastEls[i].appendChild(forecastDateEl);
  
            const forecastWeatherEl = document.createElement("img");
            forecastWeatherEl.setAttribute("src", `https://openweathermap.org/img/wn/${response.data.list[forecastIndex].weather[0].icon}.png`);
            forecastWeatherEl.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
            forecastEls[i].appendChild(forecastWeatherEl);
  
            const forecastTempEl = document.createElement("p");
            forecastTempEl.innerHTML = `Temp: ${k2f(response.data.list[forecastIndex].main.temp)} &#176F`;
            forecastEls[i].appendChild(forecastTempEl);
  
            const forecastHumidityEl = document.createElement("p");
            forecastHumidityEl.innerHTML = `Humidity: ${response.data.list[forecastIndex].main.humidity}%`;
            forecastEls[i].appendChild(forecastHumidityEl);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  
    searchEl.addEventListener("click", function () {
      const searchTerm = cityEl.value.trim();
  
      if (searchTerm !== "") {
        getWeather(searchTerm);
        searchHistory.push(searchTerm);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
      }
    });
  
    clearEl.addEventListener("click", function () {
      localStorage.clear();
      searchHistory = [];
      renderSearchHistory();
    });
  
    function k2f(K) {
      return Math.floor((K - 273.15) * 1.8 + 32);
    }
  
    function renderSearchHistory() {
      historyEl.innerHTML = "";
  
      for (let i = 0; i < searchHistory.length; i++) {
        const historyItem = document.createElement("input");
        historyItem.setAttribute("type", "text");
        historyItem.setAttribute("readonly", true);
        historyItem.setAttribute("class", "form-control d-block bg-white");
        historyItem.setAttribute("value", searchHistory[i]);
        historyItem.addEventListener("click", function () {
          getWeather(historyItem.value);
        });
  
        historyEl.appendChild(historyItem);
      }
    }
  
    renderSearchHistory();
  
    if (searchHistory.length > 0) {
      getWeather(searchHistory[searchHistory.length - 1]);
    }
  }
  
  initPage();