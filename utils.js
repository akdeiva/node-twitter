'use strict';
var Twitter = require('twitter');
const Datastore = require('@google-cloud/datastore');
const projectId = process.env.DATA_STORE_PROJECT || process.env.npm_config_DATA_STORE_PROJECT;
// Instantiates a client
const datastore = Datastore({
  projectId: projectId
});

var client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY || process.env.npm_config_CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET || process.env.npm_config_CONSUMER_SECRET,
  bearer_token: process.env.BEARER_TOKEN || process.env.npm_config_BEARER_TOKEN
});


var objectKeys = {
  tweetKeys: [
    'id',
    'text',
    'truncated',
    'source',
    'geo',
    'place',
    'retweet_count',
    'favorite_count',
    'favorited',
    'retweeted',
    'entities',
    'user',
    'created_at'
  ],
  entitiesKeys: [
  	'hashtags',
  	'urls'
  ],
  userKeys: [
  	'id',
  ],
  memberKeys: [
    'id',
    'name',
    'screen_name',
    'location',
  	'url',
  	'followers_count',
  	'friends_count',
    'listed_count',
    'statuses_count',
    'lang',
    'verified',
  	'created_at'
  ]
};

var storeData = function(data, type) {
  // The Cloud Datastore key for the new entity
  const dataKey = datastore.key([type, data.id]);
  // Prepares the new entity
  const storeData = {
    key: dataKey,
    data: data
  };

  // Saves the entity
  datastore.save(storeData)
    .then(() => {
    })
    .catch((err) => {
      console.error('ERROR while saving:', err);
    });
};

var processObject = function(tweet, keys) {
  var processedObject = {};
  if(tweet && keys) {
    keys.forEach(function(key) {
      if(typeof tweet[key] === 'object' && objectKeys[key + 'Keys']) {
        processedObject[key] = processObject(tweet[key], objectKeys[key + 'Keys']);
      } else {
        processedObject[key] = tweet[key];
      }
    });
  }
  return processedObject;
};

module.exports = {
  twitterClient: client,
  datastore:datastore,
  processObject: processObject,
  objectKeys: objectKeys,
  storeData: storeData,
  getLastTweetID: function(screen_name) {
    const query = datastore.createQuery('LAST_INDEX').filter('screen_name', 'follower_'+screen_name);
    return datastore.runQuery(query);
  }
};




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
