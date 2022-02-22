require("./products_data.js");

var num_products = 5;
var count = 1;

while(count <= num_products) {

    console.log(`${count}. ${eval('name' + count)}`);
    count++;
    if(count > 0.25*num_products && count<0.75*num_products){
        console.log(`Item #${count} is sold out!`);
        continue;
    }
}
console.log("That's all we have!")

