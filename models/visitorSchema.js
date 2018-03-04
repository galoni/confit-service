let mongoose = require (`mongoose`),
    schema = mongoose.Schema,
    visitorSchema = new schema({
        name: {
          first_name: {type: String,required: true},
          last_name: {type: String,required: true},
        },
        linkedin: {type: String,required: true},
        education: {type: String,required: true},
        occupation:{type: String,required: true},
        profile_pie: {
          _id: {type: String},
          connection_percent: {type: String},
          explore_percent: {type: String},
          learn_percent: {type: String},
          conference_id: {type: String}
        },
        current_mode:{type: String,required: true},
        custome_path:[String],
        confs: [String],
        preffered_lectures: [String]
    },{collection:`visitor`});
    

exports.Visitor = mongoose.model(`visitor`, visitorSchema);

exports.visitorSchema=visitorSchema;
