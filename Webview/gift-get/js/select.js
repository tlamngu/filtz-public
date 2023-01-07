var urlString = window.location.href
var paramString = urlString.split('?')[1];
var params = new URLSearchParams(paramString);
var Token = params.get("token")
async function GetData(url, mode) {
    let pack = undefined;
    const response = await fetch(`${url}${mode}`);
    // Storing data in form of JSON
    var data = await response.json();
    if (response) {
    }
    return Promise.resolve(data);
}
function elementAdd(html, parent) {
  const placeholder = document.createElement("div");
  placeholder.insertAdjacentHTML("afterbegin", html);
  const node = placeholder.firstElementChild;
  parent.appendChild(node);
}
function addGift(giftpack){
    let gift_html = ""
    let gift_ind = []
    let complete_ind = 0
    let current = 0
        for(const gift of giftpack["Gift_allow"] ){
        if(current % 3 == 0 && current != 0){
            gift_ind.push(`
            <div class="gift-line">
                ${gift_html}
            </div>
            `)
            gift_html = ""
            current = 1
            complete_ind ++
        }
        gift_html = gift_html + `
        <div class="gift" gift_index="${gift["ID"]}">
        <img src="${gift["ImageURL"]}" alt="">
        <h2>${gift["Name"]}</h2>
        <button class="gift-selection" onclick="claim(this)">Claim</button>
        </div>`
        current ++
    }
    let n_com_line = ""
    let n_p = false
    console.log(`Filling: [${giftpack["Gift_allow"].length}] / [${complete_ind*3}]`)
    if(giftpack["Gift_allow"].length - complete_ind*3 > 0){
        for(let i = complete_ind*3; i <  giftpack["Gift_allow"].length;i++){
            let gift = giftpack["Gift_allow"][i]
            n_com_line = n_com_line + `
            <div class="gift" gift_index="${gift["ID"]}" >
             <img src="${gift["ImageURL"]}" alt="">
             <h2>${gift["Name"]}</h2>
             <button class="gift-selection" onclick="claim(this)">Claim</button>
             </div>`
        }
        n_com_line = `
        <div class="gift-line" style ="justify-content: left;">
                    ${n_com_line}
                </div>
        `
        n_p = true        
    }
    
    for(const line of gift_ind){
        elementAdd(line, document.getElementById("gift-panel"))
    }
    if(n_p){
        elementAdd(n_com_line, document.getElementById("gift-panel"))
    }
}
async function setup(){
    let Token = params.get("token")
    let OTT = localStorage.getItem(Token)
    if(Token && OTT){
        let valid = await GetData("", `/check-ott?ott=${OTT}&token=${Token}`)
        console.log(valid)
        if(valid["ott-res"] == "_OTT_TOKEN_"){
            let gift_data = await GetData("", "/get-gift/"+Token)
            console.log(gift_data)
            if(gift_data["res"] == "_TRUE_"){
                addGift(gift_data["Package"])
                elementAdd(`<p>To: ${gift_data["Package"]["Name_target"]}</p>`, document.getElementById("letter"))
                let letterLine = gift_data["Package"]["Letter"].split("\n\n")
                console.log(letterLine)
                for(const line of letterLine){
                    let linear = line.replaceAll("\n", "<br>")
                    elementAdd(`<p>${linear}</p>`, document.getElementById("letter"))
                }
            }
        }
    }else{
        alert("Error, authorize timeout")
        window.open("/home", "_self")
    }
}
async function claim(t){
    let Gift = t.parentNode
    let gID = Gift.getAttribute("gift_index")
    let res = await GetData("",`/apiv2/claim?token=${params.get("token")}&gift-id=${gID}`)
    console.log(res)
    if(res["res"] == "SUCCESS"){
        alert("Your selection has been record, the gift-pack owner has been notify about it.")
        localStorage.clear()
        window.open("/home", "_self")
    }
}

setup()