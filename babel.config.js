/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isProd = String(process.env.NODE_ENV) === 'production'
const isTest = String(process.env.NODE_ENV) === 'test'

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: isTest ? 'commonjs' : false,
        targets: {
          node: '12',
        },
      },
    ],
    // removes typescript annotations, without checking them
    '@babel/preset-typescript',
    // that's for jsx
    '@babel/preset-react',
  ],
  plugins: [
    [
      'babel-plugin-module-resolver',
      {
        alias: {
          react: './node_modules/react',
          'react-dom': './node_modules/react-dom',
        },
      },
    ],
  ],
}
