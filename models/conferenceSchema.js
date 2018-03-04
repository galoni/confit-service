let mongoose = require (`mongoose`),
    schema = mongoose.Schema,
    conferenceSchema = new schema({
        name: {type: String,required: true},
        type: {type: String,required: true},
        logo: {type: String,required: true},
        audience:{type: String,required: true},
        start_date: {type: String,required: true},
        end_date:{type: String,required: true},
        main_topics:[String],
        location:{type: String,required: true},
        lectures:[lecture],
        exhibits:[exhibit],
        program:[String],
        overall_rating: {type: float, required: true}

    },{collection:`conference`});


exports.Conference = mongoose.model(`conference`, conferenceSchema);

exports.conferenceSchema=conferenceSchema;
