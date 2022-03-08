
    var attributes  =  "Jose;21;21 + 0.5;0.5 - 21" ;

    var parts_array = attributes.split(';');

for(let part of parts_array){
        let errs = isNonNegInt(part, true);
        console.log(`part ${part} isNonNegInt ${errs,join(' ')}`);
}

function isNonNegInt(q, returnErrors=false){
    errors = []; // assume no errors at first
if(Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
if(q < 0) errors.push('Negative value!'); // Check if it is non-negative
if(parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer

return (returnErrors ? errors : (errors.length == 0));
}
function checkIt(item, index){
    console.log(`part ${index} is ${(isNonNegInt(item)?'a':'not a')} quantity`);
}