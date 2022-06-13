import { readFile } from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import axios from 'axios';
const { createHash } = await import('node:crypto');

const CORP_ID = '20xxxxx28'; // 企业ID
const SDK_ID = '19xxxxxxx47'; // 应用ID
const SECRET = 'hmyqxxxxxxxxxxxxxxxxxxxxxxM52u'; // 客户密钥

let userInfo = {};

const signUtils = {
  sha256(inputStr) {
    const hash = createHash('sha256');
    hash.update(inputStr);
    return hash.digest('hex');
  },
  nonce() {
    return Math.floor(Math.random() * 1e5).toString();
  },
  timestamp() {
    return Math.floor(Date.now() / 1000).toString();
  }
}

const getSignData = (ticket, url) => {
  const nonce = signUtils.nonce();
  const timestamp = signUtils.timestamp();
  const tempStr = `corp_id=${CORP_ID}&sdk_id=${SDK_ID}&timestamp=${timestamp}&nonce_str=${nonce}&url=${url}&ticket=${ticket}`;
  const signature = signUtils.sha256(tempStr);
  return {
    nonce,
    timestamp,
    signature,
  };
}

async function requestAccessToken(authCode) {
  const url = 'https://meeting.tencent.com/wemeet-webapi/v2/oauth2/oauth/access_token';
  return axios.post(url, {
    sdk_id: SDK_ID,
    secret: SECRET,
    auth_code: authCode,
  })
    .then((resp) => {
      return resp.data;
    });
}

async function requestJsTicket() {
  const url = 'https://api.meeting.qq.com/v1/jsapi/ticket';
  const nonce = signUtils.nonce();
  const timestamp = signUtils.timestamp();
  const headers = {
    OpenId: userInfo.open_id,
    AccessToken: userInfo.access_token,
    'X-TC-Nonce': nonce,
    'X-TC-Timestamp': timestamp,
  }
  return axios.get(url, { headers })
    .then((resp) => {
      return resp.data;
    });
}

async function getReqData(request) {
  return new Promise(resolve => {
    let reqData = '';
    request.on('data', chunk => {
      reqData += chunk;
    })
    request.on('end', () => {
      try {
        reqData = JSON.parse(reqData);
      } catch { }
      resolve(reqData);
    });
  });
}

const server = http.createServer(async function (request, response) {
  console.log(request.method + ': ' + request.url);
  const reqData = await getReqData(request);
  console.log(reqData);

  const url = request.url.split('?')[0];
  switch (url) {
    case '/': {
      const html = path.resolve('wwwroot', '../web/index.html');
      readFile(html, function (err, data) {
        if (!err) {
          response.writeHead(200, {
            'Content-Type': 'text/html;charset=UTF-8',
          });
          response.end(data);
        } else {
          throw err;
        }
      });
      break;
    }
    case '/api/auth-login': {
      const authCode = reqData.auth_code;
      const accessToken = await requestAccessToken(authCode)
        .then((resp) => {
          const { code, data } = resp;
          if (code === 0) {
            userInfo = data;
            return 'success';
          }
          return 'fail';
        })
        .catch((err) => {
          console.log('err', err);
          return 'fail';
        });

      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(accessToken);
      break;
    }
    case '/api/jsapi_sign': {
      const jsTicket = await requestJsTicket()
        .then((resp) => {
          const { ticket } = resp;
          const url = request.headers.referer.split('#')[0];
          const signData = getSignData(ticket, url);
          return signData;
        })
        .catch((err) => {
          return err;
        });

      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(jsTicket));
      break;
    }

    default:
      response.writeHead(404, { 'Content-Type': 'text/html' });
      response.end('404');
      break;
  }
});

// 让服务器监听8080端口:
server.listen(8080);
console.log('Server is running at http://127.0.0.1:8080/');
