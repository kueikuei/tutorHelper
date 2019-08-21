var linebot = require('linebot');
var dbConfig = require('./mySQLConfig')
const fetch = require('node-fetch');

// 引用 python 程式
var spawn = require("child_process").spawn;
// var connection = mysql.createConnection({
//     host: dbConfig.host,
//     user: dbConfig.user,
//     password: dbConfig.password,
//     database: dbConfig.database
// });
// connection.connect();

var express = require('express');
var admin = require("firebase-admin");
admin.initializeApp({
    // credential: admin.credential.cert(JSON.parse(process.env.FirebaseKey)),
    credential: admin.credential.cert(require("./sabot-dca8c-firebase-adminsdk-mqrmy-1c07d286ac.json")),
    databaseURL: "https://sabot-dca8c.firebaseio.com"
});
// 建立 db 連線
var db = admin.database()
var bot
// [key, key, key]
var keyList = []

var APIUrl = 'http://34.80.63.226:3003/'

// 本地環境測試
var localConfig = require('./localConfig.json')
// var localConfig
if (localConfig) {
    bot = linebot({
        channelId: localConfig[0].channelId,
        channelAccessToken: localConfig[0].channelAccessToken,
        channelSecret: localConfig[0].channelSecret
    })
    // 遠端機台
}
else {
    bot = linebot({
        channelId: process.env.channelId,
        channelAccessToken: process.env.ChannelAccessToken,
        channelSecret: process.env.ChannelSecret
    })
}

