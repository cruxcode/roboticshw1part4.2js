const express = require("express");
const app = express();
const port = parseInt(process.env.PORT) || 5000;
app.use(express.static("./"));
app.get("/", (req, res)=>{
	res.sendFile("index.html");
});
app.listen(port, ()=>{
	console.log("app listening on port", port);
});