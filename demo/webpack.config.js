const path = require('path')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                use: {loader: 'worker-loader'}
            },
            {
                test: /\.(asset)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[contenthash].wasm'
                        }
                    },
                ],
            }
        ]
    }
}
