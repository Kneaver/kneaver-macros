import * as KNVTrace from 'kneaver-stdjs/trace';
import { invariant, IsMod} from 'kneaver-stdjs/KNVBase';

import ReParse from  "kneaver-nlp/MarkDownParser-ReParse";
import { Parts, ParsePart, IsPart, DumpParts } from  "kneaver-nlp/MarkDownParser-Parts";
import { Flags} from "kneaver-nlp/MarkDownParser-ParseMarkup";
import ParseMarkup from "kneaver-nlp/MarkDownParser-ParseMarkup";
import ParseMarkDown from "kneaver-nlp/MarkDownParser";
import HelperSame from "kneaver-nlp/MarkDownParser-HelperSame";

function getLevel( tag)
{
  invariant( typeof tag == "string");
  switch (tag)
  {
    case "h1": return 1;
    case "h2": return 2;
    case "h3": return 3;
    case "h4": return 4;
    case "h5": return 5;
    case "h6": return 6;
    default: return 10;
  }
}

export function splitBody( body)
{
  if (body === null)
    return {
      body: body,
    };
  const T = new KNVTrace.Proc( "splitBody")
      .D();
  const stack = [];

  const PushChildren = () => { 
    const T = new KNVTrace.Proc( "PushChildren")
      .D();
      
    const Child = {
      body: [],
      children: [],
    };
    stack.push( Child);
    T.log( "level", stack.length);
    T.Exit();
  }
  stack.push( {
    body: [],
    children: [],
  });

  const ret = ReParse( 
    ParseMarkup( body, {} /*, Flags.WikiLinks this breaks if there is HTML */ )
    , ParseMarkDown(), {}
  );
  let val = ret.next().value;
  if ( val && (val.type == Parts.SOB))
  {
    let vv = ret.next();
    if ( !vv.done) 
      val = vv.value
  };
  
  while ( val && (val.type != Parts.EOB))
  {
    T.log("val start outer loop", val);
    // It's assumed we start a child here
    invariant( stack[ stack.length - 1].body.length == 0);
    invariant( stack[ stack.length - 1].children.length == 0);
    stack[ stack.length - 1].body.push( val);
    // don't work, no ol at this stage
    if ((val.type == Parts.MarkdownBlock + Parts.Start) && (val.blocType == "ol"))
    if (val.order)
    {
      invariant( stack[ stack.length - 1].children.length == 0);
      stack[ stack.length - 1].body.push( `Order: ${val.order}\n`);
    }
    // for root block, only Parts.Start should occur, but for children it can be both Start of a sub Block and End of this block
    {
      let vv ;
      while ((vv = ret.next()) && ( !vv.done) && (val = vv.value)
        // while not end of Buffer
        // && ( typeof console.log( "valx", val, vv) == "undefined")
        // && ( typeof val.type == "number") 
        && (val.type != Parts.EOB) 
        // while
        && (
            // not a new block starts
          ( !IsMod( val.type, Parts.MarkdownBlock + Parts.Start))
          || 
            // or a p block, (don't split at paragraphs) (#TODO maybe a setting to split them also)
          ( false && IsMod( val.type, Parts.MarkdownBlock) && (val.blockType == "p")))
      ) 
      {
        T.log("val a", val);
        if ( IsMod(val.type, Parts.MarkdownBlock) && (val.blockType == "p"))
        {
          if ( val.type === Parts.MarkdownBlock + Parts.End)
          {
            invariant( stack[ stack.length - 1].children.length == 0);
            stack[ stack.length - 1].body.push( val);
          }
          else
          if ( val.type === Parts.MarkdownBlock + Parts.Start)
          {
            // no push? lost
            if (stack[ stack.length - 1].body[ 0].blockType == "li")
            if (stack[ stack.length - 1].body.length > 3)
            {
              // last li , did't have the End of li, bug in MarkDownParser
              T.log("pop, forced after 2 p");
              const child = stack.pop();
              stack[ stack.length - 1].body.push( child);
              if (stack[ stack.length - 1].children.length)
              {
                T.log( "container", stack[ stack.length - 1], child);
              }
            }
            invariant( stack[ stack.length - 1].children.length == 0);
            stack[ stack.length - 1].body.push( val);
          }
        }
        else
        if ( IsMod(val.type, Parts.MarkdownBlock + Parts.End) && (val.blockType == "blockquote:md"))
        {
          T.log("pop, last blockquote");
          const child = stack.pop();
          stack[ stack.length - 1].body.push( child);
        }
        else
        {
          // pb don't add to body if you added to children, what about blockquote, li?
          invariant( stack[ stack.length - 1].children.length == 0);
          stack[ stack.length - 1].body.push( val);
        }
      }
    }
    T.log("val b", val);

    if ( val.type == (Parts.EOB))
    {
      T.log("We are all done fine", val);
    }
    else
    if ( val.type == (Parts.MarkdownBlock + Parts.Start))
    {
      // Close prior children
      while ( ( stack.length > 1) && ( getLevel( stack[ stack.length - 1].body[ 0].blockType) >= getLevel( val.blockType)))
      {
        const child = stack.pop();
        T.log("pop", child.body[ 0].blockType);
        if ( [ "ul", "li", "blockquote:md", "linkReference", "code", "pre"].includes( child.body[ 0].blockType))
          stack[ stack.length - 1].body.push( child);
        else
          stack[ stack.length - 1].children.push( child);
      }
      if ( [ "ol", "ul" ].includes( val.blockType ))
      {
        const startVal = val;
        T.log( "startVal", startVal);
        {
          let vv ;
          if ((vv = ret.next()) && ( !vv.done) && (val = vv.value) && (val.type != Parts.EOB) && (val.type != (Parts.MarkdownBlock + Parts.End))) {
            T.log( "val c", val);
            // later invariant( val.type == (Parts.MarkdownBlock + Parts.Start));
            // later invariant( val.blockType == "li");
            PushChildren();
            // Children content will be added on next outer loop
            // !! we had while but could be adding many children
          }
        }
        if (
          (val.type == (Parts.MarkdownBlock + Parts.End))
          && 
          ( val.blockType == startVal.blockType) 
          && 
          ( val.depth == startVal.depth) 
          && 
          ( val.depth == startVal.depth) 
        )
        {
          // all good, move next
          const vv = ret.next();
          if ( vv.done)
            val = null;
          else
            val = vv.value;
          T.log("val d (prior was lost)", val);
        }
        else
        {
          // bad structure
        }
      }
      else
      {
        PushChildren();
        T.log("done, d, will be added to children in next outer loop", val);
      }
    }
    else
    {
      T.log("give up, used in next outer loop", val);
    }
  }
  T.log( "stack", stack.length);
  while ( stack.length > 1)
  {
    const child = stack.pop();
    T.log("pop", child.body[ 0].blockType);
    if ( [ "ul", "li", "blockquote:md", "linkReference"].includes( child.body[ 0].blockType))
      stack[ stack.length - 1].body.push( child);
    else
      stack[ stack.length - 1].children.push( child);
  }
  // invariant( stack.length == 1);
  return T.ReturnV( stack[ 0], "");
}
