'use strict';
const queryString = require('query-string');
var utils = require('./utils');
var processObject = utils.processObject;
var objectKeys = utils.objectKeys;
var twitterClient = utils.twitterClient;
var dataStore = utils.datastore;
var storeData = utils.storeData;
var getLastTweetID = utils.getLastTweetID;

const RECORD_COUNT = 100;

var getTweetData = function(options, screen_name) {
  twitterClient.get('search/tweets', options, function(error, tweets, response) {
    if(tweets && tweets.statuses) {
      tweets.statuses.forEach(function(tweet) {
        var currentTweet = processObject(tweet, objectKeys.tweetKeys);
        currentTweet.tweet_by = currentTweet.user.id;
        delete currentTweet.user;
        storeData(currentTweet, 'Tweet');
      })
      if(tweets.search_metadata.next_results) {
        const parsed = queryString.parse(tweets.search_metadata.next_results);
        getTweetData(parsed, screen_name);
      } else {
        var lastIndex = {id: "follower_" + screen_name, lastId: tweets.search_metadata.max_id_str};
        storeData(lastIndex, 'LAST_INDEX');
      }
    } else {
      console.log("Error while fetching tweets:", error);
    }
  });
};

var getFollowersList = function() {
  const query = dataStore.createQuery('ToFollow');
  dataStore.runQuery(query)
  .then((results) => {
    // Twitter Users list found.
    const toFollow = results[0];
    toFollow.forEach((follow) =>  {
      //build the search query string for each follower
      var options = {
        q: '#js OR #javascript OR #angularjs OR #reactjs OR #nodejs from:' + follow.screen_name + '-filter:retweets filter:safe',
        lang: 'en',
        result_type: 'recent',
        count: RECORD_COUNT
      };

      getLastTweetID(follow.screen_name).then((results) => {
        // Last Index found.
        const lasIndex = results[0];
        let id = 0;
        lasIndex.forEach((tweet) =>  {
          options.max_id_str = tweet.lastId;
        });
        getTweetData(options, follow.screen_name);
      }).catch((err) => {
        getTweetData(options, follow.screen_name);
      });
    });
  }).catch((err) => {
    console.log("Have error fetching Tweets for the list of followers:", err);
  });
}

module.exports = {
  retreiveTweets: getFollowersList
}
