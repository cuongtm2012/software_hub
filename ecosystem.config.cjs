module.exports = {
    apps: [
        {
            name: 'software-hub-server',
            script: './dist/server/index.js',
            instances: 2,
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            max_memory_restart: '500M',
            error_file: '/var/log/software-hub-error.log',
            out_file: '/var/log/software-hub-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            autorestart: true,
            watch: false,
            max_restarts: 10,
            min_uptime: '10s'
        },
        {
            name: 'email-service',
            script: './services/email-service/index.js',
            instances: 1,
            env: {
                NODE_ENV: 'production',
                PORT: 3001
            },
            max_memory_restart: '300M',
            error_file: '/var/log/email-service-error.log',
            out_file: '/var/log/email-service-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            autorestart: true,
            watch: false
        },
        {
            name: 'chat-service',
            script: './services/chat-service/index.js',
            instances: 1,
            env: {
                NODE_ENV: 'production',
                PORT: 3002
            },
            max_memory_restart: '300M',
            error_file: '/var/log/chat-service-error.log',
            out_file: '/var/log/chat-service-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            autorestart: true,
            watch: false
        },
        {
            name: 'notification-service',
            script: './services/notification-service/index.js',
            instances: 1,
            env: {
                NODE_ENV: 'production',
                PORT: 3003
            },
            max_memory_restart: '300M',
            error_file: '/var/log/notification-service-error.log',
            out_file: '/var/log/notification-service-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            autorestart: true,
            watch: false
        }
    ],

    deploy: {
        production: {
            user: 'root',
            host: '95.111.253.111',
            ref: 'origin/main',
            repo: 'git@github.com:yourusername/software-hub.git',
            path: '/var/www/software-hub',
            'post-deploy': 'npm ci --omit=dev && pm2 reload ecosystem.config.cjs --env production && pm2 save'
        }
    }
};
