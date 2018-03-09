let mongoose = require (`mongoose`),
    lectureSchema = new mongoose.Schema({
        name: {type: String,required: true},
        lecturer_name: {type: String,required: true},
        visitor_id: [],
        description:{type: String,required: true},
        topic: [],
        duration:{type: Number ,required: true},
        ratings:[],
        total_rating:{type: Number}
    });

module.exports = mongoose.model(`lecture`, lectureSchema);