// 訊息事件
bot.on('message', function (event) {
    // 每一次說話都會偵測ID
    // var userID = event.source.userId;
    // var lineBotID // 沒辦法動態取得
    var userID = '56sd4f5s6df4' // 測試用
    var lineBotID = 'U3b90812bccb505e9a03722a0a772c894' // 測試用
    var userName = event.source.displayName;
    // TODO:取得 user ID、lineId
    // 沒有此 user id 就新增
    // if (keyList.indexOf(event.source.userId) === -1) {
    //     keyList.push(event.source.userId)
    // }
    if (event.message.type = 'text') {
        // console.log('event.message.text',typeof event.message.text)
        // 關鍵字回覆
        try {
            // 根據關鍵字進行判斷
            judgeStr(event.message.text)
            
        }
        catch (e) {
            console.log(e) // 把例外物件傳給錯誤處理器
        }
        function judgeStr(str) {
            if (str === "請假 / 銷假") {
                // TODO: role check 身份驗證過了讓他開啟此選單
                rtnMsg({
                    "type": "template",
                    "altText": "this is a buttons template",
                    "template": {
                        "type": "buttons",
                        "actions": [
                            {
                                "type": "message",
                                "label": "我要請假",
                                "text": "我要請假"
                            },
                            {
                                "type": "message",
                                "label": "查詢 / 銷假",
                                "text": "查詢請假 / 銷假"
                            }
                        ],
                        "thumbnailImageUrl": "https://image.flaticon.com/icons/svg/1039/1039367.svg",
                        "title": "請假 / 銷假",
                        "text": "請選擇您要操作的項目"
                    }
                });
            }
            // http://34.80.63.226:3003/studentAccount/getRegisterDetail/stu?lineid=56sd4f5s6df4&lineBotID=U3b90812bccb505e9a03722a0a772c894
            if (str === "我要請假") {
                var leaveUrl = "http://34.80.63.226:3003/studentAccount/getRegisterDetail/stu?"
                leaveUrl = leaveUrl + "lineid=" + userID + '&' + 'lineBotID=' + lineBotID

                // var leaveTagUrl = "http://34.80.63.226:3003/tag/getTag/leave/lineApi?"
                // leaveTagUrl = leaveTagUrl + 'lineBotID=' + lineBotID
                // studentAccount/getRegisterDetail/stu API
                // step1: 取得學生名單
                fetch(leaveUrl, {
                    // fetch('http://34.80.63.226:3003/studentAccount/getRegisterDetail/stu?lineid=56sd4f5s6df4&lineBotID=U3b90812bccb505e9a03722a0a772c894', {
                    method: 'GET'
                })
                    .then(res =>
                        // 轉成 json
                        res.json()
                    )
                    .then((json) => {
                        // 取得學生名稱
                        var stuList = json.Message

                        if (json.Result === 'T') {
                            var studentsList = []
                            var msgStr = {
                                "type": "template",
                                "altText": "this is a buttons template",
                                "template": {
                                    "type": "buttons",
                                    "thumbnailImageUrl": "https://image.flaticon.com/icons/svg/1039/1039350.svg",
                                    "title": "請選擇要請假的學生姓名",
                                    "text": "請一次操作一位學員"
                                }
                            }

                            stuList.forEach((data) => {
                                var stuObj = {
                                    "type": "datetimepicker",
                                    "mode": "date",
                                    "initial": "2019-08-07",
                                    "max": "2020-08-07",
                                    "min": "2019-08-07"
                                }
                                stuObj.data = `請假學員-${data.id}`
                                stuObj.label = data.name
                                studentsList.push(stuObj)
                            })

                            msgStr.template.actions = studentsList

                            // 傳送 JSON msg
                            rtnMsg(msgStr)

                        } else if (json.Result === 'F') {
                            return new Promise((res, rej) => {
                                rej(json.Message)
                            })
                        }

                    })
                    .catch((err) => {
                        console.log('錯誤:', err);
                    })



            }
            if (str === '病假') {
                if (myLeavePostBack[0]) {
                    myLeavePostBack[0].remark = '無' // 先訂死
                    myLeavePostBack[0].type = '2'
                    console.log('檢查請假總訊息', myLeavePostBack)

                    // 插入請假資料並將事件回傳物件當參數傳過去
                    leave(myLeavePostBack[0],event)
                    // 清空
                    myLeavePostBack = []
                }
                // TODO:寫入成功後也要回傳訊息

            }
            if (str === '事假') {
                if (myLeavePostBack[0]) {
                    myLeavePostBack[0].remark = '無'
                    myLeavePostBack[0].type = '3'
                    console.log('檢查請假總訊息', myLeavePostBack)
                    leave(myLeavePostBack[0],event)
                    myLeavePostBack = []
                }

            }
            if (str === '請輸入請假理由：') {
                if (myLeavePostBack[0]) {
                    myLeavePostBack[0].type = '4'
                }

            }
            if(myLeavePostBack[0] && myLeavePostBack[0].type === '4'){
                myLeavePostBack[0].remark = event.message.text
                if(myLeavePostBack[0].remark!=='請輸入請假理由：'){
                    leave(myLeavePostBack[0],event)
                    myLeavePostBack = []
                }
            }

            if (str === "查詢請假 / 銷假") {
                // step1: 選擇學生
                fetch(qryUrl, {
                    // fetch('http://34.80.63.226:3003/studentAccount/getRegisterDetail/stu?lineid=56sd4f5s6df4&lineBotID=U3b90812bccb505e9a03722a0a772c894', {
                    method: 'GET'
                })
                    .then(res =>
                        res.json()
                    )
                    .then(json =>
                        console.log('學生名單為:', json)
                    )
                    .catch((err) => {
                        console.log('錯誤:', err);
                    })
                // step2: 搜尋請假紀錄 leave/getLeaveList
                // step3: 進行銷假
            }
            if (str === "今日功課 / 成績") {
                // TODO:動態塞DATA

                var msgStr = {
                    "type": "template",
                    "altText": "this is a buttons template",
                    "template": {
                        "type": "buttons",
                        "actions": [
                            {
                                "type": "message",
                                "label": "王小明",
                                "text": "王小明"
                            },
                            {
                                "type": "message",
                                "label": "王大明",
                                "text": "王大明"
                            }
                        ],
                        "thumbnailImageUrl": "https://image.flaticon.com/icons/svg/1039/1039350.svg",
                        "title": "請選擇學生姓名",
                        "text": "請一次操作一位學員"
                    }
                }
                rtnMsg(msgStr)
            }
            if (str === "身份註冊") {
                var msgStr = {
                    "type": "template",
                    "altText": "this is a buttons template",
                    "template": {
                        "type": "buttons",
                        "actions": [
                            {
                                "type": "uri",
                                "label": "家長",
                                "uri": "line://app/1605515297-bQyOGKR0"
                            },
                            {
                                "type": "uri",
                                "label": "訪客",
                                "uri": "line://app/106"
                            },
                            {
                                "type": "uri",
                                "label": "班務人員",
                                "uri": "line://app/102"
                            }
                        ],
                        "thumbnailImageUrl": "https://image.flaticon.com/icons/svg/1039/1039337.svg",
                        "title": "請選擇您的註冊身份",
                        "text": "如不小心關閉請點擊下方選單「身份註冊」開啟"
                    }
                }
                rtnMsg(msgStr)
            }
            if (str === "切換選單") {
                // TODO: 切換樣板
                rtnMsg(msgStr)
            }

        }

        function rtnMsg(rtn) {
            event.reply(rtn).then(function (data) {
                // 傳送訊息成功時，可在此寫程式碼 
                console.log(data);
            }).catch(function (error) {
                // 傳送訊息失敗時，可在此寫程式碼 
                console.log('錯誤產生，錯誤碼：' + error);
            });
        }
    }
});

