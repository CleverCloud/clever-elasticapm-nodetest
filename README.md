## Clever Cloud deployment

Deploy this application as a Node.js application on Clever Cloud.
You must add the environment variable `NODE_ENV=production` in the dedicated section.
You must have an add on Elastic Enterprise with a running APM server and a Kibana dashboard linked to your application.

## Usage

This app can return any HTTP code by sending a GET request to `<your base url>/status-codes/<HTTP code>`
You can visualize the data in your Kibana dashboard in the APM section.