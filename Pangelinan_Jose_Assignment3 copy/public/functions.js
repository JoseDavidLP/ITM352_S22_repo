// This function asks the server for a "service" and converts the response to text. 
function loadJSON(service, callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('POST', service, false);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 };

// This function makes a navigation bar from a products_data object

function nav_bar(this_product_key, products_data) {
    // This makes a navigation bar to other product pages
    for (let products_key in products_data) {
        if (products_key == this_product_key) continue;
        document.write(`<a href='./display_products.html?products_key=${products_key}'>${products_key}<a>&nbsp&nbsp&nbsp;`);
    }
};
// code from https://www.w3schools.com/js/js_cookies.asp 
//from meeting with prof 
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  const search = () =>{
    const searchbox = document.getElementById("search_textbox").value.toLowerCase();
    const storeitems = document.getElementById("products");
    const products = document.querySelectorAll(".item")
    const pname = document.getElementsByTagName("h2")
    const pdesc = document.getElementsByTagName("p")
    for (var i = 0; i < pname.length; i++) {
      let match = products[i].getElementsByTagName("h2", "p")[0];
      
      if (match) {
        let textvalue = match.textContent || match.innerHTML
        if (textvalue.toLowerCase().indexOf(searchbox) > -1) {
          products[i].style.display = "";

        }else{
          products[i].style.display = "none";
        }
        
      }
    }
}