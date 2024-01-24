/* numbat.js
Config:
"numbat": {
	"maxseconds": <max time that numbat is allowed to take>
}
*/

function getMaxseconds() {
	return conf.numbat.maxseconds || 1;
}

let numbatRaw;
let spawn;
let exec;
try {
	exec = require("get-pty-output").exec;
} catch (e) {
	log.error(`Cannot import get-pty-output, ${e}`);
	spawn = require("child_process").spawn;
}

if (exec) {
	numbatRaw = calc => {
		return new Promise(resolve => {
			tempFile = `temp/${Math.random()}${Date.now()}.nbt`;
			fs.writeFileSync(tempFile, calc, { flag: "w" });
			const errors = [];
			function done(output, error) {
				if (output === undefined) return;
				output = output.trim();
				if (output.length === 0 && error.length === 0) {
					errors.push("No output");
					output = undefined;
				}
				resolve({ errors, error, output });
				output = undefined;
			}
			exec(`numbat ${tempFile}`, {
				timeout: getMaxseconds(),
				purify: true,
				// TODO use manual data yoinking to collect data even on error
			}).catch(error => {
				// console.log("hello", error, "ORANGE", error.toString().length, error.toString(), "del", JSON.stringify(error), "end");
				error = error.toString();
				if (error.indexOf(tempFile) === -1) {
					errors.push(error);
				} else {
					done("", error);
				}
			}).then(output => {
				if (!output) return;
				if (output.truncated) errors.push(`Took longer than ${getMaxseconds()}s`);
				done(output.output, "");
			}).finally(() => {
				fs.rmSync(tempFile, { force: true });
			});
		});
	};
} else {
	numbatRaw = calc => {
		return new Promise((resolve, reject) => {
			const proc = spawn("numbat", [], {
				encoding: "utf8",
			});
			let output = "";
			let error = "";
			proc.stdout.on("data", data => { output += data; });
			proc.stderr.on("data", data => { error += data; });
			proc.stdin.write(calc);
			proc.stdin.end();
			const errors = [];
			function done() {
				if (output === undefined) return;
				output = output.trim();
				if (output.length === 0 && error.length === 0) {
					errors.push("No output");
					output = undefined;
				}
				resolve({ errors, error, output });
				output = undefined;
			}
			const timeout = setTimeout(() => {
				proc.kill("SIGKILL");
				errors.push(`Took longer than ${getMaxseconds()}s`);
				done();
			}, getMaxseconds() * 1000);
			proc.on("exit", code => {
				clearTimeout(timeout);
				done();
			});
			proc.on("error", e => {
				clearTimeout(timeout);
				proc.kill("SIGKILL");
				errors.push(e);
				done();
			});
		});
	};
}

const ansiiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
const numbatAns = {};
let numbatAnsSize = 0;
async function numbat(owner, input) {
	if (input.length > 500) {
		return `**Error**: Too long ${input.length}/500`;
	}
	input = input.replace(/(^=*(```)*=*|```$)/gs, "");
	if (numbatAns[owner]) input = `${numbatAns[owner].value}\n${input}`;
	const out = await numbatRaw(input);
	if (out.output) {
		const lastLine = out.output
			.slice(out.output.lastIndexOf("\n") + 1)
			.replace(ansiiRegex, "")
		;
		if (lastLine.length < 500) {
			if (!numbatAns[owner]) {
				if (numbatAnsSize < 50) {
					numbatAnsSize += 1;
				} else { // Delete the oldest
					const entries = Object.entries(numbatAns);
					let oldest = entries[0];
					for (let i = 1; i < entries.length; ++i) {
						const entry = entries[i];
						if (entry[1].time < oldest[1].time)
							oldest = entry;
					}
					delete numbatAns[oldest[0]];
				}
			}
			numbatAns[owner] = {
				time: Date.now(),
				value: lastLine,
			};
		}
	}
	let text = "";
	if (out.errors.length > 0) {
		text += `${out.errors.map(error => `**Error**: ${error}`).join("\n")}`;
		if (out.output) text += "\n";
	}
	if (out.output) {
		text += `\`\`\`ansi\n${out.output}\n\`\`\``
		if (out.error) text += "\n";
	};
	if (out.error) {
		text += `\`\`\`ansi\n${out.error}\n\`\`\``
	}
	return text;
}

module.exports.desc = "Use numbat to perform a calculation, see https://numbat.dev/doc/ for info";

module.exports.cmds = {
	"numbat": {
		desc: "Use numbat to perform a calculation, see https://numbat.dev/doc/ for info",
		args: [
			[dc.BIGTEXT, "calculation", `What to calculate, can be multiline`, true, undefined, 100]
		],
		func: async function (args) {
			this.reply(await numbat(this.author.id, args[0]));
		}
	}
};

module.exports.hooks = [
	{
		event: "messageCreate",
		priority: 20,
		func: async function() {
			if (this.author.isNotPerson) return;
			if (!this.content.startsWith("=") && !this.content.startsWith("```=")) {
				return;
			}
			this.reply(await numbat(this.author.id, this.content));
		}
	}
];