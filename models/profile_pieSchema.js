let mongoose = require (`mongoose`),
    profile_pieSchema = new mongoose.Schema({
        visitor_id: {type: String,required: true},
        conference_id: {type: String,required: true},
        connection_percent: {type: Number,required: true},
        explore_percent: {type: Number,required: true},
        learn_percent: {type: Number,required: true}
    });

module.exports = mongoose.model(`profile_pie`, profile_pieSchema);



