module.exports = {
  apps: [
    // Backend API Server
    {
      name: 'reward-preview',
      namespace: 'chainlink-build',
      script: 'backend/src/start.cjs',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 7000,
        HOST: '0.0.0.0'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 7000,
        HOST: '0.0.0.0'
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      merge_logs: true,
    },
  ]
};