// 加機器人為好友事件
bot.on('follow', function (event) {
    var msg = []
    var wellcomeStr = `您好！歡迎加入安親班Line好友，我們提供【請假/銷假】及【今日功課/成績】兩項小功能，讓家長們能更方便使用～
    ☞【完成註冊開通功能】
    點擊下圖中的「點擊註冊」開啟註冊頁面，或點擊畫面下方「查看更多功能」中的身份註冊開始認證`
    var wellcomeImgmap = {
        "type": "imagemap",
        "baseUrl": "https://i.imgur.com/9dN75qu.jpg",
        "altText": "This is an imagemap",
        "baseSize": {
            "width": 1040,
            "height": 800
        },
        "actions": [
            {
                "type": "message",
                "area": {
                    "x": 294,
                    "y": 34,
                    "width": 443,
                    "height": 165
                },
                "text": "身份註冊"
            }
        ]
    }
    msg.push(wellcomeStr)
    msg.push(wellcomeImgmap)

    rtnMsg(event, msg)

    event.source.profile().then(user => {
        // 取得相關資訊
        var userID = user.userId;
        var userName = user.displayName;
        var userPic = user.pictureUrl;

        // 加user資訊進DB
        getAPI('http://34.80.63.226:3003/lineApi/setLineBotJoinUser', {
            "lineBotId": userID,
            "name": userName,
            "lineId": "@196ndfvx",
            "image": userPic,
            "status": 1
        })

        // TODO: 先用預設
        // 動態變更 RichMenu
        fetch('http://34.80.63.226:3003/lineApi/getLineRoles/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // 先以家長進行測試
            body: JSON.stringify({
                "lineBotId": "U3b90812bccb505e9a03722a0a772c894",
                "lineId": "56sd4f5s6df4"
            })
        })
        .then(res =>
            res.json()
        )
        .then(json =>
            console.log('身份類型為:', json)
        )
        .catch((err) => {
            console.log('錯誤:', err);
        })
    })

});

var myLeavePostBack = []
bot.on('postback', function (event) {
    var key = event.postback.data.split('-')

    if (key[0] === '請假學員') {
        // 清空
        myLeavePostBack = []

        var leaveObj = {}

        leaveObj.sid = key[1]
        leaveObj.startDate = event.postback.params.date
        leaveObj.endDate = event.postback.params.date
        leaveObj.relation = "父親" //先寫死
        leaveObj.vendorid = "A1" //先寫死

        myLeavePostBack.push(leaveObj)

        // sid	學生資料表流水序號	int(11)
        // startDate	請假起始日期	date
        // endDate	請假結束日期	date
        // type	請假類型	int(11)
        // remark	備註	varchar(1024)
        // relation	請假人關係	varchar(64)
        // vendorid	廠商代碼	varchar(50)

        // 選擇哪一位學生後進入請假類型
        // tag/getTag/leave/lineApi API
        // 取得請假標籤資訊
        var leaveTagUrl = 'http://34.80.63.226:3003/tag/getTag/leave/lineApi?lineBotID=U3b90812bccb505e9a03722a0a772c894'
        fetch(leaveTagUrl, {
            method: 'GET'
        })
            .then(res =>
                // 轉成 json
                res.json()
            )
            .then((json) => {
                console.log('leaveTagUrl', json)
                // 取得學生名稱
                var tagList = json.Message

                if (json.Result === 'T') {
                    var tagInfoList = []
                    var msgStr = {
                        "type": "template",
                        "altText": "this is a buttons template",
                        "template": {
                            "type": "buttons",
                            "thumbnailImageUrl": "https://image.flaticon.com/icons/svg/1039/1039368.svg",
                            "title": "請選擇您的請假理由",
                            "text": "其他請假理由請點擊「其他」文字輸入"
                        }
                    }

                    tagList.forEach((data) => {
                        var stuObj = {
                            "type": "message",
                        }
                        // stuObj.type = data.id
                        stuObj.text = data.name
                        stuObj.label = data.name
                        if(data.name==='其他'){
                            stuObj.text = '請輸入請假理由：'
                        }
                        
                        tagInfoList.push(stuObj)
                    })

                    msgStr.template.actions = tagInfoList

                    // 傳送 JSON msg
                    event.reply(msgStr).then(function (data) {
                        // 傳送訊息成功時，可在此寫程式碼 
                        console.log(data);
                    }).catch(function (error) {
                        // 傳送訊息失敗時，可在此寫程式碼 
                        console.log('錯誤產生，錯誤碼：' + error);
                    });

                } else if (json.Result === 'R') {
                    return new Promise((res, rej) => {
                        rej(json.Message)
                    })
                }

            })
            .catch((err) => {
                console.log('錯誤:', err);
            })

    }

    // event.source.userId
    // event.postback
    // event.postback.data // /用此進行判斷
    // event.postback.params.date

    console.log('myLeavePostBack', myLeavePostBack)

    function rtnMsg(rtn) {
        event.reply(rtn).then(function (data) {
            // 傳送訊息成功時，可在此寫程式碼 
            console.log(data);
        }).catch(function (error) {
            // 傳送訊息失敗時，可在此寫程式碼 
            console.log('錯誤產生，錯誤碼：' + error);
        });
    }
});

