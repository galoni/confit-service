var mongoose = require (`mongoose`);
var confSession = new mongoose.Schema({
    name: { type: String },
    session_type: { type: String },
    duration:{ type: Number }
});

module.exports = mongoose.model('session', confSession);

//     schema = mongoose.Schema,
//     sessionSchema = new schema({
//         name: {type: String,required: true},
//         session_type: {type: String,required: true},
//         duration:{type: Number,required: true},


//     },{collection:`session`});


// exports.confSession = mongoose.model(`session`, sessionSchema);

// exports.sessionSchema=sessionSchema;

