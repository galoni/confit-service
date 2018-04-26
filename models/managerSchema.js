let mongoose = require (`mongoose`),
    managerSchema = new mongoose.Schema({
        name: {
          first_name: {type: String,required: true},
          last_name: {type: String,required: true},
        },
        linkedin: {type: String,required: true},
        education: {type: String,required: true},
        occupation:{type: String,required: true},
        confs: [],
    });

module.exports = mongoose.model(`manager`, managerSchema);
