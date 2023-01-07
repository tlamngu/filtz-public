var header = document.getElementsByClassName("header")[0];
const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (
      /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      return "mobile";
    }
    return "desktop";
};
var sticky = header.offsetTop;
function hasClass(element, className) {
    return (' ' + element.className + ' ').indexOf(' ' + className+ ' ') > -1;
}

function mousemove(event){
    if(window.pageYOffset > sticky){

        if(event.clientY < header.clientHeight){
                header.classList.add("sticky-header")
        }else{
            if(hasClass(header, "sticky-header")){
                header.classList.remove("sticky-header")
            }
        }
    }
}
window.onscroll = ()=>{
    if(window.pageYOffset > sticky + 10){
        let ghost = document.getElementsByClassName("header-ghost")[0]
        //ghost.style.display = "block"
    }else{
        let ghost = document.getElementsByClassName("header-ghost")[0]
        //ghost.style.display = "none"
    }
}
window.addEventListener('mousemove', mousemove);

window.onload = ()=>{
 header.classList.add("relative")   
    Device_limit()
    document.getElementsByClassName("ontop-layer")[0].classList.add("ontop-layer_unactive")
}
function Device_limit(){
    if(getDeviceType() == "mobile" || window.innerWidth < 1000){
        let contain = document.getElementsByClassName("ontop-layer")[0]
        contain.style.display = null
        contain.innerHTML = "Look like you are using mobile, change device and continue.\nErr: mobile not supported.\nIf not"
        contain.classList.replace("ontop-layer_unactive", "ontop-layer_active")
        contain.style.textAlign = "center"
        contain.scrollIntoView()
        header.style.display = "none"
        document.getElementsByTagName("body")[0].style.overflowY = "hidden"
    }else{
        let contain = document.getElementsByClassName("ontop-layer")[0]
        contain.innerHTML = ""
        contain.classList.replace("ontop-layer_active", "ontop-layer_unactive")
        header.style.display = "flex"
        document.getElementsByTagName("body")[0].style.overflowY = "scroll"
    }
}
window.onresize = ()=>{
    Device_limit()
}