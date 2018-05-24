let mongoose = require (`mongoose`),
    visitorSchema =new mongoose.Schema({
        name: {
          first_name: {type: String,required: true},
          last_name: {type: String,required: true},
        },
        linkedin: {type: String,required: true},
        education: {type: String,required: true},
        occupation:{type: String,required: true},

        current_mode:{type: String},
        confs: [],
        qr_code: {type: String},
        profilePic: {type: String}
    });

module.exports = mongoose.model(`visitor`, visitorSchema);
