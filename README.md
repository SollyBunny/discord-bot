# discord-bot
Version 2 of a cog-based framework for [discord.js](https://discord.js.org/) bots

## Features
* Ping bot for help
* Modulur cog / hook system
* Lots of builtin cogs
* Bootifull embed UI
* Automatic slash command builder
* Automatic help builder
* Can *in fact* cook pancakes (Discord is lying to you)

## Usage
Run `./run.sh` or `./index.js` with `nodejs`

## Config
Config is located in `conf.json`, the structure of a config file can be found in `conf.def.json`

Config is split between files where `main` is for the main file whilst others like `goodmorning` are for cogs

Help for configuration for other cogs can be found at the top of their files

### Main config

| Key | Description |
| --- | --- |
| `token` | The discord token to use (also known as OAuth2 Client Secret) |
| `prefix` | The command prefix to use |
| `admins` | Array of string IDs of admins |
| `activity` | Activity text of the bot |

***This next part is for developers :)***

## Globals
Stuff that you can use everywhere

### Modules
Both `fs` and `http`s are included

### Custom log
When possible use the custom `log` global instead of `console.log`, here are the functions available

| Doc String | Description |
| --- | --- |
| `log(msg: String) => undefined` | Print a msg |
| `log.warn(msg: String) => undefined` | Print a warn msg |
| `log.error(msg: String) => undefined` | Print an error msg |
| `log.fake(...args: *) => String` | Same arguments as `console.log`, outputs the string which would've been printed (includes escape codes) (don't use this) (ever) |
| `log.time() => String` | Return the current time as a string  (internal) |
| `log.raw(color: Integer, msg: String)` | Print a message with a colored timestamp (internal) |

### Discord.js
Discord.js is included as `dc` with added parts

Command parameter types are in `dc.XXX`. You can get a string name for these using `dc.typename[dc.XXX]`.

`dc.PermissionFlagsBits` is aliased to `dc.Permissions`

### Util

| Doc String | Description |
| --- | --- |
| `util.hash(s: String) => hash: Integer` | Hash a string |
| `util.levdis(a: String, b: String) => dis: Integer` | Get the levenhtein distance between two strings |
| `util.levdisclosest(array: Array<String>, target: String, cutoff: Integer) => Array<String>` | Sort a array by `levdis` to a `target` (items further than `cutoff` are removed) |
| `util.levdisuserclosest(array: Array<User / GuildMember>, target: String, cutoff: Integer) => Array<String>` | Sort an array of users by `levdis` to a `target` (items further than `cutoff` are removed) |
| `util.fetch(url: String) => Promise<String>` | A url fetching tool when bultin fetch and http don't work |

