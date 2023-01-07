var gID
var urlString = window.location.href;
var paramString = urlString.split("?")[1];
var params = new URLSearchParams(paramString);
function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}
function setup(){
    let urlString = window.location.href
    let paramString = urlString.split('?')[1];
    let params = new URLSearchParams(paramString);
    let giftID = params.get("token")
    if(!giftID){
        gID = prompt("Please enter your gift id")
    }else{
        gID = giftID
    }
    document.getElementById("Next").addEventListener("click", ()=>{
        let email_inp = document.getElementById("email_collector")
        if(validateEmail(email_inp.value)){
            window.open(`/authorize?email=${email_inp.value}&token=${params.get("token")}&auth_type=recieve`, "_self")
        }else{
            email_inp.value = ""
            email_inp.focus()
            email_inp.style.borderColor = "red"
            alert("Please enter an valid email!")
        }
    })
}

setup()