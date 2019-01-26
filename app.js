var express = require('express')
var bodyParser = require('body-parser')
var app = express();

// Setting up view engine : using embedded JS
app.set('view engine' , "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var work = [ "H1" , "T1-Demo" , "G1-Demo" , "D1-Demo"]
//var headingArr = [work[0]]
var headingArr = ["H1" , "H2" , "H3"]
var workList = [work]
workList.push([ "H2" , "T2" , "G2" , "D2"])
workList.push([ "H3" , "T3" , "G3" , "D3"])

var groupList = ["G1"]
groupList.push("G2")

//     Routes definition


// default
app.get("/" , function (req , res){
  //res.sendFile(__dirname + '/index.html'); // __dirname is a method of global object
  
  // ejs page is rendered unlike sending in case of html
  res.render("index.ejs" , {workList: workList})
});


// For un-defined routes
app.get("*" , function (req , res){
  res.redirect(302,"/");
});


// submit route : post req
app.post('/newtodo' , function (req , res){
  console.log("Item submitted (req.body) : " , req.body)
  var heading = req.body.heading;     // headingis the name of input fields in index.ejs
  var task = req.body.task;           // task is the name of input fields in index.ejs
  var group = req.body.group;         // group is the name of input fields in index.ejs
  var deadline = req.body.deadline;   // deadline is the name of input fields in index.ejs
  var currArr = [heading , task , group , deadline]
  // They will always have some value
  console.log("currArr : ",currArr)
  if (headingArr.includes(heading)  )   {
        console.log ("Check failed : " , heading ," is a repeated entry");
        res.redirect ("/"); // Send to default route which will have updated list.
      } 
  else    {
        console.log ("Check Passed pushing");
        headingArr.push(heading); // Push heading in headingArr used for ensuring no 2 enteries has same heading
        workList.push(currArr);
        console.log("New headingArr : ",headingArr)
        console.log ("New Worklist : ", workList)
        res.redirect ("/"); // Send to default route which will have updated list.
  }
  
});

// Add new group
app.post('/newGroup' , function (req , res){
  console.log("Request : add newGroup : " , req.body);
  var newGroupReq = req.body.group;
  if (groupList.includes(newGroupReq))  {
    console.error("Request failed, group already present");
    res.redirect ("/"); // Send to default route which will have updated list.
    return;
  }
  groupList.push(newGroupReq);
  console.log ("Request : Added group");
  res.redirect ("/"); // Send to default route which will have updated list.
});

// delete request to delete a specific task depending on heading
app.delete("/todo/delete", function (req , res){
  var heading = req.body.heading;     // headingis the name of input fields in index.ejs
  console.log("Deleting  heading:",heading);
  console.log("Current headingArr : " , headingArr)
  console.log("Current Worklist : " , workList,"\n")

  if (! headingArr.includes(heading)  )   {
    console.log("heading not found...redirecting");
    res.redirect ("/"); // Send to default route which will have updated list.
    return;
  }

  try{
     headingArr.pop(heading);
  }
  catch(error)  {
    console.error("Error : ",error);
  }
  for (var i = 0 ; i < workList.length; i ++) {
    if (workList[i][0] === "heading") {
      console.log("heading found...deleting..")
      workList.pop(i);
    }
  }
  console.log("workList after deleting : " , workList);
  res.redirect ("/"); // Send to default route which will have updated list.
});

app.listen(8080 , function (req , res) {
  console.log ("Server started on http://127.0.0.1:8080")
}
    );
