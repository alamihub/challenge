# challenge

## Perform G Suite bulk operations:
- create groups
- add membres
  
An express-js server in the backend to handle api and a json database driven by [Lowdb](https://www.npmjs.com/package/lowdb) to store
emails lists. Frontend here is build with [Coreui](https://coreui.io/) template and can be served both statically or dynamically.

### Use case: 
Send bulk emails to a list of emails-id uploaded as a groups members.
so Whats New here?!!

Even a tiny project can bring big challenges. The challenge here come from problems faced during project conception:

## Wich Credentials to use:  
  we use Desktop credentials for adminsdk api in the server to avoid the app approval submition, and the domain delegation required
  for Service Account credentials. Also credentials for web browser app must require domain approval and comes without auto-refresh token.
  So i opted for one time Oauth2 login and autorization consent to get the access token and the 
  [adminsdk client](https://github.com/googleapis/google-api-nodejs-client) will handle the refresh token expiry for us.
  
## Admin sdk api limit and restrictions:

  The request body for adding group or inserting membre is limited to 1 email per action in both cases. so to add 100 group we need 100 request, 
  and to insert 10k of membre emails we need 10k request. A daily request limit of 150000 req/day and 10 concurrent request / 1s wich means the best
  we can do is to send a batch of 10 http requests / 1s (Batch requests with single http request payload and multipart/mixed body is deprecated
  for javascript admin sdk api wich use [gaxios](https://www.npmjs.com/package/gaxios) for fetching requests).

## Server Side Event

  The major problem faced here is how to fetch in real time multiples asynchronous responses for one request from the frontend taking on concideration 
  that our backend have to handle 10k req delayed by 1 sec to inseert membres for an email-list of 10k.
  To solve this problem i opted for HTTP request with ('Content-Type': 'text/event-stream') using browser built-in 
  [EventSource](https://developer.mozilla.org/fr/docs/Web/API/EventSource) web-api. 
  It can be made with observables using [Rxjs](https://rxjs.dev/) in the frontend and [marble](https://docs.marblejs.com/) in the backend also...


## Usage

For localhost
```sh
npm install
```
then
```sh
npm start
```
For server deployement on CentOS 7 or 8 i used [PM2](https://pm2.keymetrics.io/) as process manager for node-js.

- Clone this git or copy all  files to : '/usr/app/'
- Run script shell setup.sh

the script will install node-js, app dependencies, pm2 services , nginx web server and configure nginx as a Proxy-server for node.
