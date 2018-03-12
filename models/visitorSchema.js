let mongoose = require (`mongoose`),
    visitorSchema =new mongoose.Schema({
        name: {
          first_name: {type: String,required: true},
          last_name: {type: String,required: true},
        },
        linkedin: {type: String,required: true},
        education: {type: String,required: true},
        occupation:{type: String,required: true},
        profile_pie: {type: Number},
        connection_percent: {type: Number,required: true},
        explore_percent: {type: Number,required: true},
        learn_percent: {type: Number,required: true},
        current_mode:{type: String},
        custome_path:[String],
        confs: [String],
        preffered_lectures: [String],
        qr_code: {type: String}
    });

module.exports = mongoose.model(`visitor`, visitorSchema);
