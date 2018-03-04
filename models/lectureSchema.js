let mongoose = require (`mongoose`),
    schema = mongoose.Schema,
    lectureSchema = new schema({
        name: {type: String,required: true},
        lecturer_name: {type: String,required: true},
        visitor_id: [String],
        description:{type: String,required: true},
        topic: [string],
        duration:{type: double,required: true},
        ratings:{
            visitor_id:{type: String,required: true},
            lecture_rating:{type: double,required: true},
            lecture_rating:{type: double,required: true},
            lecturer_rating:{type: double,required: true},
            overall_rating:{type: double,required: true},
        },
        total_rating:{type: double}
    },{collection:`lecture`});

exports.Lecture = mongoose.model(`lecture`, conferenceSchema);

exports.lectureSchema=lectureSchema;
