var mongoose = require (`mongoose`);
var conferenceSchema = new mongoose.Schema({
        name: {type: String,required: true},
        type: {type: String,required: true},
        logo: {type: String,required: true},
        audience:{type: String,required: true},
        start_date: {type: String,required: true},
        end_date:{type: String,required: true},
        main_topics:[],
        location:{type: String,required: true},
        lectures:[],
        exhibits:[],
        program:[],
        overall_rating: { type: Number }
    });
module.exports = mongoose.model(`conference`, conferenceSchema);
