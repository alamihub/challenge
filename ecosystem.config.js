/**
 * PM2 config for deployement & postdeployemnt management
 */
module.exports = {
    apps : [{
      name: "app",
      script: '/var/gadmin/server.js',
      watch: false,
      // ignore_watch : ["node_modules", "data", "public"],
      env: {
        NODE_ENV: "production",
        PORT: "5500"
      }
    }],
  
  };