#!/usr/bin/env node

const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const dir = fs.readdirSync("./data/").filter(i => i.endsWith(".txt"));
const data = dir.map(i => fs.readFileSync(`./data/${i}`)).join("\n").split("\n");

rl.question("Name: ", name => { 

	const outnamed = data.filter(i => i.startsWith(name));
	const out = outnamed.map(i => i.slice(name.length + 2));

	const filename = `./${name}.out`;
	fs.writeFileSync(filename, out.join("\n"));
	console.log(`Written to ${filename}`);

	rl.close();

});