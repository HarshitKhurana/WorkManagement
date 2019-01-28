var express = require('express')
var bodyParser = require('body-parser')
var app = express();

// Setting up view engine : using embedded JS
app.set('view engine' , "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var time = Number(new Date());
// ["Heading" , "Task Explaination" , "Group Name" , Deadline Time (epoch), "Task Status, True = Completed", False = not-completed" ]

// backend will store epoch front-end will convert it to dateTime
// typecast string("false") to bool in JS : a = (a == "false")

//    REDIS integration : Pull all data from redis with key being 'workManagementdata'
var redis = require('redis');
var client = redis.createClient();
var workList = [];
var headingArr = [];
var groupList = [];

function fetchFromRedis() {
  console.log ("Since fetching from redis, thus initialising everything will empty list");
  workList = [];
  headingArr = [];
  groupList = [];

  client.hgetall('workManagementdata', function(err, redisData) {
    console.log ("REDIS REPLY : " , redisData);
    if (redisData == undefined) {
      console.log ("REDIS returned empty|null|undefined\n")
      return;
    }
    //console.log("redisData : ",typeof(redisData) , "----->" , JSON.stringify(redisData)) ;
    var a = Object.values(redisData);
    //console.log ("JSON : " , a);
    for (i in a)  {
      let js = JSON.parse(a[i])
      var temp = [js["heading"] , js["task"] , js["group"] , js["deadline"] , js["taskStatus"]]
      headingArr.push(js["heading"]);
      workList.push(temp);
      if (!groupList.includes(js["group"])) {
        groupList.push(js["group"]);
      }
    }
  console.log ("Updating WORKLIST fetched from redis : " ,workList);
  });
}

// Function used to update data in redis : Use it after every change made in tasks i.e added|deleted|modified and pass workList as argument.
function updateDataInRedis(data) {
  for (let i = 0 ; i < data.length ; i++){
    console.log ("data[",i,"] : ", data[i])
    let a = {
      "heading" : data[i][0],
      "task" : data[i][1],
      "group" : data[i][2],
      "deadline" : data[i][3],
      "taskStatus" : data[i][4]
    };
    client.hset('workManagementdata', String (data[i][0]), JSON.stringify(a), function(reply , err){
      if(err)
        console.log ("Error : " ,err)
      else
        console.log ("Done for" , i , " : ", String(a));
    });
  }
  // Now update the workList too by fetching back from redis. 
  fetchFromRedis();
}



client.on('connect', function() {
  console.log('connected to redis, fetching data from redis...');
  fetchFromRedis();
});




//    
//     Routes definition


// default
app.get("/" , function (req , res){
  //res.sendFile(__dirname + '/index.html'); // __dirname is a method of global object
  // ejs page is rendered unlike sending in case of html
//  console.log ("request on '/' workList : ",workList , " \t groupList : " ,groupList)
  res.render("index.ejs" , {workList: workList , groupList: groupList});
  return;
});

// redirect to tasks page.
app.get("/task" , function (req , res){
  console.log ("request on '/task' workList : ",workList , " \t groupList : " ,groupList)
  res.render("task.ejs" , {workList: workList , groupList: groupList})
  return;
});

// redirect to editTask page
app.get('/editTask' , function(req,res){
  console.log ('Requested resource : ',req.params['0'])
  res.render("editTask.ejs" , {workList: workList , groupList: groupList})
});

// redirect to group page.
app.get("/group" , function (req , res){
  console.log ("request on '/group' workList : ",workList , " \t groupList : " ,groupList)
  res.render("group.ejs" , {workList: workList , groupList: groupList});
  return;
});




// Get request to fetch tasks and return them in sorted order
app.get("/deadline" , function (req , res){
  console.log ("request arrived on '/deadline', returning JSON of sorted dates");
//  res.redirect('/');
//  return;

// NEED TO FIX THIS AS FRONTEND SENDS DEADLINE IN : yyyy-mm-dd format. 

  let tempObj = {};  // for ts:obj
  let tempArr = []; // for ts
  let responseObject = [] ; // It is simply an array of objects sorted as per their timestamp (ascending order).
  for (let  i = 0; i < workList.length; i ++) {
    tempArr.push( workList[i][3]); // Deadline is at 3rd index , push it's epoch
    tempObj[workList[i][3]] = workList[i]; // Json of ts:obj for O(1) access.
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

  console.log ("WorkList : " , workList);
  console.log ("Updating Redis with newly modified data .")
  updateDataInRedis(workList);
  res.redirect("/");
  return;
});



// submit route : post req , to toggle the completed status of a task.
app.post('/task/toggleStatus' , function (req , res){
  console.log ('Requested resource : /task/toggleStatus' , "\tparams : ",req.body);
  var heading = req.body.heading;
  var newStatus="";
  var oldStatus = [];
  console.log ("WorkList : " ,workList);
  for (let  i = 0 ; i < workList.length ; i ++)
  {
    if (workList[i][0] === heading)
      {
        console.log(" Task found , BEFORE toggling status", workList[i][4])
        workList[i][4] = !workList[i][4] ;
        console.log(" Task found , AFTER toggling status" , workList[i][4])        
      }
  }
  updateDataInRedis(workList);
  res.status(200).send(''); // Just to tell that request is successfull.
});



// submit route : post req , Set default value of taskStatus to 'False'
app.post('/task/new' , function (req , res){
  console.log("Item submitted (req.body) : " , req.body)
  var heading = req.body.heading;     // headingis the name of input fields in index.ejs
  var task = req.body.task;           // task is the name of input fields in index.ejs
  var group = req.body.group;         // group is the name of input fields in index.ejs
  var taskStatus = false;             //Set default value of taskStatus to 'False'
  let deadline = req.body.deadline;   // deadline is the name of input fields in index.ejs (Must be a valid Date time)
  
  var currArr = [heading , task , group , deadline , taskStatus]
  // They will always have some value
  console.log("currArr : ",currArr)
  if (headingArr.includes(heading)  )   {
        console.log ("Check failed : " , heading ," is a repeated entry");
        res.redirect ("/task"); // Send to default route which will have updated list.
        return;
      } 
  if (! groupList.includes(group))  {
        console.log (" Group doesn't exists: ",group);
        res.redirect ("/task"); // Send to default route which will have updated list.
        return;
      } 
  else{
        console.log ("Check Passed pushing");
        headingArr.push(heading); // Push heading in headingArr used for ensuring no 2 enteries has same heading
        workList.push(currArr);
        console.log("New headingArr : ",headingArr)
        console.log ("New Worklist : ", workList)
        res.redirect ("/task"); // Send to default route which will have updated list.
      }
  console.log ("Updating Redis with newly modified data .")
  updateDataInRedis(workList);
  
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
      res.redirect ("/group"); // Send to default route which will have updated list.
      return;
    }
  }

  if (groupList.includes(newGroupReq) || groupList.includes(newGroupReq.toLowerCase()) || newGroupReq === "" )  {
    console.error("Request failed, group already present");
    res.redirect ("/group"); // Send to default route which will have updated list.
    return;
  }
  groupList.push(newGroupReq);
  console.log ("Request : Added group");
  res.redirect ("/group"); // Send to default route which will have updated list.
});





