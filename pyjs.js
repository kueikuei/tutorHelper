var spawn = require("child_process").spawn;

var process = spawn('python', ["./server.py"]
);
// console.log(process)

process.stdout.on('data', function(data) { 
    console.log(data.toString()); 
} ) 


// curl -X POST https://api.line.me/liff/v1/apps  
// -H "Authorization: Bearer R2/T8qgK3AP4B73Z7n7bW7D5D27GY6+7Q1qJSAE57GnnzP6EOQ4Z7fle7FGsKlPpi+UF+bwpLrLY/uIIBViRV2ZibctziHiJLN8b3flPog6odZcJUY1q+T6cQAtvXgyQYk/J1egiSwN1aU0z/MiPVAdB04t89/1O/w1cDnyilFU=" 
// -H "Content-Type: application/json"   
// -d '{ "view":{ "type":"full或tall或campact", "url":"https://wpfab.co/ak_v2/liff_parent/" } }'