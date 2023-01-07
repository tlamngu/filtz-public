var click_index = 0
var click_tar = Math.round(Math.random()*10)
async function GetData(url, mode) {
    let pack = undefined;
    const response = await fetch(`${url}${mode}`);
    // Storing data in form of JSON
    var data = await response.json();
    if (response) {
    }
    return Promise.resolve(data);
}
document.getElementById("head-en").addEventListener("click",async()=>{
    let contain = document.getElementsByClassName("ontop-layer")[0]
    if(click_index <= click_tar){
        document.getElementsByClassName("ontop-layer")[0].classList.add("blur_fx")
        contain.classList.replace("ontop-layer_unactive", "ontop-layer_active")
        setTimeout(()=>{
            contain.classList.replace("ontop-layer_active", "ontop-layer_unactive")
            document.getElementsByClassName("ontop-layer")[0].classList.remove("blur_fx")
    
        }
        ,200)
        click_index += 1 
    }else{
        document.getElementById("head-en").style.display = "none"
        document.getElementById("body-en").classList.add("body-en-hide")
        document.getElementById("letter").classList.add("letter-active")  
        setTimeout(async()=>{
            document.getElementById("letter").classList.remove("letter-active")
            document.getElementById("letter").classList.add("letter-final")
            let urlString = window.location.href
            let paramString = urlString.split('?')[1];
            let params = new URLSearchParams(paramString);
            let Token = params.get("token")
            if(Token){
                let OTT = localStorage.getItem(Token)
                if(OTT){
                    let valid = await GetData("", `/check-ott?ott=${OTT}&token=${Token}`)
                    console.log(valid)
                    if(valid["ott-res"] == "_OTT_TOKEN_"){
                        window.open(`/recieve/claim?token=${Token}`, "_self")
                    }
                }else{
                    window.open(`http://localhost:5000/recieve?token=${Token}`, "_self")
                }
            }else{
                alert("Error: authorize fail, get back to home [STACK12]")
                window.open(`/home`, "_self")
            }
        },200)
        
    }
  
})