const fs = require('fs');
const http = require('http');
const URL = require('url').URL;
const open = require('open');
const axios = require('axios');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const SERVER_ADDRESS = 'http://127.0.0.1';
const SERVER_PORT = '8080';
const STRAVA_AUTH_URL = `http://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${SERVER_ADDRESS}:${SERVER_PORT}&approval_prompt=force&scope=activity:read_all`;
const STRAVA_REQUIRED_SCOPE = 'activity:read_all';

const authServer = http.createServer(async (req, res) => {
  const reqUrl = new URL(`${SERVER_ADDRESS}${req.url}`);
  const error = reqUrl.searchParams.get('error');
  const scope = reqUrl.searchParams.get('scope') || '';
  const hasRequiredScope = (scope).includes(STRAVA_REQUIRED_SCOPE);
  const code = reqUrl.searchParams.get('code');

  res.writeHead(200);

  if (error) res.write('Authorization denied\n');
  if (!hasRequiredScope) res.write('Read all scope denied\n');
  if (!code) res.write('Code is missing\n');

  if (hasRequiredScope && code) {
    try {
      const token = await getStravaAccessToken(code);
      const stravaActivities = await aggregateStravaActivities(token);
      fs.writeFileSync('./activies.json', JSON.stringify(stravaActivities, null, 2));
      res.write(JSON.stringify(stravaActivities, null, 2));
      console.log('Activities saved');
    } catch (err) {
      console.log(err);
      res.write('Error aggregating Strava data');
    }
  }

  res.end();
  authServer.close();
}).listen(SERVER_PORT, () => {
  console.log(`Server is running at ${SERVER_ADDRESS}:${SERVER_PORT}`);
  (async () => {
    await open(STRAVA_AUTH_URL);
  })();
});

const getStravaAccessToken = (authorizationCode) => axios.post('https://www.strava.com/oauth/token', null, {
  params: {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code: authorizationCode,
    grant_type: 'authorization_code',
  },
}).then(({ data }) => {
  return data.access_token;
});

const aggregateStravaActivities = async (bearerToken, page = 1) => {
  console.log(`Getting page ${page} of activities...`);
  const activities = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
    headers: { 'Authorization': `Bearer ${bearerToken}` },
    params: { page }
  }).then(({ data }) => data);
  if (activities.length === 0) return activities;

  return [
    ...activities,
    ...await aggregateStravaActivities(bearerToken, page + 1)
  ];
};
