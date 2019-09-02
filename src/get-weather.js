const axios = require('axios');

const getWeatherUrl = (stationId, year, month, day) => `http://climate.weather.gc.ca/climate_data/bulk_data_e.html
  ?format=csv
  &stationID=${stationId}
  &Year=${year}
  &Month=${month}
  &Day=${day}
  &timeframe=1
  &submit=Download+Data`.replace(/\n *\ /g, '');

const getWeather = async (stationId, year, month, day) => {
  const { data } = await axios.get(getWeatherUrl(stationId, year, month, day));
  console.log(data);
};

module.exports = {
  getWeather,
};
