const mongoose = require('mongoose'),
      ObjectId = require('mongodb').ObjectID;
var User       = require('../models/user');
var Track      = require('../models/track');
var ts         = require('../services/track.service');
var jwt        = require('jsonwebtoken');
var consts     = require('../consts.js');

var service = {};

service.login                   = login;
service.getUserById             = getUserById;
service.getPrefById             = getPrefById;
service.getPlaylistsById        = getPlaylistsById;
service.setPref                 = setPref;
service.getUser                 = getUser;
service.addTrackToPlaylist      = addTrackToPlaylist;
service.addNewPlaylist          = addNewPlaylist;
// service.removeTrackFromPlaylist = removeTrackFromPlaylist;
service.removePlaylist          = removePlaylist;
service.create                  = create;
// service.delete = _delete;

module.exports = service;

function addNewPlaylist(userId, playlistName){
  console.log('Trace: addTrackToPlaylist('+userId+','+playlistName+')');
  return new Promise((resolve, reject) => {
    let user = getUserById(userId).then((user)=> {
      user.playlists.push({"name":playlistName, "tracks":[]});
      user.save((err) => {
        if(err){
          console.log(`err: ${err}`);
          resolve(false);
          return;
        }
        else
          console.log(`Saved document: ${user.username}`);
      });
    resolve(true);
    });
  });
}

function create(username, password){
    var preferences = [];
    preferences.push({"name":"detriot","value":0});
    preferences.push({"name":"hard","value":0});
    preferences.push({"name":"dance","value":0});
    preferences.push({"name":"minimal","value":0});
    preferences.push({"name":"classic","value":0});
    preferences.push({"name":"house","value":0});
    preferences.push({"name":"vgm","value":0});
    preferences.push({"name":"hard_acid","value":0});
    preferences.push({"name":"electro","value":0});
    return new Promise((resolve, reject) => {
      User.findOne({username: username},
        (err, user) => {
          if(err) {
            reject({"error": err});
            console.log('REGISTER STATUS: FAILED');
          }
          
          if(user) {
            console.log("info : exist username");
            return resolve({"info": " exist username"});
          }
          else{
            console.log('REGISTER STATUS: SUCCESS ' + username);
            var newUser = new User({
              username : username,
              password : password,
              preferences : preferences
            });
            newUser.save(
              (err) => {
                if(err)
                  console.log('error: ' + err);
                else
                  console.log("save new user");
                  resolve();
              });
        }
    });
  });
}

function getUserById(userId){
  return new Promise((resolve, reject) => {
    User.findOne({_id: ObjectId(userId)},
        (err, user) => {
          if(err) {
            reject(err);
            console.log('getUser STATUS: FAILED');
          }
          console.log('getUser STATUS: SUCCESS');
          if(!user) {
            console.log("info : wrong username");
            return resolve(err);
          }
          resolve(user);
        });
  });
}
function getUser(userId){
  return new Promise((resolve, reject) => {
    User.findOne({_id: ObjectId(userId)},
        (err, user) => {
          if(err) {
            reject(err);
            console.log('getUser STATUS: FAILED');
          }
          console.log('getUser STATUS: SUCCESS');
          if(!user) {
            console.log("info : wrong username");
            return resolve(err);
          }
          resolve(user);
        });
  });
}

