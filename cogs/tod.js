/* tod.js */

let truthdata, daredata, wouldyouratherdata;

function truth() { return truthdata[Math.floor(Math.random() * truthdata.length)]; }
function dare() { return daredata[Math.floor(Math.random() * daredata.length)]; }
function wouldyourather() { return wouldyouratherdata[Math.floor(Math.random() * wouldyouratherdata.length)].split("|"); }

module.exports.desc = "Truth or Dare";

module.exports.cmds = {
	"tod": {
		desc: "Truth or dare?",
		func: async function () {
			this.embedreply({
				title: "Truth or dare?",
				color: [255, 255, 0],
				msg: Math.random() > 0.5 ? truth() : dare()
			});
		}
	},
	"truth": {
		desc: "Get a truth",
		func: async function () {
			this.embedreply({
				title: "Truth or dare?",
				color: [0, 255, 0],
				msg: truth()
			});
		}
	},
	"dare": {
		desc: "Get a dare",
		func: async function () {
			this.embedreply({
				title: "Truth or dare?",
				color: [255, 0, 0],
				msg: dare()
			});
		}
	}
};

module.exports.onload = async function() {
	
	truthdata = fs.readFileSync("./data/truth.txt").toString().split("\n");
	daredata = fs.readFileSync("./data/dare.txt").toString().split("\n");
	wouldyouratherdata = fs.readFileSync("./data/wouldyourather.txt").toString().split("\n");

};