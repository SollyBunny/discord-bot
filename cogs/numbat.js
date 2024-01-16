
let numbat;
let spawn;
let exec;
try {
	exec = require("get-pty-output").exec;
} catch (e) {
	log.error(`Cannot import get-pty-output, ${e}`);
	spawn = require("child_process").spawn;
}

if (exec) {
	numbat = calc => {
		return new Promise(resolve => {
			tempFile = `temp/${Math.random()}${Date.now()}.nbt`;
			fs.writeFileSync(tempFile, calc, { flag: "w" });
			exec(`numbat ${tempFile}`, {
				timeout: 1,
				idleTimeout: 1,
				purify: true
			}).catch(e => {
				resolve(`Error: ${e}\n`);
			}).then(output => {
				if (!output) return;
				if (output.truncated) {
					resolve(`Ran out of time\n${output.output.trim()}`);
				} else {
					resolve(output.output.trim());
				}
			}).finally(() => {
				fs.rmSync(tempFile, { force: true });
			});
		});
	};
} else {
	numbat = calc => {
		return new Promise((resolve, reject) => {
			const proc = spawn("numbat", [], {
				encoding: "utf8",
			} );
			let output = "";
			function onData(data) { output += data; }
			proc.stdout.on("data", onData);
			proc.stderr.on("data", onData);
			proc.stdin.write(calc);
			proc.stdin.end();
			const timeout = setTimeout(() => {
				proc.kill("SIGKILL");
				resolve(`Ran out of time\n${output.trim()}`);
			}, 5000);
			proc.on("exit", (code) => {
				clearTimeout(timeout);
				resolve(output.trim());
			});
			proc.on("error", (err) => {
				clearTimeout(timeout);
				proc.kill("SIGKILL");
				resolve(`Error: ${err}\n${output.trim()}`);
			});
		});
	};
}

module.exports.desc = "Use numbat to perform a calculation, see https://numbat.dev/doc/ for info";

module.exports.cmds = {
	"numbat": {
		desc: "Use numbat to perform a calculation, see https://numbat.dev/doc/ for info",
		args: [
			[dc.BIGTEXT, "calculation", `What to calculate, can be multiline`, true, undefined, 100]
		],
		func: async function (args) {
			const content = args[0].replace(/(^=*(```)*=*|```$)/gs, "");
			const output = await numbat(content);
			this.reply(output ? `\`\`\`ansi\n${output}\n\`\`\`` : "No output");
			// this.embedreply({
			// 	title: "numbat",
			// 	msg: output ? `\`\`\`ansi\n${output}\n\`\`\`` : "No output"
			// });
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
			const content = this.content.replace(/(^=*(```)*=*|```$)/gs, "");
			if (content.length > 100) return;
			const output = await numbat(content);
			this.reply(output ? `\`\`\`ansi\n${output}\n\`\`\`` : "No output");
			// this.embedreply({
			// 	title: "numbat",
			// 	msg: output ? `\`\`\`ansi\n${output}\n\`\`\`` : "No output"
			// });
		}
	}
];