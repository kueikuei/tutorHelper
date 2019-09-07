### ChangeLog
9/4 新增機器人下載步驟文檔，每一次更新請都參照此文檔下載相應檔案進行更新

### linebot 安裝步驟

1. [檔案位置下載](https://github.com/kueikuei/tutorHelper/tree/deploy) 參考下圖 Download ZIP 進行下載
![](https://i.imgur.com/QM5Jb9A.jpg)

2. 請確認已經安裝完 node v12 以上的版本

3. 透過 CMD(命令提示字元) 進入檔案 projects 根目錄下 `$npm i` 把相依套件裝起來

4. 設定 `config.json`，包含設定機器人相關資訊、lineAPI位置、port號 <br>
Example:
```json
{
   "bot": {
        "channelId": "",
        "channelAccessToken": "",
        "channelSecret":  ""
    },
    "lineAPI": "http://XXX",
    "port":8080
}
```

5. 啟動機器人 `$node index.js` 或在背景執行機器人 forerver start index.js(需安裝 forerver套件)
得到機器人網域位置 ex https:XXX/linewebhook

6. 掛 SSL 認證過的 網域位置 位置於 line developer werbook，並進行 verify 驗證確定 success 
![](https://i.imgur.com/3CPqlU3.jpg)




