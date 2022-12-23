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

  clearButton.on('click', function(e){
    clearHistory();
  });
}

function getWeather(event) {

  var searchText = "";
  //Check the trigger - search button or historic search button
  if (event.type == "submit") {
    searchText = searchInput.val(); //.toLowerCase().trim();
  } else if (event.type == "click") {
    searchText = event.target.innerText;
  }
  
  
    
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

function displayCurrentWeather (currentData) {

  todaySection.html("");
  todaySection.removeClass('hide');
  fiveday.removeClass('hide');
  
  todaySection.append(`
    <h3 class="inline">${currentData.name} (${todayDate.format("dddd, DD MMM")})</h3>
    <img class="inline" src="https://openweathermap.org/img/w/${currentData.weather[0].icon}.png" alt="">
    <p>Temp: ${Math.round(currentData.main.temp)}&deg C</p>
    <p>Wind: ${currentData.wind.speed} m/s</p>
    <p>Humidity: ${currentData.main.humidity}%</p>
  `);

}

function displayForecastWeather(forecastData) {
  cardWrapper.html("");

  //console.log("Current date: " + todayDate.format("DD"));

  var lastForecastObj = null;
  var numNoonForecast = 0;
  var forecastMoment = null;

  for (var forecastObj of forecastData.list) {
    
    //console.log(forecastMoment.format("DD MMM HH"));
    forecastMoment = moment.unix(forecastObj.dt);
    lastForecastObj = forecastObj;

    //Filter results for the next 5 days forecast at 12 noon
    if (forecastMoment.format("DD") > todayDate.format("DD") && forecastMoment.format("HH") == "12"){
      //console.log("inside: " + forecastMoment.format("DD MMM HH"));

      numNoonForecast++;

      cardWrapper.append(`
      <div class="weather-card">
        <h5>${forecastMoment.format("dddd, DD MMM")}</h3>
        <img class="inline" src="https://openweathermap.org/img/w/${forecastObj.weather[0].icon}.png" alt="">
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
      <h5>${forecastMoment.format("dddd, DD MMM")}</h3>
      <img class="inline" src="https://openweathermap.org/img/w/${lastForecastObj.weather[0].icon}.png" alt="">
      <p>Temp: ${Math.round(lastForecastObj.main.temp)}&deg C</p>
      <p>Wind: ${lastForecastObj.wind.speed} m/s</p>
      <p>Humidity: ${lastForecastObj.main.humidity}%</p>
    </div>     
    `)
  }

}

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

function saveSearchHistory(searchText) {
  //console.log(searchText);
  
  var searchesStorageArr = JSON.parse(localStorage.getItem('weathersearches'));
  var exists = false;
  //console.log("Local storage: " + searchesStorageArr);

  if (searchesStorageArr != null) {
    //Check if this search already exists in the history list
    for (var historicSearchText of searchesStorageArr) {
      if (searchText.toLowerCase().trim() == historicSearchText.toLowerCase().trim()){
        //console.log('Item already in search list');
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

function clearHistory() {
  localStorage.clear();
  location.href = 'index.html';
}

init();