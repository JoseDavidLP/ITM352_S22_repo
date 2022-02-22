require("./products_data.js");

var num_products = 5;

for (product_index = 1; eval("typeof name"+product_index) !='undefined'; product_index++) {
    
    console.log(`${product_index}, ${eval('name' + product_index)}`);

}

console.log("That's all we have!")