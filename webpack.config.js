const HtmlWebpackPlugin = require( 'html-webpack-plugin');
const ModuleFederationPlugin = require( "webpack/lib/container/ModuleFederationPlugin.js");
const { rulesFct, normalizePort, aliases, MakeSSR, devServer, defaultFederation, getSharedFederation } = require( 'kneaver-dot/webpack.config.base.js');
const { deps: dependencies} = require( "./package.json");
const sass = null;
const rules = rulesFct( sass);

const port = 3011;
const path = require( 'path');
module.exports = ( env, argv) => {

  return {
    // entry will be the output name
    entry: './src/js/index',
    output: {
      publicPath: 'auto',
    },
    devServer: devServer( __dirname, port),
    plugins: [
      new ModuleFederationPlugin({
        name: "kneavermacros",
        ...defaultFederation,
        shared: { 
          ...getSharedFederation([ "kneaver-ui-sdk", "kneaver-react-helpers", "react"]),
        },
      }),
    ],
    resolve:
    {
      // from graphql on webpack 4
      mainFields: ['browser', 'main', 'module'],
      // enforceExtension: true,
      // used * to avoid empty string, no enforceExtensions does this
      extensions: [ '.js', '.mjs', '.jsx', '.es6', '.json', '.ts', '.tsx'],
      alias: {
        "@kneaver": "../../..",
        ...aliases.react,
      }
    },
    module: {
      rules:
      [
        // Javascript
        rules.tsx,
        // for graphql
        rules.mjs,
        rules.css,
        rules.scss,
        rules.json,
        rules.woff,
        rules.ttf,
        rules.svg,
      ]
    }
  }
}