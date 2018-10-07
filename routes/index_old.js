const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  const me = {name: "Chris", age: "old", cool: true}
  //res.send('Hey! It works!');
	//res.json(me);
  //res.send(req.query);
	res.render("hello", {
		title: "Hello",
		name: "Chris",
		dog: "Blamo"
	});
});

router.get("/reverse/:name", (req,res) => {
	const reverse = [...req.params.name].reverse().join("");
	res.send(reverse);
});

module.exports = router;
