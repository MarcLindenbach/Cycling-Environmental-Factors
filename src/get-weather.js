const getWeatherUrl = (stationId, year, month, day) => `http://climate.weather.gc.ca/climate_data/bulk_data_e.html
  ?format=csv
  &stationID=${stationId}
  &Year=${year}
  &Month=${month}
  &Day=${day}
  &timeframe=1
  &submit=Download+Data`.replace(/\n *\ /g, '');

module.exports = {
  getWeatherUrl,
};
