class Path {
  constructor(variables) {
    this.variables = variables;
    this.conf = variables["conf"];
    this.visitor = variables["visitor"];
    this.program = this.conf["sessions"];
    this.build = {
      "lecture": Array.apply(null, Array(this.conf["sessions"].length)).map(function() {
        return 0
      }),
      "elc_mode": Array.apply(null, Array(this.conf["sessions"].length)).map(function() {
        return 0
      })
    }
    this.learnSess = this.visitor["learn_percent"] * this.conf["sessions"].length;
    this.connectSess = this.visitor["connection_percent"] * this.conf["sessions"].length;
    this.ExploreSess = this.visitor["explore_percent"] * this.conf["sessions"].length;

  }

  //removing parallel sessions that was added to the path to avoid redundant calculations
  removeParallelSessions(session, next) {
    console.log("removing parallel sessions to save redundant calculations:");
    for (var i = 0; i < this.conf["lectures"].length; i++) {
      if (this.conf["lectures"][i]["session"]["session"] == session) {
        console.log("removing " + this.conf["lectures"][i]["name"]);
        this.conf["lectures"].splice(i, 1);
        i--;
      }
    }

  }
  //this algorythm takes the visitor's preffered lectures and add them to the path while considering the visitor's profile pie
  insertByPref(next) {
    var lecturesLength = this.conf["lectures"].length;
    var prefferedLength = this.visitor["preffered_lectures"].length;
    console.log("Starting to build by the visitor's preffered Lectures");
    if (this.visitor["preffered_lectures"] === undefined || this.visitor["preffered_lectures"].length == 0) {
      console.log("Visitor has no preffered lectures");
      next(null, build);
    }
    for (var j = 0; j < prefferedLength; j++) {
      var i = 0;
      while (lecturesLength) {
        if (this.conf["lectures"][i] == undefined) {
          break;
        }
        if (this.visitor["preffered_lectures"][j] == this.conf["lectures"][i]["_id"]["$oid"]) //conf["lectures"][i]["_id"]["$oid"]){
        {
          try {
            var indexofLec = this.program.indexOf(this.conf["lectures"][i]["session"]["session"]);
            if (indexofLec == -1){
              console.log("did not exist in program: " + this.conf["lectures"][i]["session"]["session"]);
              i++;
              continue;
            }
            if (this.learnSess > 0) {
              this.build["elc_mode"][indexofLec] = 'learn';
              this.learnSess -= 1;
            } else if (this.connectSess > 0) {
              this.build["elc_mode"][indexofLec] = 'connect';
              this.connectSess -= 1;
            } else {
              console.log("no slots of learn and connection left :)");
              break;
            }
            this.build["lecture"][indexofLec] = this.conf["lectures"][i];
            //need to delete all elctures form list that are in the same session
            console.log("entered lecture to index: " + indexofLec);
            this.removeParallelSessions(this.program[indexofLec]);
            break;
          } catch (err) {
            next(err);
          }


        }
        if (lecturesLength==i)break;
        i++;
      }
    }
    next(null, this.build);
  }

//this algorythm takes the visitor's main topics and add them to the path while considering the visitor's profile pie
  insertByTopic(next) {
    var lecturesLength = this.conf["lectures"].length;
    var mainTopicLength = this.visitor["mainTopic"].length;
    console.log("Starting to build by the visitor's main topics: ");
    if (this.visitor["mainTopic"] === undefined || mainTopicLength == 0) {
      console.log("Visitor has no main topics");
      next(null, build);
    }
    for (var i = 0; i < mainTopicLength; i++) {
      var x = 0;
      if (this.conf["lectures"][i]["topic"] == undefined) continue;
      while (lecturesLength){
        if (this.conf["lectures"][x] == undefined || lecturesLength == 0) {
          break;
        }
        for (var j = 0; j < this.conf["lectures"][x]["topic"].length; j++) {
          if (this.visitor["mainTopic"].indexOf(this.conf["lectures"][x]["topic"][j]) > -1 && (this.connectSess || this.learnSess)) //conf["lectures"][i]["_id"]["$oid"]){
          {
            try {
              var indexofLec = this.program.indexOf(this.conf["lectures"][x]["session"]["session"]);
              if (this.learnSess > 0) {
                this.build["elc_mode"][indexofLec] = 'learn';
                this.learnSess -= 1;
              } else if (this.connectSess > 0) {
                this.build["elc_mode"][indexofLec] = 'connect';
                this.connectSess -= 1;
              } else {
                console.log("no slots of learn and connection left :)");
                break;
              }
              this.build["lecture"][indexofLec] = this.conf["lectures"][x];
              //need to delete all elctures form list that are in the same session
              console.log("entered lecture to index: " + indexofLec);
              this.removeParallelSessions(this.program[indexofLec]);
              break;
            } catch (err) {
              next(err);
            }

          }
          // this.removeParallelSessions(this.program[indexofLec]);
          // i--;
        }
        if (lecturesLength==x)break;
        x++;
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
