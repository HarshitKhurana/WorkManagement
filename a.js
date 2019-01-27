var redis = require('redis');
var client = redis.createClient();

client.on('connect', function() {
      console.log('connected');
});

var data = [ [ 'H1', 'T1-Demo', 'G1-Demo', 1548533106474, false ], [ 'H2', 'T2', 'G2', 1548533096474, false ], [ 'H3', 'T3', 'G3', 1548533086474, false ] ];

function afunc(){
 setTimeout(
   function(){
    for (let  i = 0 ; i < data.length ; i ++) {
      console.log( "Pushed : " , String(data[i]), "\n");
      client.hmset( "data" , String(data[i]) , function(reply , err){
        if (err)
        {
          console.log ("Erorr occcured ")
        } 
      });
    }
  } , 5000);
 aget();
}

afunc();
aget();

function aget() {
  client.hgetall('data', function(err, reply) {
    console.log ("REDIS REPLY : " , reply);
    var redisData = reply;
    console.log("redisData : ",typeof(redisData) , "----->",redisData);
  });
}



