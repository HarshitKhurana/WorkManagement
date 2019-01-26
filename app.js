var express = require('express')
var bodyParser = require('body-parser')
var app = express();

// Setting up view engine : using embedded JS
app.set('view engine' , "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var time = new Date();
// ["Heading" , "Task Explaination" , "Group Name" , Deadline Time , "Task Status, True = Completed", False = not-completed"]
// typecast string("false") to bool in JS : a = (a == "false")
var work = [ "H1" , "T1-Demo" , "G1-Demo" , time , false]
var headingArr = ["H1" , "H2" , "H3"]
var workList = [work]
workList.push([ "H2" , "T2" , "G2" ,new Date(Number(time)-10000), false ])
workList.push([ "H3" , "T3" , "G3" ,new Date(Number(time)-20000), false ])

var groupList = ["G1"]
for (let i =0 ; i < 10 ; i ++){
  groupList.push("G"+String(i))
}

//    REDIS integration left.
//    
//     Routes definition


// default
app.get("/" , function (req , res){
  //res.sendFile(__dirname + '/index.html'); // __dirname is a method of global object
  // ejs page is rendered unlike sending in case of html
  res.render("index.ejs" , {workList: workList})
});




// Get request to fetch tasks and return them in sorted order
app.get("/deadline" , function (req , res){
  console.log ("request arrived on '/deadline', returning JSON of sorted dates");
  let tempObj = {};  // for ts:obj
  let tempArr = []; // for ts
  let responseObject = [] ; // It is simply an array of objects sorted as per their timestamp (ascending order).
  for (let  i = 0; i < workList.length; i ++) {
    tempArr.push( Number(workList[i][3])); // Deadline is at 3rd index , push it's epoch
    tempObj[Number(workList[i][3])] = workList[i]; // Json of ts:obj for O(1) access.
  }
  
  tempArr.sort();   // sort tempArr;
  for (let  i = 0 ; i < tempArr.length; i ++ )   {
      // Add to responseObject in sorted manner.
      responseObject[i] = tempObj[tempArr[i]];
  }
  console.log ("RETURNING SORTED : " , responseObject);
  res.json ({'sorted' : responseObject}); // Sending back JSON

});



// Post request for task Completed with heading in body i.e to be marked as completed.
app.post ("/task/completed" , function( req ,res ){
  console.log ("Request on '/task/completed' : ",req.body.heading);
  let heading = req.body.heading;
  let marked = false;   // boolean to mark
  if ( !headingArr.includes(heading))   {
    console.log ("No task with heading :",heading," found");
    res.redirect("/");
    return;
  }

  console.log ("Marking task:",heading , " as completed");
  for (let i = 0 ; i < workList.length; i ++)  {
    console.log ("Trying for task : " , workList[i])
    if (workList[i][0] === heading)
    {
      console.log ("Task mark as completed");
      marked = true;
      workList[i][4] = marked;
      console.log ("After marking : " , workList[i])
      break;
    }
  }
  if (!marked)  {
    console.log ("Unable to mark task as completed")
  }

  console.log ("WorkList : " , workList)
  res.redirect("/");
  return;
});





// submit route : post req , Set default value of taskStatus to 'False'
app.post('/task/new' , function (req , res){
  console.log("Item submitted (req.body) : " , req.body)
  var heading = req.body.heading;     // headingis the name of input fields in index.ejs
  var task = req.body.task;           // task is the name of input fields in index.ejs
  var group = req.body.group;         // group is the name of input fields in index.ejs
  var deadline = req.body.deadline;   // deadline is the name of input fields in index.ejs
  var taskStatus = false;             //Set default value of taskStatus to 'False'
  var currArr = [heading , task , group , deadline , taskStatus]
  // They will always have some value
  console.log("currArr : ",currArr)
  if (headingArr.includes(heading)  )   {
        console.log ("Check failed : " , heading ," is a repeated entry");
        res.redirect ("/"); // Send to default route which will have updated list.
        return;
      } 
  if (! groupList.includes(group))  {
        console.log (" Group doesn't exists: ",group);
        res.redirect ("/"); // Send to default route which will have updated list.
        return;
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



app.get("/print" , function(req, res){
  console.log ("WorkList   : " , workList);
  let i = 9999 * 9999 ;
  console.log ("headingArr : " , headingArr);
  i = 9999 * 9999 ;
  console.log ("groupList   : " , groupList);
  i = 9999 * 9999 ;
  res.redirect("/");
  return;
});


// Add new group
app.post('/group/new' , function (req , res){
  console.log("Request : add newGroup : " , req.body);
  var newGroupReq = req.body.group;
  // group should not contain any numeric value
  for (let i = 0 ; i < 10; i ++)  {
    if (newGroupReq.includes(String(i))){
      console.log("group should not contain any numeric value : " ,newGroupReq);
      res.redirect ("/"); // Send to default route which will have updated list.
      return;
    }
  }

  if (groupList.includes(newGroupReq) || groupList.includes(newGroupReq.toLowerCase()))  {
    console.error("Request failed, group already present");
    res.redirect ("/"); // Send to default route which will have updated list.
    return;
  }
  groupList.push(newGroupReq);
  console.log ("Request : Added group");
  res.redirect ("/"); // Send to default route which will have updated list.
});





// delete request to delete a specific task depending on heading
app.delete("/task/delete", function (req , res){
  var heading = req.body.heading;     // headingis the name of input fields in index.ejs
  console.log("Deleting  heading:",heading);
  console.log("Current headingArr : " , headingArr)
  console.log("Current WorkList : " , workList,"\n")

  if (! headingArr.includes(heading)  )   {
    console.log("heading not found...redirecting");
    res.redirect ("/"); // Send to default route which will have updated list.
    return;
  }

  try{
     headingArr = headingArr.filter( g => g != heading);
  }
  catch(error)  {
    console.error("Error : ",error);
  }
  for (var i = 0 ; i < workList.length; i ++) {
    if (workList[i][0] === heading) {
      console.log("heading found...deleting..",workList[i])
      workList = workList.filter( g => g != workList[i]);
    }
  }
  console.log("workList after deleting : " , workList);
  res.redirect ("/"); // Send to default route which will have updated list.
});





// delete request to delete a group
app.delete("/group/delete", function (req , res){
  var groupName = req.body.group;
  console.log("Deleting  group :",groupName);
  console.log("Current groupList : " , groupList)

  if (! groupList.includes(groupName)  )   {
    console.log("groupName not found in list...redirecting");
    res.redirect ("/"); // Send to default route which will have updated list.
    return;
  }

  try{
     console.log ("this won't delete the groupName from existing Todo|Notes , but would simply restrict user from using this name for future tasks.")
     groupList = groupList.filter( g => g != groupName);
     console.log ("Deleted..")
  }
  catch(error)  {
    console.error("Error deleting groupName: ",error);
  } 
  console.log("groupList after deleting : " , groupList);
  res.redirect ("/"); // Send to default route which will have updated list.
});




// For un-defined routes
app.get("*" , function (req , res){
  console.log ("Request on invalid page. Redirecting...\n")
  res.redirect(302,"/");
});





app.listen(8080 , function (req , res) {
  console.log ("Server started on http://127.0.0.1:8080")
});
