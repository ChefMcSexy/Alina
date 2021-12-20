const TORFetch = require('torfetch');

let args = process.argv.slice(2);

let out = ""
let plus =""

var options = {
    method:"get"
}
function max(){
    setTimeout(function(){
        console.log('timeout')
        process.exit(0)
    }, 60000)
}
max()

var request = new TORFetch(args[0], options);

request.on("headers", function(headers){
    let contenttype = headers['content-type'];
    if(contenttype != args[1]){
        plus = "__noctype__"
    }
});

request.on("data", function(chunk){
    let data = new TextDecoder("utf-8").decode(chunk);
    out+=data
});

request.on("end", function(){
    console.log(out+plus)
    process.exit(0)
});

