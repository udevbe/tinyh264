module.exports = {
  type: 'web-module',
  npm: {
    esModules: true,
    umd: false
  },
  babel: {
    env: {
      targets: {
        browsers: 'last 2 versions'
      },
      modules: false
    }
  },
  webpack: {
    extra: {
      module: {
        rules: [
          {
            test: /\.wasm.asset/i,
            use: [
              {
                loader: 'file-loader',
              },
            ],
          },
        ],
      },
    }
  }
}
