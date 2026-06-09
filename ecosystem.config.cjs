module.exports = {
  apps: [
    {
      name: "software-hub-server",
      script: "./dist/server/index.js",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      max_memory_restart: "500M",
      error_file: "/var/log/software-hub-error.log",
      out_file: "/var/log/software-hub-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],

  deploy: {
    production: {
      user: "root",
      host: "95.111.253.111",
      ref: "origin/main",
      repo: "git@github.com:cuongtm2012/software_hub.git",
      path: "/var/www/software-hub",
      "post-deploy":
        "npm ci --omit=dev && pm2 reload ecosystem.config.cjs --env production && pm2 save",
    },
  },
};
