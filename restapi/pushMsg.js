const linebot = require('linebot');
const express = require('express');
const app = express();


// bot 權限設定
// 先定死
var bot = linebot({
    "channelId": "1605515297",
    "channelAccessToken": "R2/T8qgK3AP4B73Z7n7bW7D5D27GY6+7Q1qJSAE57GnnzP6EOQ4Z7fle7FGsKlPpi+UF+bwpLrLY/uIIBViRV2ZibctziHiJLN8b3flPog6odZcJUY1q+T6cQAtvXgyQYk/J1egiSwN1aU0z/MiPVAdB04t89/1O/w1cDnyilFU=",
    "channelSecret": "7084f7a1dcbe5251212e1944b791a269"
})
app.use(express.json());

app.post('/pushMsg', (req, res) => {
    if (req.body.userIdArys && req.body.msg) {
        var userIdArys = req.body.userIdArys.split(',')
        var msg = req.body.msg

        if (userIdArys.length > 0 && msg.length > 0) {
            userIdArys.forEach(id => {
                bot.push(id, [msg]).then(data => {
                    if (Object.keys(data).length === 0) {
                        res.send({ Result: "T", Message: 'msg 傳送成功' });
                    } else {
                        res.send({ Result: "E", Message: '傳遞失敗，請確認user ID 是否正確' });
                    }

                });
            });

        } else {
            res.send({ Result: "E", Message: 'ID或是訊息不能沒填' });
        }
    } else {
        res.send({ Result: "E", Message: '缺少 id 或是 msg 參數' });
    }

})

app.listen(3001, () => {
    console.log('Listening on port 3001...');
});