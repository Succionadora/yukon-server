// config/configLoader.js

const fs = require("fs")
const path = require("path")

function loadConfig() {
	const configPath = path.join(__dirname, "config.json")
	let configContent = fs.readFileSync(configPath, "utf8")

	// Replace placeholders with environment variables
	configContent = configContent.replace(/\$\{(\w+)\}/g, (match, p1) => {
		const envVar = process.env[p1]
		if (envVar === undefined) {
			throw new Error(`Environment variable ${p1} is not defined`)
		}
		return envVar
	})

	// Parse the JSON content
	const config = JSON.parse(configContent)

	// Ensure boolean and number values are correctly parsed
	config.socketio.https = config.socketio.https === "true"

	return config
}

module.exports = loadConfig()
