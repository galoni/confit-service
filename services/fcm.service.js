var service = {};

service.sendMessage = sendMessage;
service.subscribeToTopic = subscribeToTopic;
service.getMessagesByTopic = getMessagesByTopic;

module.exports = service;

var admin = require('firebase-admin');
var push_notificationSchema = require('../models/push_notificationSchema');
var serviceAccount = require('./confit-22c50-firebase-adminsdk-wd54s-8872b20e4d.json');

// Initialize the default app
var defaultApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://confit-22c50.firebaseio.com'
});

// console.log(defaultApp);  // '[DEFAULT]'
function sendMessage(topicName, msg_body) {
  // var registrationToken = 'cjjnP5ffna0:APA91bHlGDjyLG0QkBdgRL1_aA1c5kosRgvsDZFPf7d2isVWh8i1HfX2Ih8e7eWNVaI0hOIjGb1ONayIq6uRJWTdWO09w9LdGEGMjGxZobSePoeH7ierzQb8lbFIt3HS_Tz7U5vjfAJv';
  topicName = topicName.replace(/[^a-z0-9]/gi, '');
  return new Promise((resolve, reject) => {
    // See documentation on defining a message payload.
    var message = {
      notification: {
        title: 'Confit',
        body: msg_body,

      },
      android: {
        ttl: 3600 * 1000,
        notification: {
          icon: 'https://logo-storage.s3.amazonaws.com/confit_logo.png',
          color: '#f45342',
          title: 'Confit',
          body: msg_body,
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 42,
            title: 'Confit',
            body: msg_body,
          },
        },
      },
      webpush: {
        data: {
          "name": "wrench"
        },
        notification: {
          icon: 'https://logo-storage.s3.amazonaws.com/confit_logo.png',
        }
      },
      topic: '/topics/' + topicName,
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    admin.messaging().send(message)
      .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:' + response + ', message: ' + msg_body);
        push_notificationSchema.findOne({
          "topic": topicName
        }, function(err, doc) {
          console.log("found topic");
          if (doc) {
            push_notificationSchema.update({
                "topic": topicName
              }, {
                "$push": {
                  "message": msg_body
                },
              },
              function(err, doc) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("success " + topicName + " updated");
                }
              }
            );
          } else {
            push_notificationSchema.create({
                "topic": topicName
              }, {
                "$push": {
                  "message": msg_body
                },
              },
              function(err, doc) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("success " + topicName + " updated");
                }
              }
            );
          }
        });

        resolve('Successfully sent message:' + response + ', message: ' + msg_body);
      })
      .catch((error) => {
        console.log('Error sending message:' + error);
        reject('Error sending message:' + error);
      });
  });


}

function subscribeToTopic(tokens, topic) {
  topic = topic.replace(/[^a-z0-9]/gi, '');
  return new Promise((resolve, reject) => {
    // Subscribe the devices corresponding to the registration tokens to the
    // topic.
    console.log("token to subscribe: " + tokens);
    console.log("topic to subscribe: " + topic);
    admin.messaging().subscribeToTopic(tokens, topic)
      .then(function(response) {
        // See the MessagingTopicManagementResponse reference documentation
        // for the contents of response.
        console.log('Successfully subscribed to topic %s: %j', topic, response);
        resolve('Successfully subscribed to topic: %j', response);
      })
      .catch(function(error) {
        console.log('Error subscribing to topic:' + error);
        reject('Error subscribing to topic:' + error);
      });
  });
}

function getMessagesByTopic(topic) {
  return new Promise((resolve, reject) => {
    console.log("topic: " + topic);
    push_notificationSchema.findOne({
      "topic": topic
    }, function(err, push_notification) {
      console.log("found topic");
      console.log(push_notification);
      if (push_notification) {
        console.log('getMessagesByTopic STATUS: SUCCESS');
        console.log(push_notification);
        resolve(push_notification);
      }
      if (err) {
        console.log('getMessagesByTopic STATUS: FAILED');
        reject(err);
      }
      console.log("info : wrong topic");
      return resolve("error : wrong topic");
    });
  });
}
