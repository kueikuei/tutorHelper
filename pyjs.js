var spawn = require("child_process").spawn;

var process = spawn('python', ["./server.py"]
);
// console.log(process)

process.stdout.on('data', function(data) { 
    console.log(data.toString()); 
} ) 