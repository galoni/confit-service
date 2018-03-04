let mongoose = require (`mongoose`),
    schema = mongoose.Schema,
    managerSchema = new schema({
        name: {
          first_name: {type: String,required: true},
          last_name: {type: String,required: true},
        },
        linkedin: {type: String,required: true},
        education: {type: String,required: true},
        occupation:{type: String,required: true},
        custome_path:[String],
        confs: [],
    },{collection:`manager`});

exports.Manager = mongoose.model(`manager`, managerSchema);

exports.managerSchema=managerSchema;
