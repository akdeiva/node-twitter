var Twitter = require('twitter');
/*
var b = new Buffer(twitterKey + ':' + twitterSecret);
var encodedKey = b.toString('base64');

console.log(encodedKey);

var url = 'https://api.twitter.com/oauth2/token?grant_type=client_credentials';
var header = {
  'Authorization': 'Basic ',
  'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
};

var options = {
  url: url,
  headers: header,
  method: 'POST'
}

request(options, function (e, r, body) {
})*/

console.log( process.env);

var client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY || process.env.npm_config_CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET || process.env.npm_config_CONSUMER_SECRET,
  bearer_token: process.env.BEARER_TOKEN || process.env.npm_config_BEARER_TOKEN
});
client.get('search/tweets', {q: 'node.js'}, function(error, tweets, response) {
   console.log("Body within Search Tweets", tweets);
});
