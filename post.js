const https = require('https')
var spawn = require("child_process").spawn;

const options = {
    host: 'https://api.line.me/v2/bot/user/U3b90812bccb505e9a03722a0a772c894/richmenu/richmenu-18fd806c777d3fbea956cce0bee6d5ed/',
    method: 'POST',
    headers: {
        'Authorization': 'Bearer R2/T8qgK3AP4B73Z7n7bW7D5D27GY6+7Q1qJSAE57GnnzP6EOQ4Z7fle7FGsKlPpi+UF+bwpLrLY/uIIBViRV2ZibctziHiJLN8b3flPog6odZcJUY1q+T6cQAtvXgyQYk/J1egiSwN1aU0z/MiPVAdB04t89/1O/w1cDnyilFU='
    }
}

const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`)
})
req.on('error', (error) => {
    console.error(error)
})

// req.write(data)
req.end()

