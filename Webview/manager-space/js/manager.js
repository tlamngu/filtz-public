var urlString = window.location.href;
var paramString = urlString.split("?")[1];
var params = new URLSearchParams(paramString);
var gift_pack_global = [];
var gift_gen_accept_list = [];
var gift_accept_element = [];
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
function loadGift_generatorStack(gift_data) {
  for (const gift of gift_data) {
    elementAdd(
      `
        <div class="gift-tag" gift_index="${gift["ID"]}" id="giftLinkTag_${gift["ID"]}">
            <img src="${gift["ImageURL"]}" alt="" width="50px" height="50px" style="margin: 10px;">
            <p>${gift["Name"]}</p>
            <p>Amount left: ${gift["Amount"]}</p>
            <div class="end">
                <input type="checkbox" width="30px" height="30px" onchange="gift_link_gen_add(this)">
            </div>
        </div>
        `,
      document.getElementById("gift_link_gen_gift_list")
    );
    console.log("loaded 1 gift...");
  }
}
function loadGift_analytics(gift_data) {
  for (const gift of gift_data) {
    elementAdd(
      `
        <div class="gift-tag" gift_index="${gift["ID"]}">
                <img src="${gift["ImageURL"]}" alt="" width="50px" height="50px"
                    style="margin: 10px;">
                    <p>${gift["Name"]}</p>
                <div class="end">
                    <button class="button-spec" onclick="alert('Not available now, update soon.')">View analytics</button>
                </div>
        </div>
        `,
      document.getElementById("Gift_analytics_display")
    );
    console.log("loaded 1 gift...");
  }
}
function loadGift_ownerList(gift_data) {
  for (const gift of gift_data) {
    elementAdd(
      `
            <div class="gift-tag" gift_index="${gift["ID"]}">
                <img src="${gift["ImageURL"]}" alt="" width="50px" height="50px" style="margin: 10px;">
                <p>${gift["Name"]}</p>
                <p>Amount left: ${gift["Amount"]}</p>
                <div class="end">
                    <button class="button-spec" onclick="CreateExecel_spec(this)">Owner list</button>
                </div>
            </div>
            `,
      document.getElementById("Gift_ownerList_display")
    );
    console.log("loaded 1 gift...");
  }
}
function CreateExcel_client(giftPack, orgPack) {
  var data = []
  data.push(["Gift id", "Gift name", "Gift owner"])
  for (const pack of giftPack) {
    let owner = ""
    let data_ow = "";
    for(const om of orgPack["owner-mail"]){
      if(om["id"] == pack["ID"]){
        for(const ow of om["owner"]){
          data_ow = data_ow + " ," + ow
        }
        break
      }
    }
    data.push([
      `Id: ${pack["ID"]}`,
      pack["Name"],
      `Amount left: ${pack["Amount"]}`,
      `Owner: ` + data_ow,
    ]);
  }
  var workbook = XLSX.utils.book_new(),
    worksheet = XLSX.utils.aoa_to_sheet(data);
  workbook.SheetNames.push("First");
  workbook.Sheets["First"] = worksheet;
  XLSX.writeFile(workbook, "owner-list-Filtz.xlsx");
}
function CreateExcel_specific(gift) {
  var data = [["No.", "Owner list mail of " + gift["Name"]]];
  let index = 1;
  for (const pack of gift["owner-mail"]) {
    data.push([index, pack["mail"]]);
  }
  var workbook = XLSX.utils.book_new(),
    worksheet = XLSX.utils.aoa_to_sheet(data);
  workbook.SheetNames.push("First");
  workbook.Sheets["First"] = worksheet;
  XLSX.writeFile(workbook, `owner-list-${gift["Name"]}-Filtz.xlsx`);
}
function CreateExecel_spec(t) {
  let packer = t.parentNode.parentNode;
  id = packer.getAttribute("gift_index");
  for (const package of gift_pack_global) {
    if (package["ID"] == id) {
      CreateExcel_specific(package);
    }
  }
}
function gift_link_state() {
  for (const packt of document.getElementById("gift_link_gen_gift_list")
    .children) {
    let end_part = packt.getElementsByClassName("end")[0];
    let inp = end_part.getElementsByTagName("input")[0];
    inp.checked = false;
  }
  for (const pack of gift_accept_element) {
    let end_part = pack.getElementsByClassName("end")[0];
    let inp = end_part.getElementsByTagName("input")[0];
    inp.checked = true;
  }
}
function gift_link_gen_add(t) {
  console.log(t.checked);
  if (t.checked) {
    let packer = t.parentNode.parentNode;
    let id = packer.getAttribute("gift_index");
    console.log("Adding:  ");
    console.log(gift_pack_global[Number(id)]);
    gift_gen_accept_list.push(gift_pack_global[Number(id)]);
    gift_accept_element.push(packer);
  } else {
    let packer = t.parentNode.parentNode;
    let id = packer.getAttribute("gift_index");
    console.log("Refresh gift accept list...");
    let newer_pack = [];
    let newer_element_pack = [];
    console.log("Gift gen list:");
    console.log(gift_gen_accept_list);
    for (const current of gift_gen_accept_list) {
      console.log(current);
      console.log("checking: ");
      console.log(current);
      console.log("Compare with: ");
      console.log(gift_pack_global[Number(id)]);
      if (current["ID"] != Number(id)) {
        console.log("Adding: ");
        console.log(current);
        newer_pack.push(current);
      } else {
        console.log("Reject:  ");
        console.log(current);
      }
    }
    for (const current of gift_accept_element) {
      if (packer != current) {
        newer_element_pack.push(current);
      } else {
        console.log("Reject:  ");
        console.log(current);
      }
    }
    console.log(newer_element_pack);
    console.log(newer_pack);
    gift_accept_element = newer_element_pack;
    gift_gen_accept_list = newer_pack;
    t.checked = false;
  }
  gift_link_state();
}