function login(username, password){
    return new Promise((resolve, reject) => {
      User.findOne({username: username},
        (err, user) => {
          if(err) {
            reject({"error": err});
            console.log('LOGIN STATUS: FAILED');
          }
          
          if(!user) {
            console.log("info : wrong username");
            return resolve({"info": " wrong username"});
          }
          if(!(user.password === password)) {
            console.log("info : wrong password");
            return resolve({"info": " wrong password"});
          }
          console.log('LOGIN STATUS: SUCCESS ' + user.username);
          resolve({
                _id: user._id,
                username: user.username,
                token: jwt.sign({ sub: user._id }, consts.secret)
            });
        });
    });
}
function getPrefById(userId){
  console.log("Trace: getPrefById("+userId+")");
  return new Promise((resolve, reject) => {
    User.findOne({_id: ObjectId(userId)},
      (err, user) => {
        if(err) {
          console.log('getPrefById STATUS: FAILED');
          reject({"error": err});
        }
        console.log('getPrefById STATUS: SUCCESS');
        if(!user) {
          console.log("info : wrong username");
          return resolve({"info": " wrong username"});
        }
        resolve(user.preferences);
      });
  });
}
function setPref(userId, userParam) {
  console.log("Trace: setPrefById("+userId+")");
    return new Promise((resolve, reject) => {
          var obj = JSON.parse(userParam);
          var conditions = {_id: ObjectId(userId)},
          update = {'preferences.0.value':obj[0].value,
                    'preferences.1.value':obj[1].value,
                    'preferences.2.value':obj[2].value,
                    'preferences.3.value':obj[3].value,
                    'preferences.4.value':obj[4].value,
                    'preferences.5.value':obj[5].value,
                    'preferences.6.value':obj[6].value,
                    'preferences.7.value':obj[7].value,
                    'preferences.8.value':obj[8].value,
                    },
          opts = {new:true};
          User.update(conditions, update, opts,
            (err) => {
                if(err) {
                  reject({"error": err});
                  console.log('updatePREF STATUS: FAILED' + err);
                } else{
                  console.log(`updatePREF STATUS: SUCCESS`);
                }
            });
          resolve(obj);
    });
}

function addTrackToPlaylist(trackId, userId, playlistName) {
  console.log('Trace: addTrackToPlaylist('+trackId+','+userId+','+playlistName+')');
  return new Promise((resolve, reject) => {
    let user = getUserById(userId).then((user)=> {
      user.playlists.forEach(function(pl) {
        if(pl.name === playlistName){
          ts.getTrackById(trackId).then ((trk) => {
            pl.tracks.push(trk);
            user.save((err) => {
              if(err){
                console.log(`err: ${err}`);
                resolve(false);
                return;
              }
              else
                console.log(`Saved document: ${user.username}`);
            });
          }); 
        }
      });
    resolve(true);
    });
  });
}
function removeTrackFromPlaylist(trackId, userId, playlistName) {
  console.log('Trace: removeTrackFromPlaylist('+trackId+','+userId+','+playlistName+')');
  return new Promise((resolve,reject) => {
    let user = getUserById(userId).then((user)=> {
      for(let pIndex = 0; pIndex < user.playlists.length; pIndex++) {
        if(user.playlists[pIndex].name === playlistName) {
          console.log(`found playlist: ${playlistName}`);
          for(let tIndex = 0; tIndex < user.playlists[pIndex].tracks.length; tIndex++) {
            if(user.playlists[pIndex].tracks[tIndex].name === trackId){
              console.log(`found track in playlist`);
              user.playlists[pIndex].tracks.splice(tIndex,1);
              user.save((err) => {
                if(err) {
                  console.log(`err: ${err}`);
                  resolve(false);
                  return;
                }
                else {
                  console.log(`Saved document: ${user.username}`);
                  resolve(true);
                  return;
                }   
              });
            }  
          }
        }
      }
    });
    resolve(false);
  });
}

function removePlaylist(userId, playlistName) {
  console.log('Trace: removePlaylist('+userId+','+playlistName+')');
  return new Promise((resolve,reject) => {
    let user = getUserById(userId).then((user)=> {
      for(let pIndex = 0; pIndex < user.playlists.length; pIndex++) {
        if(user.playlists[pIndex].name === playlistName) {
          console.log(`found playlist: ${playlistName}`);
          user.playlists.splice(pIndex,1);
          user.save((err) => {
            if(err) {
              console.log(`err: ${err}`);
              resolve(false);
              return;
            }
            else {
              console.log(`Saved document: ${user.username}`);
              return resolve(true);
            }   
          });
        }
      }
    });
    resolve(false);
  });
}
function getPlaylistsById(userId){
  console.log("Trace: getPlaylistsById("+userId+")");
  return new Promise((resolve, reject) => {
    User.findOne({_id: ObjectId(userId)},
      (err, user) => {
        if(err) {
          console.log('getPlaylistsById STATUS: FAILED');
          reject({"error": err});
        }
        if(!user) {
          console.log("info : wrong username");
          return resolve({"info": " wrong username"});
        }
        console.log('getPlaylistsById STATUS: SUCCESS');
        resolve(user.playlists);
      });
  });
}