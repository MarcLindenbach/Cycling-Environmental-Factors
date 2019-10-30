const _ = require('lodash');
const axios = require('axios');
const csv2json = require('csvtojson');
const { getSunrise, getSunset } = require('sunrise-sunset-js');

const getWeatherUrl = (stationId, year, month) => `http://climate.weather.gc.ca/climate_data/bulk_data_e.html
  ?format=csv
  &stationID=${stationId}
  &Year=${year}
  &Month=${month}
  &timeframe=1
  &submit=Download+Data`.replace(/\n *\ /g, '');

const getWeatherForMonth = async (stationId, year, month) => {
  const { data } = await axios.get(getWeatherUrl(stationId, year, month));
  const weatherByHour = await csv2json().fromString(data);
  const weatherByDay = weatherByHour.reduce((days, hour) => {
    const date = `${hour.Year}-${hour.Month}-${hour.Day}`;
    const currentHour = _.parseInt(hour.Time.split(':'));

    if (!_.has(days, date)) {
      days[date] = {
        year: _.parseInt(hour.Year),
        month: _.parseInt(hour.Month),
        day: _.parseInt(hour.Day),
        sunrise: getSunrise(
          Number.parseFloat(hour['Latitude (y)']),
          Number.parseFloat(hour['Longitude (x)']),
          new Date(hour['Date/Time'])
        ).toLocaleString().split(' ')[1],
        sunset: getSunset(
          Number.parseFloat(hour['Latitude (y)']),
          Number.parseFloat(hour['Longitude (x)']),
          new Date(hour['Date/Time'])
        ).toLocaleString().split(' ')[1],
        hours: {},
      };
    }

    days[date].hours[currentHour] = {
      temperature: Number.parseFloat(hour['Temp (°C)']),
      windSpeed: _.parseInt(hour['Wind Spd (km/h)']),
      windDirection: _.parseInt(hour['Wind Dir (10s deg)']) * 10,
      pressure: Number.parseFloat(hour['Stn Press (kPa)']),
      relativeHumidity: _.parseInt(hour['Rel Hum (%)']) / 100,
    };

    return days;
  }, {});
  return weatherByDay;
};

module.exports = {
  getWeatherForMonth,
};
