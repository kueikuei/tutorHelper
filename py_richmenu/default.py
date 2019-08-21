import requests

# https://api.line.me/v2/bot/user/{userId}/richmenu/{richMenuId}

channel_access_token = "R2/T8qgK3AP4B73Z7n7bW7D5D27GY6+7Q1qJSAE57GnnzP6EOQ4Z7fle7FGsKlPpi+UF+bwpLrLY/uIIBViRV2ZibctziHiJLN8b3flPog6odZcJUY1q+T6cQAtvXgyQYk/J1egiSwN1aU0z/MiPVAdB04t89/1O/w1cDnyilFU=",
linkRichMenuId = "richmenu-18fd806c777d3fbea956cce0bee6d5ed/"
self_user_id = "U3b90812bccb505e9a03722a0a772c894"

# 取得菜單id
# linkRichMenuId=json.loads(lineCreateMenuResponse.text).get("richMenuId")

# 將菜單id與用戶id組合成遠端位置
linkMenuEndpoint='https://api.line.me/v2/bot/user/%s/richmenu/%s' % (self_user_id, linkRichMenuId)
print(linkMenuEndpoint)

# 設定消息基本安全憑證
linkMenuRequestHeader={'Content-Type':'image/jpeg','Authorization':'Bearer %s' % channel_access_token}

# 發送消息
lineLinkMenuResponse=requests.post(linkMenuEndpoint,headers=linkMenuRequestHeader)
print(lineLinkMenuResponse)
print(lineLinkMenuResponse.text)