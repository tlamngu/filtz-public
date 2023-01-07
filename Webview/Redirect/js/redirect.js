var urlString = window.location.href;
var paramString = urlString.split("?")[1];
var params = new URLSearchParams(paramString);
function setup(){
    document.getElementById("tp_manager").addEventListener("click", ()=>{
        window.open(`/manager?token=${params.get("token")}`, "_self")
    })
}
setup()