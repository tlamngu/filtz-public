function setup(){
    var planSelector = document.getElementsByName("plan-choose")
    console.log("setting up...")
    for(const element of planSelector){
        console.log(element)
        element.addEventListener("click", ()=>{
            console.log("Plan select")
            if(element.parentNode.getAttribute("plan") != "free"  && element.parentNode.getAttribute("plan") != "company"){
                alert("Plan not for sale now")
            }else if(element.parentNode.getAttribute("plan") == "company"){
                window.open("/request-plan", "_self")
            }else{
                window.open("/create?plan=free")
            }
        })
    }
}

setup()