function gift_link_select_all(t) {
  if (t.checked) {
    gift_gen_accept_list = gift_pack_global;
    for (const element of document.getElementById("gift_link_gen_gift_list")
      .children) {
      gift_accept_element.push(element);
    }
  } else {
    gift_gen_accept_list = [];
    gift_accept_element = [];
  }
  gift_link_state();
}
var packageData;
async function setup() {
  let token = params.get("token");
  if (token) {
    let pack = await GetData("", `/get-pack/${token}`);
    console.log(pack);
    if (pack["result"] != "_NOT_FOUND_") {
      let package = pack["result"];
      gift_pack_global = package["giftPack"];
      loadGift_generatorStack(package["giftPack"]);
      loadGift_analytics(package["giftPack"]);
      loadGift_ownerList(package["giftPack"]);
      packageData = package;
      document.getElementById("Excel_export").addEventListener("click", () => {
        CreateExcel_client(package["giftPack"], package);
      });
    } else {
      alert("Not found you gift pack, maybe it deleted or you not authorized.");
      window.open("/home", "_self");
    }
  } else {
    alert("Missing arg: token");
    window.open("/home", "_self");
  }
}
function gen_link() {
  let name = document.getElementById("link_gen_partner_name");
  if (name && gift_gen_accept_list != []) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        let res = JSON.parse(xhr.responseText);
        console.log(res);
        if (res["result"] == "SUCCESS") {
          let link =
            location.protocol +
            "//" +
            location.host +
            "/recieve?token=" +
            res["sub_token"];
          navigator.clipboard.writeText(link);
        }
      }
    };
    console.log(packageData);
    let data = JSON.stringify({
      JSON: {
        giftPack: gift_gen_accept_list,
        to_name: name.value,
        token: params.get("token"),
        Letter: packageData["Letter"],
      },
      Package: "generate_gift_link",
    });
    xhr.send(data);
  }
}
setup();