// delete request to delete a specific task depending on heading
app.post("/task/delete", function (req , res){
  console.log ("request for task deletion : body : ",req.body)
  var heading = req.body.heading;     // headingis the name of input fields in index.ejs
  console.log("Deleting  heading:",heading);
  console.log("Current headingArr : " , headingArr)
  console.log("Current WorkList : " , workList,"\n")

  if (! headingArr.includes(heading)  )   {
    console.log("heading not found...redirecting");
    res.redirect ("/editTask"); // Send to default route which will have updated list.
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
  console.log ("Deleting from Redis")

  client.hdel("workManagementdata", heading , function (){
    console.log ("Deleted from redis : " , heading)
  });
  fetchFromRedis();
  res.redirect ("/editTask"); // Send to default route which will have updated list.
});




// delete request to delete a group
app.post("/group/delete", function (req , res){
  console.log("'/group/delete : '",req.body);
  var groupName = req.body.group;
  console.log("Deleting  group :",groupName);
  console.log("Current groupList : " , groupList)

  if (! groupList.includes(groupName)  )   {
    console.log("groupName not found in list...redirecting");
    res.redirect ("/group"); // Send to default route which will have updated list.
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
  console.log ("Updating Redis with newly modified data .")
  updateDataInRedis(workList);
  res.redirect ("/group"); // Send to default route which will have updated list.
});



// For un-defined routes
app.get("*" , function (req , res){
  console.log ("Requested resource '",req.params['0'],"' is invalid, Redirecting to '/'...\n");
  res.redirect(302,"/");
});


app.listen(8080 , function (req , res) {
  console.log ("Server started on http://127.0.0.1:8080")
});
