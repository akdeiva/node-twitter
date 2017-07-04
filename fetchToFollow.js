'use strict';
var utils = require('./utils');
var twitterLists = [
  {slug:'cool-people', owner_screen_name: 'frontendrescue'},
  {slug:'best-sources', owner_screen_name: 'frontendrescue'},
  {slug: 'js-ninjas', owner_screen_name: 'LeaVerou'},
  {slug: 'css-ninjas', owner_screen_name: 'LeaVerou'},
  {slug: 'forbes-channels', owner_screen_name: 'Forbes'}
];

var getListMembers = function(options) {
  client.get('lists/members', options, function(error, members, response) {
    if(members && members.users) {
      members.users.forEach(function(member) {
        utils.storeData(processObject(member, utils.objectKeys.memberKeys), 'ToFollow');
      });
    } else {
      console.log("Error:", error);
    }
  });
};

const RECORD_COUNT = 1000;
module.exports = {
  retreiveMembers: function() {
    twitterLists.forEach(function(list) {
      list.count = RECORD_COUNT;
      utils.getListMembers(list);
    });
  }
}