### Client
Where all client-related shenanigans are stored, refer to [docs](https://discord.js.org/#/docs/discord.js/main/class/Client) for more info

| Doc String | Description |
| --- | --- |
| `client.cmds` | Dictionary of commands |
| `client.cogs` | Paths of loaded cogs |
| `client.hooks` | All hooks |
| `async client.cmds.serialize() => Array<Command>` | Turn the commands in `client.cmds` into a single object which can be accepted by the discord API |
| `async client.cmds.push(Array<Command>)` | Push commands to the discord API |
| `client.cogs.load(name: String) => Boolean or undefined` | Load a cog, a bool return value represents whether the cog was loaded, an undefined means theres an error preventing the cog from loading (doesn't exist / disabled) (extension name included) |
| `client.cogs.unload(name: String) => undefined` | Unload a cog (extension name included) |
| `client.hooks.add({event: String, priority: Number, func: async function => Boolean}) => undefined` | Add a hook |
| `client.hooks.sub({event: String, priority: Number, func: async function => Boolean}) => undefined` | Sub a hook |

## Cogs
Cogs can be found in `./cogs/*.js`, this is the format of a cog
```js
/* cogname.js
Config
"cogname": {
	"name": <value>
}
Requires
nop: to do something useless
*/

module.exports.disabled = false; // optional

module.exports.desc = "<what I does>"; // optional

module.exports.hooks = { // optional
	...
};

module.exports.cmds = { // optional
	...
};

module.exports.onload = async function() { // optional, runs on cog load
	// Do all initialization of config and other stuff here
};

module.exports.onloadready = async function() { // optional, runs on cog load after bot is initialized
	// Fetch channels, servers, users, etc
};

module.exports.onunload = async function() { // optional, runs on cog unload
	// Cleanup any timers, callbacks, etc
};

module.exports.tick = async function() { // optional, runs every ~10m
	// Save any data, do random tasks, etc
};

```

### Commands
In `module.exports.cmds` you can place any amount of commands in this format
```js
"commandname": {
	"desc": "What I do",
	"func": async function (args) {
		...
	}
}
```
Here are some extra options
`admin`: Whether a user must be an admin (in `conf.main.admins`)
`dm`: Whether this command can be used in DMs or not
`hide`: Whether the calling of this command is hidden
`args`: Array of arguments (look below for more info)
```js
args: [
	// A string
	[dc.TEXT, "name", "Mother's maiden name", true, 5, 20],
	// Either true or false (NOT IMPLEMENTED)
	[dc.BOOL, "violence", "Whether violence should be used", true]
	// A whole number
	[dc.INT, "bet", "How much money to bet", false, 100],
	// A(n) (un)whole number
	[dc.NUMBER, "chance", "ID of the server", false, -3.2, 5],
	// A user in the channel (found first by ID then by a fuzzy search)
	[dc.USER, "user", "User to make immortal", false],
	// A role in the channel (NOT IMPLEMENTED)
	[dc.ROLE, "role", "Role to allow", true],
	// A channel in the server (NOT IMPLEMENTED)
	[dc.CHANNEL, "channel", "Channel to nuke", true],
	// A server the bot is in (NOT IMPLEMENTED)
	[dc.SERVER, "Server", "Gift location", true],
	// Same as text but must be one of these options (fuzzy search used)
	[dc.CHOICE, "animal", "Fav animal", true, ["Cat", "Dog", "Perry the Platypus"]]
	// Text not seperated by spaces (must come last)
	[dc.BIGTEXT, "prompt", "Prompt for AI", true, undefined, 200],
]
// General format:
args: [
	[dc.TYPEOFARG: Enum, "name": String, "Description": String, required: Boolean, min: Number, max: Number]
]
```
In the command function, `this` refers to the (message)[https://discord.js.org/#/docs/discord.js/main/class/Message] or (interaction)[https://discord.js.org/#/docs/discord.js/main/class/CommandInteraction] object with some extras.
These extras are:
`this.author.isNotPerson`: Whether the author is a bot, system or webhook message or just a user
`this.author.isAdmin`: Whether the author is a bot admin (defined in `conf.main.admins`)
`async this.embedreply(Object<opts>) => undefined`: Send an embed reply
`async this.errorreply(msg: String) => undefined`: A shorthand for an error message embedreply
`async this.webhookreply(user: dc.GuildMember, msg: String) => undefined`: Send a message as a different user (sends a message in DMs)

Here is an explanation of the most complicated given function, and as such I'm going to break it down a bit more. Here is the semi-formal syntax for reference
```js
async this.embedreply(Object<{
	msg: String
	title: String
	color: Array<Integer>
	fields: Array<Object<{
		name: String,
		value: String
	}>>
	thumb: Url (String),
	image: Url (String),
	url: Url (String),
}>) => undefined
```
Don't be scared! look at this example instead
```js
await this.embed({
	"title": "Hello World",
	"msg": "I'm a bot!"
});
```
See? ez.

### Hooks

In `module.exports.hooks` you can place any amount of hooks in this format
```js
"commandname": {
	"event": "<event name>",
	"priority": 0,
	"func": async function () {
		...
	}
}
```
Explanation of each param:
`event`: The name of the event to hook to, you can see them (here)[https://discord.js.org/#/docs/discord.js/main/class/Client] -> events
`priority`: The (order) priority of this hook (-10, 0, 10 are normal)
`func`: The function, this is the event object, return `true` to "consume" this event


