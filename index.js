const express = require('express')
const app = express()
const port = 3000
const http = require("http");
const server = http.createServer(app);
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");
var nodemailer = require('nodemailer');
app.use(bodyParser.json());

const serverConf = {
  adress: false, //"172.16.20.199", //"192.168.1.78",//"172.16.20.154", //false,
  port: "5000",
};

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'ftiz.zeaky@gmail.com',
    pass: 'rifqmgiitdxmghcg'
  }
});

function getTime(offset)
        {
            var d = new Date();
            localTime = d.getTime();
            localOffset = d.getTimezoneOffset() * 60000;

            // obtain UTC time in msec
            utc = localTime + localOffset;
            // create new Date object for different city
            // using supplied offset
            var nd = new Date(utc + (3600000*offset));
            //nd = 3600000 + nd;
            utc = new Date(utc);
            // return time as a string
            return nd.toLocaleString()
}
function random_length(n) {
  var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   
  
  if ( n > max ) {
          return generate(max) + generate(n - max);
  }
  
  max        = Math.pow(10, n+add);
  var min    = max/10; // Math.pow(10, n) basically
  var number = Math.floor( Math.random() * (max - min + 1) ) + min;
  
  return ("" + number).substring(add); 
}

function uuidv4() { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if(d > 0){//Use timestamp until depleted
          r = (d + r)%16 | 0;
          d = Math.floor(d/16);
      } else {//Use microseconds since page-load if supported
          r = (d2 + r)%16 | 0;
          d2 = Math.floor(d2/16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
const imageStorage = multer.diskStorage({
  // Destination to store image
  destination: "data/gift-img",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
    // file.fieldname is name of the field (image)
    // path.extname get the uploaded file extension
  },
});
const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});

