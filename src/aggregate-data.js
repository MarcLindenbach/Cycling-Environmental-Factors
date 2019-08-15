const http = require('http');
const URL = require('url').URL;
const open = require('open');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const SERVER_ADDRESS = 'http://127.0.0.1';
const SERVER_PORT = '8080';
const STRAVA_AUTH_URL = `http://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${SERVER_ADDRESS}:${SERVER_PORT}&approval_prompt=force&scope=activity:read_all`;
const STRAVA_REQUIRED_SCOPE = 'activity:read_all';

const server = http.createServer((req, res) => {
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
    res.write('Aggregating Strava Data...');
  }

  res.end();
  server.close();
}).listen(SERVER_PORT, () => {
  console.log(`Server is running at ${SERVER_ADDRESS}:${SERVER_PORT}`);
  (async () => {
    await open(STRAVA_AUTH_URL);
  })();
});;

