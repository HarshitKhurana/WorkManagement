var redis = require('redis');
var client = redis.createClient();
var workList = []
client.on('connect', function() {
console.log('connected to redis, fetching data from redis...');
console.log ("WORKLIST : " ,workList)
});



var dataa = [ [ 'AWS IAM', 'AWS IAM study till 1stFeb,19', 'Devops', '2018-1-31' , false ], [ 'DCE', 'Testing..', 'application', '2018-1-31' , false ], ]

function updateRedisData(data){
  for (let i = 0 ; i < data.length ; i++){
    //console.log ("data[",i,"] : ", data[i])
    let a = {
      "heading" : data[i][0],
      "task" : data[i][1],
      "group" : data[i][2],
      "deadline" : data[i][3],
      "taskStatus" : data[i][4]
    };
    console.log ("Pushin in redis : " , a)
    client.hset('workManagementdata', String (data[i][0]), JSON.stringify(a), function(reply , err){
      if(err)
        console.log ("Error : " ,err)
      else
        console.log ("Done for" , i , " : ", String(a));
    });
  }
}
updateRedisData(dataa);



