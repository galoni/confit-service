let mongoose = require (`mongoose`),
    schema = mongoose.Schema,
    sessionSchema = new schema({
        name: {type: String,required: true},
        session_type: {type: String,required: true},
        duration:{type: float,required: true},


    },{collection:`conference`});


exports.Session = mongoose.model(`session`, sessionSchema);

exports.sessionSchema=sessionSchema;
