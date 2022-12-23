var apiKey = '6ca9f0eebaa8221a45b6dae6209aad2c';
var searchInput = $("#search-input");
var todayDate = moment();
var cardWrapper = $("main");
var todaySection = $("#today");
var fiveday = $("#fiveday");
var buttonsContainer = $('#history');
var firstHR = $('#first-hr');
var secondHR = $('#second-hr');
var clearButton = $('#clearhistory');

function init() {
  //Capture form submission and prevent page reload
  $("#search-form").on("submit", function (e) {
    getWeather(e);
    e.preventDefault();
  });  

  //Create buttons from previous searches if any
  displayHistoricSearches();

  //Capture the click of the history buttons
  buttonsContainer.on('click', function(e){
    getWeather(e);
  });

  //Capture the click of the clear history button
  clearButton.on('click', function(e){
    clearHistory();
  });
}

//Get data from API
function getWeather(event) {

  var searchText = "";
  //Check the trigger - search button or historic search button and get the town name
  if (event.type == "submit") {
    searchText = searchInput.val();
  } else if (event.type == "click") {
    searchText = event.target.innerText;
  }
  
  //Check if there is a town name provided, request the data from the API and call functions to display it
  if (searchText) {      
    
    $.get(`https://api.openweathermap.org/data/2.5/weather?q=${searchText}&appid=${apiKey}&units=metric`)
        .then(function (currentData) {
          var lon = currentData.coord.lon;
          var lat = currentData.coord.lat;
      
          displayCurrentWeather(currentData);
          
          $.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
            .then(function (forecastData) {
              displayForecastWeather(forecastData);
            });

          searchInput.val("");
          saveSearchHistory(searchText);
        });

        
  }
}

//Add the current weather section to the top of the page
function displayCurrentWeather (currentData) {

  todaySection.html("");
  todaySection.removeClass('hide');
  fiveday.removeClass('hide');
  
  //Show on the page the section to display the current weather
  todaySection.append(`
    <h3 class="inline">${currentData.name} (${todayDate.format("dddd, DD MMMM")})</h3>
    <img class="inline" src="https://openweathermap.org/img/w/${currentData.weather[0].icon}.png" alt="${currentData.weather[0].description}" title="${currentData.weather[0].description}">
    <p>Temp: ${Math.round(currentData.main.temp)}&deg C</p>
    <p>Wind: ${currentData.wind.speed} m/s</p>
    <p>Humidity: ${currentData.main.humidity}%</p>
  `);

}

//Add the five cards on the page with forecast for the next five days
function displayForecastWeather(forecastData) {

  cardWrapper.html("");

  var lastForecastObj = null;
  var numNoonForecast = 0;
  var forecastMoment = null;

  //Loop through the results for the next 5 days
  for (var forecastObj of forecastData.list) {
    
    forecastMoment = moment.unix(forecastObj.dt);
    lastForecastObj = forecastObj;

    //Filter results for the next 5 days forecast at 12 noon
    if (forecastMoment.format("DD") > todayDate.format("DD") && forecastMoment.format("HH") == "12"){

      numNoonForecast++;

      cardWrapper.append(`
      <div class="weather-card">
        <h5>${forecastMoment.format("ddd, DD MMM")}</h3>
        <img class="inline" src="https://openweathermap.org/img/w/${forecastObj.weather[0].icon}.png" alt="${forecastObj.weather[0].description}" title="${forecastObj.weather[0].description}">
        <p>Temp: ${Math.round(forecastObj.main.temp)}&deg C</p>
        <p>Wind: ${forecastObj.wind.speed} m/s</p>
        <p>Humidity: ${forecastObj.main.humidity}%</p>
      </div>     
      `)
    }
  }

  //If the response from the API does not contain forecase for 12 noon on the 5th day, 
  //then display the last available forecase for that day
  if (numNoonForecast <= 4) {
    forecastMoment = moment.unix(lastForecastObj.dt);
    cardWrapper.append(`
    <div class="weather-card">
      <h5>${forecastMoment.format("ddd, DD MMM")}</h3>
      <img class="inline" src="https://openweathermap.org/img/w/${lastForecastObj.weather[0].icon}.png" alt="${lastForecastObj.weather[0].description}" title="${lastForecastObj.weather[0].description}">
      <p>Temp: ${Math.round(lastForecastObj.main.temp)}&deg C</p>
      <p>Wind: ${lastForecastObj.wind.speed} m/s</p>
      <p>Humidity: ${lastForecastObj.main.humidity}%</p>
    </div>     
    `)
  }

}

//Display buttons on the left-hand-side of the page for previous searches
function displayHistoricSearches(){
  var searchesStorageArr = JSON.parse(localStorage.getItem('weathersearches'));
  
  buttonsContainer.empty();

  if (searchesStorageArr != null) {
    for (var historicSearchText of searchesStorageArr) {
      buttonsContainer.prepend(`
        <button type="button" class="search-button">${historicSearchText}</button>
      `)
    }
    firstHR.removeClass('hide');
    secondHR.removeClass('hide');
    clearButton.removeClass('hide');
  }

}

//Save searches in local storage and call the function to update the search buttons
function saveSearchHistory(searchText) {
  
  var searchesStorageArr = JSON.parse(localStorage.getItem('weathersearches'));
  var exists = false;

  if (searchesStorageArr != null) {
    //Check if this search already exists in the history list
    for (var historicSearchText of searchesStorageArr) {
      if (searchText.toLowerCase().trim() == historicSearchText.toLowerCase().trim()){
        exists = true;
      }    
    }
    if (!exists) {
      searchesStorageArr.push(searchText);
    }

  } else {
    searchesStorageArr = [searchText];
  }
  localStorage.setItem('weathersearches', JSON.stringify(searchesStorageArr));

  displayHistoricSearches()
}

//Clear the local storage with historic searches and refresh the page
function clearHistory() {
  localStorage.clear();
  location.href = 'index.html';
}

//Run once the page is loaded
init();