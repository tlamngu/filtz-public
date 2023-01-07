var gift_count = 0;
var gift_list = [];
var urlString = window.location.href;
var paramString = urlString.split("?")[1];
var params = new URLSearchParams(paramString);
var gift_img_src = "";
async function GetData(url, mode) {
  let pack = undefined;
  const response = await fetch(`${url}${mode}`);
  // Storing data in form of JSON
  var data = await response.json();
  if (response) {
  }
  return Promise.resolve(data);
}
async function UploadData(url, mode, datat, pack){
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url+mode);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      return Promise.resolve(xhr)
  }};

  let data = JSON.stringify({"JSON": datat, "Package":pack});
  xhr.send(data);
}
//------------------------------------------------------------
function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}
function elementAdd(html, parent) {
  const placeholder = document.createElement("div");
  placeholder.insertAdjacentHTML("afterbegin", html);
  const node = placeholder.firstElementChild;
  parent.appendChild(node);
}
async function setup() {
  let disable = document.getElementsByClassName("ontop-layer")[0];
  disable.classList.replace("ontop-layer_unactive", "ontop-layer_active");
  console.log("Verify plan...");
  console.log("Plan:  " + params.get("plan"));
  console.log("Token:  " + params.get("token"));
  if (params.get("plan") == "company") {
    let token = params.get("token");
    if (token) {
      let result = await GetData("", `/check-plan/${token}`);
      if (result["TOKEN_RESULT"] == "avail") {
        disable.classList.replace("ontop-layer_active", "ontop-layer_unactive");
        document.getElementsByClassName("plan-title")[0].innerHTML =
          "PLAN - COMPANY";
        document.getElementById("plan-info").src =
          "/require/data+img+plan-company.png";
        document.getElementById("add_gift").addEventListener("click", () => {
          let gift_name = document.getElementById("gift_name_input");
          let random_toggle = document.getElementById("random-toggle");
          let gift_amount = document.getElementsByClassName("gift-amount")[0];
          if (gift_name.value != "" && Number(gift_amount.value)) {
            if (gift_img_src == "") {
              gift_img_src = "/require/data+img+gift-img-default.png";
            }
            elementAdd(
              `
                        <div class="gift-tag" index = "${gift_count}" id="gift_tag${gift_count}">
                        <img src="${gift_img_src}" alt="" width="50px" height="50px" style="margin: 10px;" style="object-fit:cover;">
                        <p>${gift_name.value}</p>
                        <div class="end">
                            <div class="option">
                                <label for="gift-amount">Amount: </label>
                                <input type="number" id="gift-amount" class="number" placeholder = "${gift_amount.value}" disabled>
                            </div>
                                <input type="image" src="/require/data+img+trash-can.png" alt="" width="20px" height="20px" style="margin-left: 10px;">
                            </div>
                        </div>
                        `,
              document.getElementsByClassName("gift-show")[0]
            );
            document
              .getElementsByClassName("gift-show")[0]
              .scrollTo(
                0,
                document.getElementsByClassName("gift-show")[0].scrollHeight
              );
            gift_list.push({
              Name: gift_name.value,
              Amount: Number(gift_amount.value),
              ImageURL: gift_img_src,
              ID: gift_count,
            });
            gift_count += 1;
            gift_name.value = "";
            gift_amount.value = "";
            gift_img_src = "";
            gift_name.focus();
          } else {
            if (!gift_name.value) {
              alert("Make sure you are filled gift name");
            } else if (!Number(gift_amount.value)) {
              alert("Gift amount must be a number!");
            }
          }
        });
      } else {
        alert("You are not able to use company plan\nFiltz.");
        window.open("/home", "_self");
      }
    }
  } else if (params.get("plan") == "free") {
    disable.classList.replace("ontop-layer_active", "ontop-layer_unactive");
    document.getElementById("image_uploader").remove();
    document
      .getElementsByClassName("fakefile")[0]
      .addEventListener("click", () => {
        alert("Your plan is [FREE] so you not able to use image.");
      });
    //-------------------------------------------------------------
    document.getElementById("add_gift").addEventListener("click", () => {
      let gift_name = document.getElementById("gift_name_input");
      let random_toggle = document.getElementById("random-toggle");
      let gift_amount = document.getElementsByClassName("gift-amount")[0];
      if (gift_name.value != "" && Number(gift_amount.value)) {
        if (gift_img_src == "") {
          gift_img_src = "/require/data+img+gift-img-default.png";
        }
        elementAdd(
          `
                <div class="gift-tag" index = "${gift_count}" id="gift_tag${gift_count}">
                <img src="${gift_img_src}" alt="" width="50px" height="50px" style="margin: 10px;" style="object-fit:cover;">
                <p>${gift_name.value}</p>
                <div class="end">
                    <div class="option">
                        <label for="gift-amount">Amount: </label>
                        <input type="number" id="gift-amount" class="number" placeholder = "${gift_amount.value}" disabled>
                    </div>
                        <input type="image" src="/require/data+img+trash-can.png" alt="" width="20px" height="20px" style="margin-left: 10px;">
                    </div>
                </div>
                `,
          document.getElementsByClassName("gift-show")[0]
        );
        document
          .getElementsByClassName("gift-show")[0]
          .scrollTo(
            0,
            document.getElementsByClassName("gift-show")[0].scrollHeight
          );
        gift_list.push({
          Name: gift_name.value,
          Amount: Number(gift_amount.value),
          ImageURL: gift_img_src,
          ID: gift_count,
        });
        gift_count += 1;
        gift_name.value = "";
        gift_amount.value = "";
        gift_img_src = "";
        gift_name.focus();
      } else {
        if (!gift_name.value) {
          alert("Make sure you are filled gift name");
        } else if (!Number(gift_amount.value)) {
          alert("Gift amount must be a number!");
        }
      }
    });
  }else if(!params.get("plan")){
    window.open("/create?plan=free","_self")
  }
}
var input = document.getElementById("image_uploader");

