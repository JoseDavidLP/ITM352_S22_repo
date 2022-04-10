prices = [5.95, 3.00, 12.50];
total_price = 0;
tax_rate = 0.08;    // 8% tax 
for (price of prices) {
    total_price += price + price * tax_rate;
}
console.log(`Total price (with tax): ${total_price.toFixed(2)}`); 
