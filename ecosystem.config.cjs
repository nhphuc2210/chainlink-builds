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
    
    // Cloudflare Tunnel
    {
      name: 'cloudflare-tunnel',
      namespace: 'chainlink-build',
      script: '/usr/local/bin/cloudflared',
      args: 'tunnel --no-autoupdate run chainlink-build',
      cwd: '/home/jupyter',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        HOME: '/home/jupyter'
      },
      error_file: './logs/cloudflare-tunnel-error.log',
      out_file: './logs/cloudflare-tunnel-out.log',
      log_file: './logs/cloudflare-tunnel-combined.log',
      time: true,
      merge_logs: true,
    }
  ]
};

