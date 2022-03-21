// variables
var value = 0.89;
var amount;
var quarters = 0;
var dimes = 0;
var nickles = 0;
var pennies = 0;

// set amount to pennies (x100)
amount = parseInt(value * 100);

// convert quarters
quarters = parseInt(amount /25);
amount = amount % 25;

// convert dimes
dimes = parseInt(amount / 10);
amount = amount % 10;

// convert nickles
nickles = parseInt(amount / 5);
amount = amount % 5;

// convert pennies
pennies = parseInt(amount)

// console.log
console.log("the values being converted is $" + value)
console.log("Quarters:" + quarters)
console.log("Dimes:" + dimes)
console.log("Nickles:" + nickles)
console.log("Pennies:" + pennies)