// API Call Function
function getAPI(url, JSONStr) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(JSONStr)
    })
        .then(res =>
            res.json()
        )
        .then(json =>
            console.log(json)
        )
        .catch((err) => {
            console.log('錯誤:', err);
        })
}

// event reply
function rtnMsg(e, msg) {
    msg.forEach(data => {
        e.reply(data).then(function (res) {
            // 傳送訊息成功時，可在此寫程式碼 
            console.log('歡迎訊息成功' + res);
        }).catch(function (error) {
            // 傳送訊息失敗時，可在此寫程式碼 
            console.log('錯誤產生，錯誤碼：' + error);
        });
    })
}

// 請假 function ()
function leave(myLeavePostBack,e){
                        
    fetch(APIUrl+'leave/setLeave', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        // 先以家長進行測試
        body: JSON.stringify(myLeavePostBack)
    })
    .then(res =>
        res.json()
    )
    .then(json => {
        //  TODO: 回傳請假結果
        if (json.Result==='T'){
            console.log('請假結果為:', json)
            e.reply('請假成功').then(function (data) {
                // 傳送訊息成功時，可在此寫程式碼 
                console.log(data);
            }).catch(function (error) {
                // 傳送訊息失敗時，可在此寫程式碼 
                console.log('錯誤產生，錯誤碼：' + error);
            });
        }
        if(json.Result==='F'){
            console.log('請假結果為:', json)
            e.reply(json.Message).then(function (data) {
                // 傳送訊息成功時，可在此寫程式碼 
                console.log(data);
            }).catch(function (error) {
                // 傳送訊息失敗時，可在此寫程式碼 
                console.log('錯誤產生，錯誤碼：' + error);
            });
        }
        if(json.Result==='R'){
            console.log('請假結果為:', json)
            e.reply(json.Message).then(function (data) {
                // 傳送訊息成功時，可在此寫程式碼 
                console.log(data);
            }).catch(function (error) {
                // 傳送訊息失敗時，可在此寫程式碼 
                console.log('錯誤產生，錯誤碼：' + error);
            });
        }
    })
    .catch((err) => {
        console.log('錯誤:', err);
    })
}



// bot.on('memberJoined',function (data){
//     console.log('memberJoined',data)
// })

// bot.on('memberLeft',   function (event) {
//     console.log('memberLeft',event)
// });

// TODO: 後續替換成 MySQL
// 監聽 firebase 資料庫
// 每一次資料庫有更新這邊都能偵測
// 更新清單資料以利使用
db.ref('tutor').on('value', function (snapshot) {
    var dataKeys = Object.keys(snapshot.val())
    keyList = dataKeys
})
// 開啟 port
const app = express();
const linebotParser = bot.parser();
// app.post('/', linebotParser);

app.get('/', function (req, res) {
    res.send('hello bot')
})

app.post('/linewebhook', linebotParser)

// Bot所監聽的webhook路徑與port
// for local test
var server = app.listen(process.env.PORT || 8080, function (req, res) {
    var port = server.address().port;
    console.log('目前的port是', port);
});