let mongoose = require (`mongoose`),
    push_notificationSchema = new mongoose.Schema({
        topic: {type: String,required: true},
        message: []
    });

module.exports = mongoose.model(`push_notification`, push_notificationSchema);