app.post(
  "/uploadImage",
  imageUpload.single("image"),
  (req, res) => {
    
    console.log("Handle gift img..");
    res.send(req.file);
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

app.get('/blank', (req, res) =>{
  res.sendFile(__dirname + "/Webview/template/html/index.html")
})
app.get('/home', (req, res) =>{
  res.sendFile(__dirname + "/Webview/home/html/index.html")
})
app.get('/about-us', (req, res) =>{
  res.sendFile(__dirname + "/Webview/about/html/index.html")
})
app.get('/create', (req, res) =>{
  res.sendFile(__dirname + "/Webview/create/html/index.html")
})
app.get('/authorize', (req, res) =>{
  res.sendFile(__dirname + "/Webview/auth/html/index.html")
})
app.get('/plan-request', (req, res) =>{
  res.sendFile(__dirname + "/Webview/request-plan/html/index.html")
})
app.get('/redirect', (req, res) =>{
  res.sendFile(__dirname + "/Webview/Redirect/html/index.html")
})
app.get('/manager', (req, res) =>{
  res.sendFile(__dirname + "/Webview/manager-space/html/index.html")
})
app.get('/recieve', (req, res) =>{
  res.sendFile(__dirname + "/Webview/gift-get/html/index.html")
})
app.get('/recieve/animate', (req, res) =>{
  res.sendFile(__dirname + "/Webview/gift-get/html/animate.html")
})
app.get('/recieve/claim', (req, res) =>{
  res.sendFile(__dirname + "/Webview/gift-get/html/select.html")
})
app.get('/free-token/:email', (req, res)=>{
  let currentTokenFile = fs.readFileSync(__dirname + "/data/plan/free.json")
  let currentToken = JSON.parse(currentTokenFile)
  for(const token of currentToken){
    if(token["email"] == req.params.email){
      res.send({"token": token["token"]})
      return
    }
  }
  let uuid = uuidv4()
  currentToken.push({
    "token" : uuid,
    "email" : req.params.email,
    "Authorized": false,
    "OTP": []
 })
 fs.writeFileSync(__dirname+"/data/plan/free.json", JSON.stringify(currentToken))
 res.send({"token": uuid})
})
app.post("/upload", (req, res) => {
  console.log("Handling post...")
  let jsonData = req.body.JSON;
  let pack = req.body.Package;
  if(pack == "gift_pack_upload"){
    let dataPack = fs.readFileSync(__dirname+"/data/plan/giftPack.json")
    let data = JSON.parse(dataPack)
    let tokenFile = fs.readFileSync(__dirname + "/data/plan/free.json")
    let token = JSON.parse(tokenFile)
    for (let index = 0; index < token.length; index++) {
      const element = token[index];
      if(element["token"] == jsonData["Token"]){
        for(const checker of data){
          if(checker["Token"] == jsonData["Token"]){
            res.send({"ERR":"ALREADY_CREATED_GIFT_PACK"})
            console.log("ERR_SPAM_CREATE_FREE")
            return
          }
        }
        jsonData["binding"] = []
        data.push(jsonData)
        fs.writeFileSync(__dirname+"/data/plan/giftPack.json", JSON.stringify(data))
        res.status(200)
        res.send({"GIFT_PACK_RESULT": "SUCCESS"})
        console.log("Successful add giftpack, not authorized.")
        return
      }
    }
    console.log("Token fail at upload gift pack")
    res.send({"GIFT_PACK_RESULT": "FAIL"})
  }else if(pack == "generate_gift_link"){
    console.log(jsonData)
    let gifts = jsonData["giftPack"]
    let to    = jsonData["to_name"]
    let token = jsonData["token"]
    let defaultPackFile = fs.readFileSync(__dirname+"/data/plan/giftPack.json")
    let defaultPack = JSON.parse(defaultPackFile)
    for(const pack of defaultPack){
      if(pack["Token"] == token){
        let bindFile = fs.readFileSync(__dirname+"/data/plan/bind.json")
        let bind_data = JSON.parse(bindFile)
        let linkFile = fs.readFileSync(__dirname+"/data/plan/gift_recieve_data.json")
        let link = JSON.parse(linkFile)
        let uuid = uuidv4()
        bind_data[token] = uuid
        link[uuid] = {
          "Gift_allow": gifts,
          "Name_target": to,
          "Email_bind": "",
          "Authorized": false,
          "Claimed": false,
          "Letter": jsonData["Letter"],
          "OTP": 0,
          'one-time-token': ""
        }
        pack["binding"].push(uuid)
        console.log(link)
        fs.writeFileSync(__dirname+"/data/plan/giftPack.json", JSON.stringify(defaultPack))
        fs.writeFileSync(__dirname+"/data/plan/gift_recieve_data.json", JSON.stringify(link))
        fs.writeFileSync(__dirname+"/data/plan/bind.json", JSON.stringify(bind_data))
        res.send({"result":"SUCCESS", "sub_token": uuid})
        return
      }
    }
  }
  res.send({"Result": "api_not_vail"})

})
app.get('/', (req, res) => {
  res.send({"HELLO FROM NODE PLANT SERVER - BETA": "IM ZS-BOT-05"});
})


app.get("/require/:file", (req, res) => {
  let file = req.params.file;
  let filedirect = "/";
  for (let i = 0; i < file.length; i++) {
    if (file[i] == "+") {
      filedirect += "/";
    } else {
      filedirect += file[i];
    }
  }
  try {
    if (fs.existsSync(__dirname + `/${filedirect}`)) {
      let ext = path.extname(filedirect);
      if (ext == ".js") {
        res.setHeader("content-type", "application/javascript");
      } else if (ext == ".html") {
        res.setHeader("content-type", "text/html");
      } else if (ext == ".css") {
        res.setHeader("content-type", "text/css");
      }
      res.statusCode = 200;
      res.sendFile(__dirname + filedirect);
    }
  } catch (err) {
    res.statusCode(400);
    res.send({ Status: "ERROR-FILE-NOT-FOUND" });
  }
});
app.get('/check-plan/:token', (req, res)=>{
  console.log("Token process:  " + req.params.token)
  var tokenFile = fs.readFileSync(__dirname+"/data/plan/company.json")
  var tokenList = JSON.parse(tokenFile)
  for(const token of tokenList){
    console.log(token)
    if(token["Token"] == req.params.token){
      res.send({"TOKEN_RESULT": "avail"})
      return
    }
  }
  res.send({"TOKEN_RESULT": "unvaild"})
})

app.get('/sendAuthorize', (req, res) => {
  let url = req.url
  let paramString = url.split("?")[1];
  let params = new URLSearchParams(paramString);
  let token = params.get("token")
  let mail = params.get("mail")
  let plan = params.get("plan")
  let mode = params.get("mode")
  console.log(url)
  console.log(plan)
  if(plan == "free" && mode == "verify_gift_pack"){
    console.log("Free plan auth")
    let tokenFile = fs.readFileSync(__dirname+"/data/plan/free.json")
    let tokens = JSON.parse(tokenFile)
    for(const pack of tokens){
      if(pack["token"] == token){
        if(pack["email"] == mail){
          if(pack["Authorized"] == true){
            res.send({"AUTH_RES": "ALREADY_AUTH"})
            return
          }else{
            if(pack["OTP"] == 0){
              let otp = random_length(6)
            pack["OTP"] = otp
            var mailOptions = {
              from: 'ftiz.zeaky@gmail.com',
              to: mail,
              subject: `Your otp:  ${otp}\nFiltz version -2.02.1`,
              html: `
              <h1>WELLCOME TO OUR WEBSITE!</h1>
              <img width="200px" src="https://lh3.googleusercontent.com/fife/AAbDypCVsiSluvQJ0pSYOTJnYtDLxqE2pnFSNy-qI2Q_NFFXPKIGU7Jwg1LEz8Dvhgd0SLMiizX1Iitpcp21cGEy3B-eIJD1U0CeU8yeAQQVi6ZidRzyqMDzq82k_uI0NglDXoHr05cCcXUxdS1H9FC8ftgWB-b_txyHl88uV9I4heqLuRnqsoOYNsttnDjLB15UCeUHOzePsISJOyaG-JUkR1Tqvm2jeN3WpC-gojg_05Y-jIaklIIBkUQhBBOpVPr_YaYSTaV2YzIneEJpx8zVXiCkddXrTcTCm6E-IQp6dUcigvQGBl1cGHRY6E_WiMf-Buf71Q6W6afCE716gkUBbjmS3uVLjfmXLUUJTxA68J23LA6HdmRiAuQEb09E1jxJtKVSHT_qKn0nXg32PIj3qWPKhDNkQtfonIuLgKMjFX2-J7_x0lPbTBN17MEYqgwa2c709KOHV1M2ehEQyxpiTPeMaaKoTLbwxliKN98fxt-JhQEwJ5RnqW3Wl2KgF6T60IM6wSfFoHsu2hF1no_Kf8gBG-ozTuHEfq7WWlni-gw8RlxxGXEc7e6mxPmkX7gx-vP-u59KXv4v8amOizk_WALCqbgxxCWet4CcflGYvP0F_DONBcA41Rflq8tngsusXdLKjADo2_lcAmnM9JOXA8NyLCB_pvwptk2-2cTE-dEus1d3UzCuTn8jegZYBCQyvhROG_siZFtaCMz0xEvrHVZTX1v9R2c-ngB7HYrlhmOF9iCCSQAesszAOsQ6Ua0cPHeNWzsQPH2yiFKeXxgLZUrPIgTxWfJRsL7zDYOIepmzwFLUW61JFF-aHVGWI0S1caVEUC9Pn_cwyts7xo8A4DBrz3IjWbiQzWMAD5XP46YuVDZqJfWedzWYKzlevEMP51KdSdZ3PGO1zWF3eS-Oi1F51dxgJ1joKF-M2JArltR4dOGg3w59s_hM8soV-_sXhPsbOr04AaVtyAfYbLzbrGSgVHfCZ5B0jY44iqcAFyIWMbFPJHbqvVyQc9T4jin3EkncSDSMyGSYaHod-FJposNELKAzcExlUHyzlTx4KJgIIIFPTXFP5XxXCeOaVEHNubzQYfqrY6xnlwVQCxAl5mo-t72rJ0UiDBtIwXiLpcleu2SXv5jw8kEvWYnWISETXg1fFOujbA3uXBvZiG78p97JPtM4lcOr8CE9VrsGu8x0J9ULLddU9oyQQNw2JWf4lsMm8OcCvSW_eLwv_qfay_5FuztzGP6OMYUp_fF_FtYr8iT3W7La5oVppSB_zEGr_HkbYP-68DIuDXc9js2JkJuGwGdGRExifDow0zdu059oRppI8SuEHRkAL2GBixMCTy5pQS0Uzrww2PxsvAW8iyYgbfwjGpYJp9KDtcumS9XmQSlftYooiQ0ZzwVtEvZtHXFuFCHdBjqqU5YV7pGYbJ2sgX4i8_G9pVZwpWxDGC3yVc6iY4cNKvWC5qSaRViD9XhMMCivrbEiqqYBmyS5BC50AiEFqaTo6gipxu6BXIBqVimn7SUvJnlENvA-fxNqAlAq0EJx3bD8JMZA2SNm68PtNTwk80J3clDgE4AVZVg6I3cliCU8K0J4WGs9voT0-dw3SBLm_vRvtXzM75kY-P38LLtSlD-a=w1879-h962"><img>

              <h2>You have oder an authentication, here is your code: <strong>${otp}</strong></h2>
              `,
              priority: "high"
            };
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
            fs.writeFileSync(__dirname+"/data/plan/free.json", JSON.stringify(tokens))
            }
          }
        }
      }
    }
    res.send({"AUTH_RES":"DONE"})
    return
  }else if(mode == "recieve"){
    console.log("handling auth send request")
    let giftLinkFile = fs.readFileSync(__dirname+"/data/plan/gift_recieve_data.json")
    let giftLink = JSON.parse(giftLinkFile)
    if(giftLink[token]){
      let otp = random_length(6)
      if(giftLink[token]["OTP"] == 0){
        giftLink[token]["OTP"] = otp
        var mailOptions = {
          from: 'ftiz.zeaky@gmail.com',
          to: mail,
          subject: `Your otp:  ${otp}\nFiltz version -2.02.1`,
          html: `
          <h1>WELLCOME TO OUR WEBSITE!</h1>
          <img width="200px" src="https://lh3.googleusercontent.com/fife/AAbDypCVsiSluvQJ0pSYOTJnYtDLxqE2pnFSNy-qI2Q_NFFXPKIGU7Jwg1LEz8Dvhgd0SLMiizX1Iitpcp21cGEy3B-eIJD1U0CeU8yeAQQVi6ZidRzyqMDzq82k_uI0NglDXoHr05cCcXUxdS1H9FC8ftgWB-b_txyHl88uV9I4heqLuRnqsoOYNsttnDjLB15UCeUHOzePsISJOyaG-JUkR1Tqvm2jeN3WpC-gojg_05Y-jIaklIIBkUQhBBOpVPr_YaYSTaV2YzIneEJpx8zVXiCkddXrTcTCm6E-IQp6dUcigvQGBl1cGHRY6E_WiMf-Buf71Q6W6afCE716gkUBbjmS3uVLjfmXLUUJTxA68J23LA6HdmRiAuQEb09E1jxJtKVSHT_qKn0nXg32PIj3qWPKhDNkQtfonIuLgKMjFX2-J7_x0lPbTBN17MEYqgwa2c709KOHV1M2ehEQyxpiTPeMaaKoTLbwxliKN98fxt-JhQEwJ5RnqW3Wl2KgF6T60IM6wSfFoHsu2hF1no_Kf8gBG-ozTuHEfq7WWlni-gw8RlxxGXEc7e6mxPmkX7gx-vP-u59KXv4v8amOizk_WALCqbgxxCWet4CcflGYvP0F_DONBcA41Rflq8tngsusXdLKjADo2_lcAmnM9JOXA8NyLCB_pvwptk2-2cTE-dEus1d3UzCuTn8jegZYBCQyvhROG_siZFtaCMz0xEvrHVZTX1v9R2c-ngB7HYrlhmOF9iCCSQAesszAOsQ6Ua0cPHeNWzsQPH2yiFKeXxgLZUrPIgTxWfJRsL7zDYOIepmzwFLUW61JFF-aHVGWI0S1caVEUC9Pn_cwyts7xo8A4DBrz3IjWbiQzWMAD5XP46YuVDZqJfWedzWYKzlevEMP51KdSdZ3PGO1zWF3eS-Oi1F51dxgJ1joKF-M2JArltR4dOGg3w59s_hM8soV-_sXhPsbOr04AaVtyAfYbLzbrGSgVHfCZ5B0jY44iqcAFyIWMbFPJHbqvVyQc9T4jin3EkncSDSMyGSYaHod-FJposNELKAzcExlUHyzlTx4KJgIIIFPTXFP5XxXCeOaVEHNubzQYfqrY6xnlwVQCxAl5mo-t72rJ0UiDBtIwXiLpcleu2SXv5jw8kEvWYnWISETXg1fFOujbA3uXBvZiG78p97JPtM4lcOr8CE9VrsGu8x0J9ULLddU9oyQQNw2JWf4lsMm8OcCvSW_eLwv_qfay_5FuztzGP6OMYUp_fF_FtYr8iT3W7La5oVppSB_zEGr_HkbYP-68DIuDXc9js2JkJuGwGdGRExifDow0zdu059oRppI8SuEHRkAL2GBixMCTy5pQS0Uzrww2PxsvAW8iyYgbfwjGpYJp9KDtcumS9XmQSlftYooiQ0ZzwVtEvZtHXFuFCHdBjqqU5YV7pGYbJ2sgX4i8_G9pVZwpWxDGC3yVc6iY4cNKvWC5qSaRViD9XhMMCivrbEiqqYBmyS5BC50AiEFqaTo6gipxu6BXIBqVimn7SUvJnlENvA-fxNqAlAq0EJx3bD8JMZA2SNm68PtNTwk80J3clDgE4AVZVg6I3cliCU8K0J4WGs9voT0-dw3SBLm_vRvtXzM75kY-P38LLtSlD-a=w1879-h962"><img>

          <h2>You have oder an authentication, here is your code: <strong>${otp}</strong></h2>
          `,
          priority: "high"
        };
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
        fs.writeFileSync(__dirname+"/data/plan/gift_recieve_data.json", JSON.stringify(giftLink))
        res.send({"AUTH_RES":"DONE"})
        return
      }else{
        res.send({"AUTH_ERR":"INVALID_TOKEN"})

      }
      
    }else{
      res.send({"AUTH_ERR": "_TOKEN_UNVALID_"})
      return
    }
  }
})
app.get('/authcheck', (req,res)=>{
  let url = req.url
  let paramString = url.split("?")[1];
  let params = new URLSearchParams(paramString);
  let pincode =params.get("pin")
  let token = params.get("token")
  let mode = params.get("mode")
  console.log(`Verify auth [${url}]:`)
  console.log("Token:  "+token)
  console.log("Pin:  "+pincode)
  if(pincode && token){
    if(mode == "giftPack_create"){
      let tokenFile = fs.readFileSync(__dirname+"/data/plan/free.json")
      let tokens = JSON.parse(tokenFile)
      for(const tag of tokens){
        if(tag["token"] == token){
          if(tag["OTP"] == pincode){
            res.send({"result": "TRUE"})
            tag["OTP"] = 0
            tag["Authorized"] = true
            fs.writeFileSync(__dirname+"/data/plan/free.json",JSON.stringify(tokens))
            return
          }else{
            res.send({"result": "FALSE"})
            return
          }
        }
      }
    }else if(mode == "revcieve_gift"){
      let gift_metadata = fs.readFileSync(__dirname+"/data/plan/gift_recieve_data.json")
      let gifts = JSON.parse(gift_metadata)
      if(gifts[token]){
        if(gifts[token]["OTP"] == pincode){
          let OTT = uuidv4()
          gifts[token]["OTP"] = 0
          gifts[token]["Email_authorized"] = true
          gifts[token]["one-time-token"] = OTT
          gifts[token]["Email_bind"] = params.get("email")
          fs.writeFileSync(__dirname + "/data/plan/gift_recieve_data.json", JSON.stringify(gifts))
          res.send({"result": "TRUE", "one-time-token": OTT})
          return
        }
      }else{
        res.send({"Auth_check_err": "error_on_token_"})
        return
      }
    }
    
    res.send({"result": "TOKEN_INVAILD"})
    return
  }
  res.send({"result":"MISSING ARGS"})
})
app.get('/check-ott', (req, res)=>{
  let url = req.url
  let paramString = url.split("?")[1];
  let params = new URLSearchParams(paramString);
  let gift_token = params.get("token")
  let OTT = params.get("ott")
  let gift_recd_file = fs.readFileSync(__dirname + "/data/plan/gift_recieve_data.json")
  let gift_recv_data = JSON.parse(gift_recd_file)
  if(gift_recv_data[gift_token]["one-time-token"] == OTT){
    res.send({"ott-res": "_OTT_TOKEN_"})
    return
  }else{
    res.send({"ott-err": "_UNVALID_OTT_"})
    return
  }

})
app.get('/get-gift/:token', (req, res)=>{
  let token = req.params.token
  let gift_recd_file = fs.readFileSync(__dirname + "/data/plan/gift_recieve_data.json")
  let gift_recv_data = JSON.parse(gift_recd_file)
  if(gift_recv_data[token]){
    res.send({"res": "_TRUE_", "Package": gift_recv_data[token]})
    console.log("Sended gift data to client")
    return
  }else{
    res.send({"res": "__UNVALID__"})
  }

})
app.get('/get-pack/:token', (req, res) => {
  let packFile = fs.readFileSync(__dirname+"/data/plan/giftPack.json")
  let packs = JSON.parse(packFile)
  for(const package of packs){
    if(package["Token"] == req.params.token){
      res.send({"result": package})
      return
    }
  }
  res.send({"result": "_NOT_FOUND_"})
})
app.get('/apiv2/claim', (req, res)=>{
  let url = req.url
  let paramString = url.split("?")[1];
  let params = new URLSearchParams(paramString);
  let sub_token = params.get("token")
  let giftID = params.get("gift-id")
  let bindFile = fs.readFileSync(__dirname + "/data/plan/bind.json")
  let binder = JSON.parse(bindFile)
  let giftFile = fs.readFileSync(__dirname + "/data/plan/giftPack.json")
  let giftPack = JSON.parse(giftFile)
  let recvDataFile = fs.readFileSync(__dirname + "/data/plan/gift_recieve_data.json")
  let recvData = JSON.parse(recvDataFile)
  for(const gift of giftPack){
    for(const sub_tokent of gift["binding"]){
      if(sub_token == sub_tokent){
        let True_token = gift["Token"]
        if(gift["giftPack"][Number(giftID)]["Amount"] > 0){
          gift["giftPack"][Number(giftID)]["Amount"]-=1
        }else{
          res.send({"err":"_OUT_OF_STOCK_"})
          return
        }
        for(const owner of gift["owner-mail"]){
          if(owner["id"] == String(giftID)){
            owner["owner"].push(recvData[sub_token]["Email_bind"])
          }
        }
        delete recvData[sub_token]
        delete binder[gift["Token"]]
        fs.writeFileSync(__dirname + "/data/plan/bind.json", JSON.stringify(binder))
        fs.writeFileSync(__dirname + "/data/plan/giftPack.json", JSON.stringify(giftPack))
        fs.writeFileSync(__dirname + "/data/plan/gift_recieve_data.json", JSON.stringify(recvData))
        res.send({"res": "SUCCESS"})
        return
      }
    }
  }
})
app.get('*', function(req, res){
  res.sendFile(__dirname + "/Webview/404/html/index.html");
});
if (serverConf["adress"] != false) {
  server.listen(serverConf["port"], serverConf["adress"], () => {
    console.log(`
      
      RUNNING ON:  http://${serverConf["adress"]}:${serverConf["port"]} 
      
      `);
  });
} else {
  server.listen(serverConf["port"], () => {
    console.log(`
      
 
      RUNNING ON:  http://localhost:${serverConf["port"]} 

      `);
  });
}


