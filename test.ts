import * as fs from 'fs';
import { splitBody} from './src/js/SPlitBody';
import * as KNVTrace from 'kneaver-stdjs/trace';

import( './src/js/trace.json').then( obj => {
  KNVTrace.On( obj)
  KNVTrace.setTabslimit( 100);
  main();
});

import HelperSame from "kneaver-nlp/MarkDownParser-HelperSame";
import { PatURLFull } from "kneaver-nlp/MarkDownParser-ParseMarkup";

export function main()
{
  console.log( PatURLFull.exec( "   https://www.pmi.org/learning/library/lessons-learned-sharing-knowledge-8189   ddd"));
  const nf = '/tmp/test2.md';
  const buffer = fs.readFileSync( nf, 'utf8');
  const ret = splitBody( buffer);
  fs.writeFileSync( nf.replace( '.md', '.json'), JSON.stringify( ret, null, 2));
  function dump( cell, tabs = "")
  {
    let body = cell.body.map( elt => elt.type?HelperSame( elt):dump( elt, tabs + "  ")).join( "");
    cell.children.forEach( child => {
      body += dump( child, tabs + "  ")
      body += "\n**************\n";
    });
    return body.replace( /&quot;/g,`"`); // .replace( /\n/g, "\n"+tabs);
  }
  fs.writeFileSync( nf.replace( '.md', '.md.md'), dump( ret));
};

