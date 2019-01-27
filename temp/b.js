var redis = require('redis');
var client = redis.createClient();
var workList = []
client.on('connect', function() {
console.log('connected to redis, fetching data from redis...');

client.hgetall('workManagementdata', function(err, redisData) {
  console.log ("REDIS REPLY : " , redisData);
  if (redisData == undefined) {
    console.log ("REDIS returned empty|null|undefined\n")
    return;
  }
  console.log("redisData : ",typeof(redisData) , "----->" , JSON.stringify(redisData)) ;
  var a = Object.values(redisData);
  console.log ("JSON : " , a);
  for (i in a)  {
    let js = JSON.parse(a[i])
    var temp = [js["heading"] , js["task"] , js["group"] , js["deadline"] , js["taskStatus"]]
    workList.push(temp)
  }
console.log ("WORKLIST : " ,workList)
});
});



var dataa = [ [ 'H1', 'T1,Demo', 'G1-Demo', 1548537702559, false ], [ 'H2', 'T2,deom', 'G2', 1548537692559, false ], [ 'H3', 'T3,demo', 'G3', 1548537682559, false ] ]

function updateRedisData(data){
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
}
updateRedisData(dataa);



