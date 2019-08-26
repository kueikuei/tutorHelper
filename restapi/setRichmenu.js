const fetch = require('node-fetch');
const express = require('express');
const app = express();

// 預設、家長、老師
var richmenuID = [
    'richmenu-b889b99a3c1e8763ee1b6b7df885b5b4',
    'richmenu-cb03a0262e8e4145ed160061cfaa2a56'
]

app.get('/setRichmenu',(req, res) => {

    var bearerStr = 'Bearer R2/T8qgK3AP4B73Z7n7bW7D5D27GY6+7Q1qJSAE57GnnzP6EOQ4Z7fle7FGsKlPpi+UF+bwpLrLY/uIIBViRV2ZibctziHiJLN8b3flPog6odZcJUY1q+T6cQAtvXgyQYk/J1egiSwN1aU0z/MiPVAdB04t89/1O/w1cDnyilFU='
    var url = 'https://api.line.me/v2/bot/user/'
    url = url + req.query.userID + '/richmenu/'

    if (req.query.type==='0'){url = url + richmenuID[0]}
    if (req.query.type==='1'){url = url + richmenuID[1]}
    if (req.query.type==='2'){url = url + richmenuID[0]}
    // if (req.query.type==='3'){url = url + richmenuID[2]}
    // if (req.query.type==='4'){url = url + richmenuID[2]}
    // if (req.query.type==='5'){url = url + richmenuID[2]}
    if (req.query.type==='9'){url = url + userID + '/richmenu/' + richmenuID[0]}
    console.log('檢查richUrl:',url)

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': bearerStr
        }
    })
    .then(res =>
        res.json()
    )
    .then(json => {
        if(Object.keys(json).length===0){
            console.log('richmenu設定成功:', json)
            res.send({Result:"T",Message:'richmenu設定成功'});
        }else{
            return new Promise((res, rej) => {
                rej(json.Message)
            })
        }
    })
    .catch((err) => {
        console.log('錯誤:', err);
        res.send({Result:"R",Message:`richmenu 設定失敗`});
    })
});

app.listen(3001, () => {
console.log('Listening on port 3001...');
});

// module.exports = setRichmenu;