function uploadImg() {
  let data = new FormData();
  console.log(input.files);
  data.append("image", input.files[0], input.files[0].name);
  fetch(`/uploadImage?token=${params.get("token")}`, {
    method: "POST",
    body: data,
  })
    .then((response) => response.json())
    .then((data) => {
      imageResponse = data;
      let path = imageResponse.path;
      let res = "/require/";
      for (let i = 0; i < path.length; i++) {
        if (path[i] == "\\") {
          res += "+";
        } else {
          res += path[i];
        }
      }
      gift_img_src = res;
    });
}
document.getElementById("create").addEventListener("click", async () => {
  let title_input = document.getElementById("Title_input");
  let email_input = document.getElementById("email_input");
  let author_name = document.getElementById("AuthorName");
  let letter_input = document.getElementById("letter_input");
  email_input.style.borderBottomColor = "black";
  if (validateEmail(email_input.value)) {
    if (title_input.value && email_input.value && author_name.value && letter_input && gift_list.length != 0){
      let giftForm;
      let ownerData = []
      let index_owner = 0
      for(const element of gift_list){
        ownerData.push(JSON.parse(`{"id": "${index_owner}", "owner":[]}`))
        index_owner += 1;
      }
      if (params.get("plan") == "company") {
        giftForm = {
          Token: params.get("token"),
          Title: title_input.value,
          Email: email_input.value,
          Author: author_name.value,
          Letter: letter_input.value,
          License: params.get("plan"),
          giftPack: gift_list,
          "owner-mail": ownerData
        };
      } else {
        let token = await GetData("", `/free-token/${email_input.value}`);
        giftForm = {
          Token: token["token"],
          Title: title_input.value,
          Email: email_input.value,
          Author: author_name.value,
          Letter: letter_input.value,
          License: params.get("plan"),
          giftPack: gift_list,
          "owner-mail": ownerData
        };
      }
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "/upload");
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          let res =JSON.parse(xhr.responseText) 
          console.log(res)
          if(res["GIFT_PACK_RESULT"] == "SUCCESS"){
            window.open(`/authorize?token=${giftForm["Token"]}&email=${giftForm["Email"]}&auth_type=auth_create&plan=free?redirect=manager-space`, '_self')
          }else if(res["GIFT_PACK_RESULT"] == "FAIL"){
            alert("Error: authorzie fail stack_12")
          }else if((res["ERR"] == "ALREADY_CREATED_GIFT_PACK")){
            alert("Email used")
            email_input.focus();
            email_input.style.borderBottomColor = "red";
          }
      }};

      let data = JSON.stringify({"JSON": giftForm, "Package":"gift_pack_upload"});
      xhr.send(data);
}
  } else {
    alert("Please enter an valid email.");
    email_input.focus();
    email_input.style.borderBottomColor = "red";
  }
});
setup();
