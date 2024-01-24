const { readFileSync } = require("fs");
const { promisify } = require("util");
const delay = promisify(setTimeout);
const express = require("express");

const telnetlib = require("telnetlib");

// Telnet Server
const server = telnetlib.createServer({}, (c) => {
	c.on("negotiated", async () => {
		try {
			c.write("\x1b[2J\x1b[H");
			const LINES_PER_FRAME = 14;
			const DELAY = 67;
			const filmData = readFileSync("starwars.txt")
				.toString("utf8")
				.split("\n");
			c.write("\n".repeat(LINES_PER_FRAME));
			for (let i = 0; i < filmData.length; i += LINES_PER_FRAME) {
				c.write("\n");
				c.write(
					`\x1b[${LINES_PER_FRAME}A\x1b[J${filmData
						.slice(i + 1, i + LINES_PER_FRAME)
						.join("\n")}`
				);
				await delay(parseInt(filmData[i], 10) * DELAY);
			}
			c.write("\n");
			c.end();
		} catch (err) {
			c.write(`\n${err.message}\n`);
			c.end();
		}
	});

	c.on("data", (d) => {
		if (d.toString().trim().toLowerCase() == "end") {
			c.write("\x1b[2J\x1b[H");
			c.write("\n");
			c.end();
		}
	});
});

server.listen(23);

// Simple HTTP server for checking Telnet
const httpApp = express();
httpApp.get("*", (req, res) => {
	res.sendStatus(200);
});
httpApp.listen(5893);
