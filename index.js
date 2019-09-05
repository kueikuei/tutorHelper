var linebot = require('linebot');
// var dbConfig = require('./mySQLConfig')
const fetch = require('node-fetch');
// var setRichmenu = require('./restapi/setRichmenu')

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
    console.log('event.source.profile()',event)
    // 每一次說話都會偵測ID
    // var userID = '56sd4f5s6df4' // 測試用
    // /leave/setLeave/line
    // TODO:userID不能從內部定
    var userID = event.source.userId
    var lineBotID = '333@333' // 測試用
    
    var userName = event.source.displayName;

    if (event.message.type = 'text') {

        // 關鍵字回覆
        try {
            // 根據關鍵字進行判斷
            judgeStr(event.message.text)

        }
        catch (e) {
            console.log(e) // 把例外物件傳給錯誤處理器
        }
        function judgeStr(str) {

            if (str === "我要請假") {
                var leaveUrl = "http://34.80.63.226:3003/studentAccount/getRegisterDetail/stu?"
                // leaveUrl = leaveUrl + "lineid=" + userID + '&' + 'lineBotID=' + lineBotID
                leaveUrl = leaveUrl + "lineid=" + lineBotID + '&' + 'lineBotID=' + userID

                // var leaveTagUrl = "http://34.80.63.226:3003/tag/getTag/leave/lineApi?"
                // leaveTagUrl = leaveTagUrl + 'lineBotID=' + lineBotID
                // studentAccount/getRegisterDetail/stu API
                // step1: 取得學生名單
                fetch(leaveUrl, {
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
                            stuObj.data = `我要請假-${data.id}`
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
            if (str.indexOf('病假') > -1) {
                var lv = str.split('-')

                if (myLeavePostBack[0]) {
                    myLeavePostBack[0].remark = '無' // 先訂死
                    myLeavePostBack[0].type = lv[1]
                    console.log('檢查請假總訊息', myLeavePostBack)

                    // 插入請假資料並將事件回傳物件當參數傳過去
                    leave(myLeavePostBack[0], event)
                    // 清空
                    myLeavePostBack = []
                }
                // TODO:寫入成功後也要回傳訊息

            }
            if (str.indexOf('事假') > -1) {
                var lv = str.split('-')

                if (myLeavePostBack[0]) {
                    myLeavePostBack[0].remark = '無'
                    myLeavePostBack[0].type = lv[1]
                    console.log('檢查請假總訊息', myLeavePostBack)
                    leave(myLeavePostBack[0], event)
                    myLeavePostBack = []
                }

            }
            if (str.indexOf('颱風假') > -1) {
                var lv = str.split('-')

                if (myLeavePostBack[0]) {
                    myLeavePostBack[0].remark = '無'
                    myLeavePostBack[0].type = lv[1]
                    console.log('檢查請假總訊息', myLeavePostBack)
                    leave(myLeavePostBack[0], event)
                    myLeavePostBack = []
                }

            }
            if (str === '請輸入請假理由：') {
                var lv = str.split('-')

                if (myLeavePostBack[0]) {
                    myLeavePostBack[0].type = lv[1]
                }

            }
            if (myLeavePostBack[0] && myLeavePostBack[0].type === '4') {
                myLeavePostBack[0].remark = event.message.text
                if (myLeavePostBack[0].remark !== '請輸入請假理由：') {
                    leave(myLeavePostBack[0], event)
                    myLeavePostBack = []
                }
            }

            if (str === "請假 / 銷假") {
                fetch('http://34.80.63.226:3003/lineApi/getLineRoles/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "lineBotId": userID,
                        "lineId": lineBotID
                    })
                })
                .then(res =>
                    res.json()
                )
                .then(json => {
                    if(json.Result==='T' && json.Message[0].role===1){
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
                    }else{
                        rtnMsg({
                            "type": "text",
                            "text": "您沒有此權限操作，請註冊身份取得資格。\n您可以：\n①點擊下方按鈕「立即註冊」\n或是\n②點擊選單中的「身份註冊」\n\n＊如有問題請致電安親班由班務人員為您服務\n\n(quick reply button)👤立即註冊"
                        })
                    }
                })
            }
            if (str === "查詢請假 / 銷假") {
                var leaveUrl = "http://34.80.63.226:3003/studentAccount/getRegisterDetail/stu?"
                leaveUrl = leaveUrl + "lineid=" + lineBotID + '&' + 'lineBotID=' +userID 

                // step1: 取得學生名單
                fetch(leaveUrl, {
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
                                "type": "postback",
                                "mode": "date",
                                "initial": "2019-08-07",
                                "max": "2020-08-07",
                                "min": "2019-08-07"
                            }
                            // 偷偷將 學生id與 name 塞入
                            stuObj.data = `查詢請假-${data.id}-${data.name}`
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
            if (str.indexOf('我要銷假') > -1) {
                // http://34.80.63.226:3003/leave/deleteLeave?id=14
                var lvID = str.split('-')[1]
                var delLeaveUrl = APIUrl + 'leave/deleteLeave?'
                delLeaveUrl = delLeaveUrl + `id=${lvID}`

                // 進行銷假
                fetch(delLeaveUrl, {
                    method: 'GET',
                })
                    .then(res =>
                        res.json()
                    )
                    .then(json => {
                        if (json.Result === 'T') {
                            // TODO:銷假成功 Temp
                            rtnMsg('銷假成功')
                        }
                        if (json.Result === 'F') { rtnMsg(json.Message) }
                        if (json.Result === 'R') { rtnMsg(json.Message) }
                    })
                    .catch((err) => {
                        console.log('錯誤:', err);
                    })
            }

            if (str === "今日功課 / 成績") {
                // TODO: role check 身份驗證過了讓他開啟此選單 (訪客部分)

                fetch('http://34.80.63.226:3003/lineApi/getLineRoles/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // 先以家長進行測試
                    body: JSON.stringify({
                        "lineBotId": userID,
                        "lineId": lineBotID
                    })
                })
                .then(res =>
                    res.json()
                )
                .then(json => {
                    console.log('驗證身份',json.Result, json.Message[0].role)
                    if(json.Result==='T' && json.Message[0].role===1){
                        var leaveUrl = "http://34.80.63.226:3003/studentAccount/getRegisterDetail/stu?"
                        leaveUrl = leaveUrl + "lineid=" + lineBotID + '&' + 'lineBotID=' + userID

                        // 今日功課查詢
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
                                        "title": "請選擇要查詢的學生姓名",
                                        "text": "請一次操作一位學員"
                                    }
                                }

                                stuList.forEach((data) => {
                                    var stuObj = {
                                        "type": "postback"
                                    }

                                    stuObj.data = `今日查詢-${data.id}-${data.name}`
                                    stuObj.label = data.name
                                    stuObj.text = data.name
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
                    else{
                        rtnMsg({
                            "type": "text",
                            "text": "您沒有此權限操作，請註冊身份取得資格。\n您可以：\n①點擊下方按鈕「立即註冊」\n或是\n②點擊選單中的「身份註冊」\n\n＊如有問題請致電安親班由班務人員為您服務\n\n(quick reply button)👤立即註冊"
                        })
                    }
                })

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
                // TODO: role check 身份驗證過了讓他開啟此選單 (訪客部分)
                // TODO: 切換樣板
                fetch('http://34.80.63.226:3003/lineApi/getLineRoles/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // 先以家長進行測試
                    body: JSON.stringify({
                        "lineBotId": userID,
                        "lineId": lineBotID
                    })
                })
                .then(res =>
                    res.json()
                )
                .then(json => {
                    if(json.Ressult==='T' && json.Message[0].role===3 || json.Message[0].role===4 ||json.Message[0].role===9){
                        console.log('切換表單')
                    }
                    else{
                        rtnMsg({
                            "type": "text",
                            "text": "您沒有此權限操作，請註冊身份取得資格。\n您可以：\n①點擊下方按鈕「立即註冊」\n或是\n②點擊選單中的「身份註冊」\n\n＊如有問題請致電安親班由班務人員為您服務\n\n(quick reply button)👤立即註冊"
                        })
                    }
                })
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

    rtnMsg(msg)

    event.source.profile().then(user => {
        // 取得相關資訊
        var userID = user.userId;
        var botID = '333@333'
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
                "lineBotId": userID,
                "lineId": botID
            })
        })
        .then(res =>
            res.json()
        )
        .then(json => {
            // 設定 richmenu
            // setRichmenu(json.Message[0].role,userID)
            // 測次用
            setRichmenuUrl = 'http://34.80.63.226:3003/lineApi/setRichmenu?'
            setRichmenuUrl = setRichmenuUrl + `type=${json.Message[0].role}&`
            setRichmenuUrl = setRichmenuUrl + 'userID=' + userID

            fetch(setRichmenuUrl, {
                method: 'GET'
            })
            .then(res =>
                // 轉成 json
                res.json()
            )
            .then((json) => {

                if (json.Result === 'T') {
                    // console.log('setRichmenuUrl',json)
                    // 傳送 JSON msg'
                    console.log('json.Message', json.Message)
                    rtnMsg(json.Message)

                } else if (json.Result === 'R') {
                    return new Promise((res, rej) => {
                        rej(json.Message)
                    })
                }
            })
            .catch((err) => {
                console.log('錯誤:', err);
            })

        })

    })

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

