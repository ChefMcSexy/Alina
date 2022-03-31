const http = require("http");

let args = process.argv.slice(2);

const options = {
  "method": "GET",
  "hostname": args[0],
  "port": null,
  "path": "/",
  "headers": {
    "host": args[1]
  }
};

const req = http.request(options, function (res) {
  const chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.end();