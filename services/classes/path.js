class Path {
  constructor(variables) {
    this.variables = variables;
    this.conf = variables["conf"];
    this.visitor = variables["visitor"];
    this.program = this.conf["sessions"];
    this.build = {
      "lecture" : Array.apply(null, Array(this.conf["sessions"].length)).map(function() { return 0 }),
      "elc_mode" : Array.apply(null, Array(this.conf["sessions"].length)).map(function() { return 0 })
    }

  }
  insertByPref(next) {
    console.log("Starting to build by the visitor's preffered Lectures");
    if (this.visitor["preffered_lectures"] === undefined || this.visitor["preffered_lectures"].length == 0){
      console.log("Visitor has no preffered lectures");
      next(null,build);
    }
    for (var i = 0; i < this.conf["lectures"].length; i++) {
      if (this.visitor["preffered_lectures"].indexOf(this.conf["lectures"][i]["_id"]["$oid"]) > -1) //conf["lectures"][i]["_id"]["$oid"]){
      {
        try {
          var indexofLec = this.program.indexOf(this.conf["lectures"][i]["session"]["session"]);
          this.build["lecture"][indexofLec] = this.conf["lectures"][i];
          this.build["elc_mode"][indexofLec] = 'learn';
          //need to delete all elctures form list that are in the same session
          console.log("entered lecture to index: " + indexofLec);
        } catch (err) {
		      next(err);
        }

      }
    }
    next(null, this.build);
  }
}

module.exports = Path;



//
// function Person() {
//   this.id = 'id_1';
// }
// Person.prototype.setName = function(name) {
//   this.name = name.charAt(0).toUpperCase() + name.slice(1);
// };