var myLeavePostBack = []
bot.on('postback', function (event) {
    // 每一次 postback 都去取得 userID
    var userID = event.source.userId
    var key = event.postback.data.split('-')

    if (key[0] === '我要請假') {
        // 清空
        myLeavePostBack = []

        var leaveObj = {}

        leaveObj.sid = key[1]
        leaveObj.lineBotID = userID
        leaveObj.startDate = event.postback.params.date
        leaveObj.endDate = event.postback.params.date
        leaveObj.relation = "父親" //先寫死
        // leaveObj.vendorid = "A1" //先寫死

        myLeavePostBack.push(leaveObj)

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
                        // TODO:嘗試把stuObj.type帶入
                        stuObj.text = data.name + `-${data.id}`
                        stuObj.label = data.name
                        if (data.name === '其他') {
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

    if (key[0] === '查詢請假') {
        // TODO:從今天開始到選擇的銷假時間都列出來

        // TODO:參數先寫死，後續會用到
        // http://34.80.63.226:3003/leave/getLeaveList?sid=27&lineBotID=U3b90812bccb505e9a03722a0a772c894&startDate=2018-01-01&endDate=2019-12-31
        // var sid = key[1] // 先定死
        // var botID = userID // 後續的 userID 就是 bot ID，這邊先定死

        // var t = new Date()
        // var y = t.getFullYear()
        // var m = t.getMonth()
        // var d = t.getDate()
        // var startDate = `${y}-${m}-${d}`
        // var endDate = event.postback.params.date
        var studentName = key[2]

        var sid = '27'
        var botID = 'U3b90812bccb505e9a03722a0a772c894'
        var startDate = '2018-01-01'
        var endDate = '2019-12-31'

        var leaveListUrl = APIUrl + 'leave/getLeaveList?'
        leaveListUrl = leaveListUrl + 'sid=' + sid + '&'
        leaveListUrl = leaveListUrl + 'lineBotID=' + botID + '&'
        leaveListUrl = leaveListUrl + 'startDate=' + startDate + '&'
        leaveListUrl = leaveListUrl + 'endDate=' + endDate + '&'

        fetch(leaveListUrl, {
            method: 'GET'
        })
            .then(res =>
                // 轉成 json
                res.json()
            )
            .then((json) => {
                console.log('getLeaveList', json)
                // 取得學生名稱
                if (json.Result === 'T') {
                    var columns = []
                    var temp = {
                        "type": "template",
                        "altText": "this is a carousel template",
                        "template": {
                            "type": "carousel",
                            "actions": []
                        }
                    }
                    json.Message.forEach(data => {

                        var myData = {
                            "title": `請假日期：${data.startDate}~${data.endDate}`,
                            "text": `請假學員：${studentName}`,
                            "actions": [
                                {
                                    "type": "message",
                                    "label": "我要銷假",
                                    "text": `我要銷假-${data.id}`
                                }
                            ]
                        }

                        columns.push(myData)
                    })

                    temp.template.columns = columns
                    rtnMsg(temp)
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

    if (key[0] === '今日查詢') {
        // http://34.80.63.226:3003/homework/getStudentHomework?
        // sid=32&searchDate=2019-08-22&
        // lineBotID=U3b90812bccb505e9a03722a0a772c894

        // TODO: 當日
        // var t = new Date()
        // var y = t.getFullYear()
        // var m = t.getMonth()
        // var d = t.getDate()
        // var searchDate = `${y}-${m}-${d}`


        // 取得學生功課
        var sid = key[1]
        var searchDate = '2019-08-22' //先定死
        var tempArys = []
        var name = key[2]

        var getStudentHomeworkUrl = APIUrl + 'homework/getStudentHomework?'
        getStudentHomeworkUrl = getStudentHomeworkUrl + 'sid=' + sid + '&'
        getStudentHomeworkUrl = getStudentHomeworkUrl + 'searchDate=' + searchDate + '&'
        getStudentHomeworkUrl = getStudentHomeworkUrl + 'lineBotID=' + userID

        var getStudentGradeUrl = APIUrl + 'grade/getStudentGrade?'
        getStudentGradeUrl = getStudentGradeUrl + 'sid=' + sid + '&'
        getStudentGradeUrl = getStudentGradeUrl + 'searchDate=' + searchDate + '&'
        getStudentGradeUrl = getStudentGradeUrl + 'lineBotID=' + userID

        fetch(getStudentHomeworkUrl, {
            method: 'GET'
        })
        .then(res =>
            // 轉成 json
            res.json()
        )
        .then((json) => {
            console.log('getLeaveList', json)

            // 取得學生名稱
            if (json.Result === 'T') {
                var contents = []
                var honeWorkTemp = {
                    "type": "flex",
                    "altText": "Flex Message",
                    "contents": {
                        "type": "bubble",
                        "direction": "ltr",
                        "header": {
                            "type": "box",
                            "layout": "vertical",
                            "flex": 0,
                            "contents": [
                                {
                                    "type": "text",
                                    "text": `${searchDate}`,
                                    "size": "lg",
                                    "align": "center",
                                    "weight": "bold"
                                },
                                {
                                    "type": "separator",
                                    "margin": "sm"
                                }
                            ]
                        },
                        "hero": {
                            "type": "image",
                            "url": "https://image.flaticon.com/icons/svg/1039/1039352.svg",
                            "size": "full",
                            "aspectRatio": "1.51:1",
                            "aspectMode": "fit"
                        },
                        "body": {
                            "type": "box",
                            "layout": "vertical"
                        },
                        "footer": {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                    "type": "button",
                                    "action": {
                                        "type": "datetimepicker",
                                        "label": "查看其他日期",
                                        "data": `功課查詢-${sid}`,
                                        "mode": "date",
                                        "initial": "2019-07-29",
                                        "max": "2020-07-29",
                                        "min": "2019-07-22"
                                    }
                                }
                            ]
                        },
                        "styles": {
                            "hero": {
                                "backgroundColor": "#ECEAEA"
                            }
                        }
                    }
                }

                json.Message.forEach(data => {

                    var myData1 = {
                        "type": "text",
                        "text": `${data.title}`,
                        "align": "start",
                        "weight": "bold"
                    }
                    var myData2 = {
                        "type": "text",
                        "text": `${data.homeworkContent}`
                    }
                    var myData3 = {
                        "type": "separator"
                    }
                    contents.push(myData1, myData2, myData3)
                })

                honeWorkTemp.contents.body.contents = contents


                tempArys.push(honeWorkTemp)

                return tempArys
                // rtnMsg([honeWorkTemp,gradeTemp])

            } else if (json.Result === 'R') {
                rtnMsg(json.Message)
                return new Promise((res, rej) => {
                    rej(json.Message)
                })
            }
        })
        .then(tempArys => {
            fetch(getStudentGradeUrl, {
                method: 'GET'
            })
            .then(res =>
                // 轉成 json
                res.json()
            )
            .then((json) => {

                // 取得學生名稱
                if (json.Result === 'T') {
                    var contents = [{
                        "type": "text",
                        "text": "◎成績",
                        "align": "start",
                        "weight": "bold"
                    }]
                    var gradeTemp = {
                        "type": "flex",
                        "altText": "Flex Message",
                        "contents": {
                          "type": "bubble",
                          "direction": "ltr",
                          "header": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                              {
                                "type": "text",
                                "text": `${searchDate}`,
                                "size": "lg",
                                "align": "center",
                                "weight": "bold"
                              },
                              {
                                "type": "separator"
                              }
                            ]
                          },
                          "hero": {
                            "type": "image",
                            "url": "https://image.flaticon.com/icons/svg/1039/1039329.svg",
                            "size": "full",
                            "aspectRatio": "1.51:1",
                            "aspectMode": "fit"
                          },
                          "body": {
                            "type": "box",
                            "layout": "vertical"
                          },
                          "footer": {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                              {
                                  "type": "button",
                                  "action": {
                                    "type": "datetimepicker",
                                    "label": "查看其他日期",
                                    "data": `成績查詢-${sid}-${name}`,
                                    "mode": "date",
                                    "initial": "2019-07-29",
                                    "max": "2020-07-29",
                                    "min": "2019-01-22"
                                  }
                                }
                            ]
                          },
                          "styles": {
                            "hero": {
                              "backgroundColor": "#ECEAEA"
                            },
                            "footer": {
                              "separator": false
                            }
                          }
                        }
                    }

                    json.Message.forEach(data => {
                        var data1 = {
                            "type": "text",
                            "text": `學生姓名：${name}`
                        }
                        var data2 = {
                            "type": "text",
                            "text": `考試日期：${data.examDate}`
                        }
                        var data3 = {
                            "type": "text",
                            "text": `課程：${data.title}`
                        }
                        var data4 = {
                            "type": "text",
                            "text": `成績：${data.grade}`
                        }
                        var data5 = {
                            "type": "separator",
                            "margin": "lg",
                            "color": "#DADDE3"
                        }

                        contents.push(data1, data2, data3, data4, data5)
                    })

                    gradeTemp.contents.body.contents = contents


                    tempArys.push(gradeTemp)

                    rtnMsg(tempArys)

                } else if (json.Result === 'R') {
                    rtnMsg(json.Message)
                    return new Promise((res, rej) => {
                        rej(json.Message)
                    })
                }
            })
            .catch((err) => {
                console.log('錯誤:', err);
            })
            // console.log('data',tempArys)
        })
        .catch((err) => {
            console.log('錯誤:', err);
        })

    }
    if (key[0] === '功課查詢') {
        // 取得學生功課
        var sid = key[1]
        var searchDate = event.postback.params.date //先定死
        var tempArys = []
        var name = key[2]

        var getStudentHomeworkUrl = APIUrl + 'homework/getStudentHomework?'
        getStudentHomeworkUrl = getStudentHomeworkUrl + 'sid=' + sid + '&'
        getStudentHomeworkUrl = getStudentHomeworkUrl + 'searchDate=' + searchDate + '&'
        getStudentHomeworkUrl = getStudentHomeworkUrl + 'lineBotID=' + userID
        console.log('getStudentHomeworkUrl',getStudentHomeworkUrl)

        fetch(getStudentHomeworkUrl, {
            method: 'GET'
        })
        .then(res =>
            // 轉成 json
            res.json()
        )
        .then((json) => {
            console.log('json',json)
            // 取得學生名稱
            if (json.Result === 'T') {
                var contents = []
                var honeWorkTemp = {
                    "type": "flex",
                    "altText": "Flex Message",
                    "contents": {
                        "type": "bubble",
                        "direction": "ltr",
                        "header": {
                            "type": "box",
                            "layout": "vertical",
                            "flex": 0,
                            "contents": [
                                {
                                    "type": "text",
                                    "text": `${searchDate}`,
                                    "size": "lg",
                                    "align": "center",
                                    "weight": "bold"
                                },
                                {
                                    "type": "separator",
                                    "margin": "sm"
                                }
                            ]
                        },
                        "hero": {
                            "type": "image",
                            "url": "https://image.flaticon.com/icons/svg/1039/1039352.svg",
                            "size": "full",
                            "aspectRatio": "1.51:1",
                            "aspectMode": "fit"
                        },
                        "body": {
                            "type": "box",
                            "layout": "vertical"
                        },
                        "footer": {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                    "type": "button",
                                    "action": {
                                        "type": "datetimepicker",
                                        "label": "查看其他日期",
                                        "data": `功課查詢-${sid}`,
                                        "mode": "date",
                                        "initial": "2019-07-29",
                                        "max": "2020-07-29",
                                        "min": "2019-07-22"
                                    }
                                }
                            ]
                        },
                        "styles": {
                            "hero": {
                                "backgroundColor": "#ECEAEA"
                            }
                        }
                    }
                }

                json.Message.forEach(data => {

                    var myData1 = {
                        "type": "text",
                        "text": `${data.title}`,
                        "align": "start",
                        "weight": "bold"
                    }
                    var myData2 = {
                        "type": "text",
                        "text": `${data.homeworkContent}`
                    }
                    var myData3 = {
                        "type": "separator"
                    }
                    contents.push(myData1, myData2, myData3)
                })

                honeWorkTemp.contents.body.contents = contents

                tempArys.push(honeWorkTemp)

                rtnMsg(tempArys)

            } else if (json.Result === 'R') {
                rtnMsg(json.Message)
                return new Promise((res, rej) => {
                    rej(json.Message)
                })
            }
        })
        .catch((err) => {
            console.log('錯誤:', err);
        })

    }

    if (key[0] === '成績查詢'){
        console.log('成績查詢確定')
        // 取得學生功課
        var sid = key[1]
        var searchDate = event.postback.params.date //先定死
        var tempArys = []
        var name = key[2]

        var getStudentGradeUrl = APIUrl + 'grade/getStudentGrade?'
        getStudentGradeUrl = getStudentGradeUrl + 'sid=' + sid + '&'
        getStudentGradeUrl = getStudentGradeUrl + 'searchDate=' + searchDate + '&'
        getStudentGradeUrl = getStudentGradeUrl + 'lineBotID=' + userID

        fetch(getStudentGradeUrl, {
            method: 'GET'
        })
        .then(res =>
            // 轉成 json
            res.json()
        )
        .then((json) => {

            // 取得學生名稱
            if (json.Result === 'T') {
                var contents = [{
                    "type": "text",
                    "text": "◎成績",
                    "align": "start",
                    "weight": "bold"
                }]
                var gradeTemp = {
                    "type": "flex",
                    "altText": "Flex Message",
                    "contents": {
                      "type": "bubble",
                      "direction": "ltr",
                      "header": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                          {
                            "type": "text",
                            "text": `${searchDate}`,
                            "size": "lg",
                            "align": "center",
                            "weight": "bold"
                          },
                          {
                            "type": "separator"
                          }
                        ]
                      },
                      "hero": {
                        "type": "image",
                        "url": "https://image.flaticon.com/icons/svg/1039/1039329.svg",
                        "size": "full",
                        "aspectRatio": "1.51:1",
                        "aspectMode": "fit"
                      },
                      "body": {
                        "type": "box",
                        "layout": "vertical"
                      },
                      "footer": {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                          {
                              "type": "button",
                              "action": {
                                "type": "datetimepicker",
                                "label": "查看其他日期",
                                "data": `成績查詢-${sid}-${name}`,
                                "mode": "date",
                                "initial": "2019-07-29",
                                "max": "2020-07-29",
                                "min": "2019-01-22"
                              }
                            }
                        ]
                      },
                      "styles": {
                        "hero": {
                          "backgroundColor": "#ECEAEA"
                        },
                        "footer": {
                          "separator": false
                        }
                      }
                    }
                }

                json.Message.forEach(data => {
                    var data1 = {
                        "type": "text",
                        "text": `學生姓名：${name}`
                    }
                    var data2 = {
                        "type": "text",
                        "text": `考試日期：${data.examDate}`
                    }
                    var data3 = {
                        "type": "text",
                        "text": `課程：${data.title}`
                    }
                    var data4 = {
                        "type": "text",
                        "text": `成績：${data.grade}`
                    }
                    var data5 = {
                        "type": "separator",
                        "margin": "lg",
                        "color": "#DADDE3"
                    }

                    contents.push(data1, data2, data3, data4, data5)
                })

                gradeTemp.contents.body.contents = contents

                rtnMsg(gradeTemp)

            } else if (json.Result === 'R') {
                rtnMsg(json.Message)
                return new Promise((res, rej) => {
                    rej(json.Message)
                })
            }
        })
        .catch((err) => {
            console.log('錯誤:', err);
        })
    }

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
            console.log('reply 訊息成功' + res);
        }).catch(function (error) {
            // 傳送訊息失敗時，可在此寫程式碼 
            console.log('錯誤產生，錯誤碼：' + error);
        });
    })
}

// 請假 function ()
function leave(myLeavePostBack, e) {

    fetch(APIUrl + 'leave/setLeave/line', {
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
            if (json.Result === 'T') {
                // TODO:補上請假成功樣板
                console.log('請假結果為:', json)
                e.reply('請假成功').then(function (data) {
                    // 傳送訊息成功時，可在此寫程式碼 
                    console.log(data);
                }).catch(function (error) {
                    // 傳送訊息失敗時，可在此寫程式碼 
                    console.log('錯誤產生，錯誤碼：' + error);
                });
            }
            if (json.Result === 'F') {
                console.log('請假結果為:', json)
                e.reply(json.Message).then(function (data) {
                    // 傳送訊息成功時，可在此寫程式碼 
                    console.log(data);
                }).catch(function (error) {
                    // 傳送訊息失敗時，可在此寫程式碼 
                    console.log('錯誤產生，錯誤碼：' + error);
                });
            }
            if (json.Result === 'R') {
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