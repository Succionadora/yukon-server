const config = require('./config/configLoader.js')


let apps = Object.keys(config.worlds).map(world => {
    return {
        name: world,
        script: './dist/World.js',
        args: world
    }
})

module.exports = {
    apps: apps
}
