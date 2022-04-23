import React, { useEffect } from 'react';

import * as KNVTrace from 'kneaver-stdjs/trace';

import { SplitItem } from "./macros";
import HTMLToMD from "kneaver-nlp/HTMLtoMD";

function HTMLToMDAction( id, api)
{
  const T = new KNVTrace.Proc("HTMLToMDAction")
    .TVAR("id", id)
    .D();

  const item = api.findById( id);
  if ( item)
  {
    const bufferOut = HTMLToMD( item.body, id);
    T.log( "bufferOut", bufferOut);
  }

  T.Exit();
}


export default function factory()
{
  import( './trace.json').then( obj => {
    KNVTrace.On( obj)
  });

  const T = new KNVTrace.Proc("macros/root/factory").D();

  T.Exit();
  return {
    itemOptions : [
      { label: "Split in subitems", action: SplitItem },
      { label: "HTML to Markdown", action: HTMLToMDAction },
    ],
    actions: [
      { name: "SplitItem", code: SplitItem, len : 1 },
      { name: "HTMLToMDAction", code: HTMLToMDAction, len : 1 },
    ],
  }
}
