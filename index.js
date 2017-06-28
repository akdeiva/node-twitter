'use strict';
var Twitter = require('twitter');
// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore');
const queryString = require('query-string');
// Your Google Cloud Platform project ID
const projectId = process.env.DATA_STORE_PROJECT || process.env.npm_config_DATA_STORE_PROJECT;

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
    'user'
  ],
  entitiesKeys: [
  	'hashtags',
  	'urls'
  ],
  userKeys: [
  	'id',
  	'name',
  	'screen_name',
  	'location',
  	'url',
  	'followers_count',
  	'friends_count',
  	'created_at'
  ]
};

// Instantiates a client
const datastore = Datastore({
  projectId: projectId
});

var client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY || process.env.npm_config_CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET || process.env.npm_config_CONSUMER_SECRET,
  bearer_token: process.env.BEARER_TOKEN || process.env.npm_config_BEARER_TOKEN
});


var processTweetObject = function(tweet, keys) {
  var processedObject = {};
  if(tweet && keys) {
    keys.forEach(function(key) {
      if(typeof tweet[key] === 'object' && objectKeys[key + 'Keys']) {
        processedObject[key] = processTweetObject(tweet[key], objectKeys[key + 'Keys']);
      } else {
        processedObject[key] = tweet[key];
      }
    });
  }
  return processedObject;
};

var getLastTweetID = function() {
  const query = datastore.createQuery('LAST_INDEX');
  datastore.runQuery(query)
  .then((results) => {
    // Task entities found.
    const tweets = results[0];
    let id = 0;
    tweets.forEach((tweet) =>  {
      id = tweet.lastId;
      console.log(tweet);
    });
    retreiveTweets(id);
  }).catch((err) => {
    retreiveTweets();
  });
}

var storeTweetData = function(data, type) {
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
      console.error('ERROR:', err);
    });
};

var retreiveTweets = function(lastId) {
  var options = {q: 'from:addyosmani -filter:retweets filter:safe', lang: 'en', result_type: 'recent', count: 100};
  if(lastId) {
    //options.since_id = lastId;
  }
  getTweetData(options);
}

var getTweetData = function(options) {
  client.get('search/tweets', options, function(error, tweets, response) {
    if(tweets && tweets.statuses) {
      console.log(tweets.search_metadata);
      tweets.statuses.forEach(function(tweet) {
        var currentTweet = processTweetObject(tweet, objectKeys.tweetKeys);
        storeTweetData(currentTweet.user, 'User');
        currentTweet.tweet_by = currentTweet.user.id;
        delete currentTweet.user;
        storeTweetData(currentTweet, 'Tweet');
      })
      storeTweetData({id:1, lastId: tweets.search_metadata.max_id_str}, 'LAST_INDEX');
      if(tweets.search_metadata.next_results) {
        const parsed = queryString.parse(tweets.search_metadata.next_results);
        console.log("Parsed Object:", parsed);
        getTweetData(parsed);
      }
    } else {
      console.log("Error:", error);
    }
  });
}

getLastTweetID();
