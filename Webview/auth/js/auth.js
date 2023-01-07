var digit_index = 0
var digit_arr = []
var urlString = window.location.href;
var paramString = urlString.split("?")[1];
var params = new URLSearchParams(paramString);
async function GetData(url, mode) {
    let pack = undefined;
    const response = await fetch(`${url}${mode}`);
    // Storing data in form of JSON
    var data = await response.json();
    if (response) {
    }
    return Promise.resolve(data);
}
async function setup(){    
    let auth_token = params.get("token")
    let email = params.get("email")
    let type = params.get("auth_type")
    if(type == "auth_create"){
        if(auth_token != "" && email !=""){
            console.log("Sending auth req...")
            let sender = await GetData("", `/sendAuthorize?token=${auth_token}&mail=${email}&plan=free&mode=verify_gift_pack`)
            console.log(sender)
            if(sender["AUTH_RES"] == "ALREADY_AUTH"){
                alert("Error, your email was authorized.\nIf you want to access the manager space, use the link showed when you create pack. If you lost it, contact admin (Update later)")
                window.open("/home", "_self")
            }
        }else{
            alert("Err - missing token / email")
            window.open("/home","_self")
        }
    }else if(type == "recieve"){
        if(auth_token != "" && email != ""){
            console.log("Sending auth req...")
            let sender = await GetData("", `/sendAuthorize?token=${auth_token}&mail=${email}&mode=recieve`)
            console.log(sender)
            if(sender["AUTH_RES"] == "ALREADY_AUTH"){
                alert("Error, your email was authorized.\nIf you want to access the manager space, use the link showed when you create pack. If you lost it, contact admin (Update later)")
                window.open("/home", "_self")
            }
        }else{
            alert("Err - missing token / email")
            window.open("/home","_self")
        }
    }
    let digits = document.getElementsByClassName("Auth-digit")
    document.getElementById("first").addEventListener("click",()=>{
        digit_arr = []
        digit_index = 0
        for(const element of digits){
            let inp = element.getElementsByTagName("input")[0]
            inp.value = ""
        }
        console.log("Digit resset")
    })
    for(const element of digits){
        console.log(element)
        let inp = element.getElementsByTagName("input")[0]
        inp.addEventListener("keypress", (e)=>{
            if(e.keyCode === 13){
                digit_index += 1
                if(digit_index < digits.length){
                    digits[digit_index].getElementsByTagName("input")[0].focus()
                    digit_arr.push(digits[digit_index-1].value)
                }else{
                    digit_arr = []
                    for(const elements of digits){
                        let inpt = elements.getElementsByTagName("input")[0]
                        digit_arr.push(inpt.value)
                    }
                    document.getElementById("check_pin").click()
                }
            }
        })

    }
}
document.getElementById("check_pin").addEventListener("click",async ()=>{
    let digits = document.getElementsByClassName("Auth-digit")
    if(digit_index < 6){
        for(const input of digits){
            input.style.borderColor = "black"
        }
        for (let index = digit_index; index < 6; index++) {
            digits[index].style.borderColor = "red";
        }
        alert("Please enter 6-digit code.")
    }else{
        let auth_token = params.get("token")
        let pin_trans = ""
        console.log(digit_arr)
        for(const char of digit_arr){
            console.log(char)
            pin_trans = pin_trans + char
        }
        if(params.get("auth_type") == "auth_create"){
            let pin_check = await GetData("",`/authcheck?token=${auth_token}&pin=${pin_trans}&mode=giftPack_create&email=${params.get("email")}`)
            console.log(pin_check)
            if(pin_check["result"] == "TRUE"){
                window.open(`/redirect?token=${params.get("token")}`, '_self')
            }
        }else if(params.get("auth_type") == "recieve"){
            let pin_check = await GetData("",`/authcheck?token=${auth_token}&pin=${pin_trans}&mode=revcieve_gift&email=${params.get("email")}`)
            console.log(pin_check)
            if(pin_check["result"] == "TRUE"){
                localStorage.setItem(params.get("token") ,pin_check["one-time-token"])
                window.open(`/recieve/animate?token=${params.get("token")}`, "_self")
            }else{
                alert("Err: Invalid OTP")
            }
        }
        
    }
})
setup()