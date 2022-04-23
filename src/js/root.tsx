import React, { useEffect } from 'react';

import * as KNVTrace from 'kneaver-stdjs/trace';

function Fct()
{
  const T = new KNVTrace.Proc("Fct").D();
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
    actions: [
      Fct,
    ],
  }
}
