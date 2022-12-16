var apiKey = '6ca9f0eebaa8221a45b6dae6209aad2c';
var city = 'London';

$.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
  .then(function (currentData) {
    var lon = currentData.coord.lon;
    var lat = currentData.coord.lat;

    // console.log(currentData);
    console.log(`
      _____Current Conditions_____
      Temp: ${Math.round(currentData.main.temp)} Cº
      Wind: ${currentData.wind.speed} M/S
      Humidity: ${currentData.main.humidity}%
    `);

    $.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
      .then(function (forecastData) {
        console.log(forecastData);
      });
  });