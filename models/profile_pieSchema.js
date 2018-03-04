let mongoose = require (`mongoose`),
    schema = mongoose.Schema,
    profile_pieSchema = new schema({
        visitor_id: {type: String,required: true},
        conference_id: {type: String,required: true},
        connection_percent: {type: double,required: true},
        explore_percent: {type: double,required: true},
        learn_percent: {type: double,required: true}
    },{collection:`profile_pie`});


exports.Profile_pie = mongoose.model(`profile_pie`, conferenceSchema);

exports.profile_pieSchema=profile_pieSchema;
