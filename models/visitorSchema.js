let mongoose = require (`mongoose`),
    visitorSchema =new mongoose.Schema({
        name: {
          first_name: {type: String,required: true},
          last_name: {type: String,required: true},
        },
        linkedin: {type: String,required: true},
        education: {type: String,required: true},
        occupation:{type: String,required: true},
        profile_pie: {type: String},
        current_mode:{type: String},
        custome_path:[String],
        confs: [String],
        preffered_lectures: [String],
        qr_code: {type: String}
    });

module.exports = mongoose.model(`visitor`, visitorSchema);
