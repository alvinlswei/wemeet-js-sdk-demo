# 腾讯会议jsapi调用demo

本demo包含了应用授权、jsapi鉴权、jsapi调用的能力

## 运行方法
### 1. 安装依赖
```
> yarn
```

### 2. 运行
```
> yarn start
```

### 3. 打开页面

[http://127.0.0.1:8080](http://127.0.0.1:8080)


## 应用参数配置

运行前，请将应用的信息填到对应的字段；包括前端和后端部分

前端 `/web/index.html`
```
const CORP_ID = '20xxxxx28'; // 企业ID
const SDK_ID = '19xxxxxxx47'; // 应用ID
```

后端 `/server/index.js`
```
const CORP_ID = '20xxxxx28'; // 企业ID
const SDK_ID = '19xxxxxxx47'; // 应用ID
const SECRET = 'hmyqxxxxxxxxxxxxxxxxxxxxxxM52u'; // 客户密钥
```

## 注意事项
腾讯会议开放应用仅支持https协议访问，因此如果要将本应用直接运行到会议app内，需要部署在有受信的证书域名下；开发阶段可以使用[whistle](https://www.npmjs.com/package/whistle)进行代理