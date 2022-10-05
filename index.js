const express = require("express");
const app = express();
const cors = require("cors");
const User = require("./models/user");
const mongoose = require("mongoose");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", express.urlencoded({ extended: true }), async (req, res) => {
	const u = await User.create({ username: req.body.username });
	return res.json(u);
});

app.get("/api/users", async (req, res) => {
	const u = await User.find().select("username");
	res.json(u);
});

app.post("/api/users/:id/exercises", express.urlencoded({ extended: true }), async (req, res) => {
	const { description, duration, date } = req.body;
	const u = await User.findById(req.params.id);
	const exercice = { description, duration: Number(duration), date: new Date(date || Date.now()).toDateString() };
	u.log.push(exercice);
	const t = await u.save();
	return res.json({ ...exercice, username: u.username, _id: u.id });
});

app.get("/api/users/:id/logs", async (req, res) => {
	const opts = {};
	const { from, to, limit } = req.query;
	console.log(req.query);
	if (from) opts.from = new Date(from);
	if (to) opts.to = new Date(to);
	if (limit) opts.limit = Number(limit);
	const u = await User.findById(req.params.id);
	const trt = { username: u.username, _id: u.id };
	u.log.filter((l) => {
		const states = [];
		if (opts.from) states.push(new Date(l.date) >= opts.from);
		if (opts.to) states.push(opts.to >= l.date);
		return states.indexOf(false) === -1;
	});
	trt.log = u.log.map((l) => {
		if (from && !isNaN(Date.parse(from))) opts;
		return { description: l.description, duration: l.duration, date: new Date(l.date).toDateString() };
	});
	console.log("opts", opts);
	if (typeof opts.limit === "number") trt.log = trt.log.slice(0, opts.limit);
	trt.count = u.log.length;
	return res.json(trt);
});
//"mongodb+srv://nadia:WEmNfKPjMmkTgDVm@cluster0.1ozz8.mongodb.net/exercices-fcc?retryWrites=true&w=majority"
mongoose
	.connect("mongodb://localhost:27017/exercice-fcc")
	.then(() => console.log("DB CONNECTED"))
	.catch((err) => {
		throw err;
	});

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log("Your app is listening on port " + listener.address().port);
});
