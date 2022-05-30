
const { IsSet, IsNull, invariant } = require('kneaver-stdjs/KNVBase');
const KNVTrace = require('kneaver-stdjs/trace');
import HelperSame from "kneaver-nlp/MarkDownParser-HelperSame";

const { splitBody } = require('./SplitBody');

// using redux-thunk
export function SplitItem( id, API, Schema) {
  const T = new KNVTrace.Proc("SplitItem")
    .TVAR( "id", id)
    .TVAR( "API", API)
    .D();


  const item = API.findById(id);
  const Chunked = splitBody( item.body);
  T.log("SplitItem", Chunked);
  function toMd( bodyIn)
  {
    let body = bodyIn.map( elt => elt.type?HelperSame( elt): toMd( elt.body)).join( "");
    return body.replace( /&quot;/g,`"`); // .replace( /\n/g, "\n"+tabs);
  }

  const PointTypeId = Schema.Types.PointTypeId;
  const RelatedLinkTypeId = Schema.LinkTypes.relatedId;
  function BuildTree( data, id) 
  {
    T.log( 'BuildTree', id);
    return data.children && Promise.all( data.children.map(
      child => API.CreateItemAndLink({ body: toMd( child.body), typeId: PointTypeId, linkTypeId: RelatedLinkTypeId, sourceId: id })
        .then(ret => BuildTree( child, ret.value.result))
      )
    );
  };

  return T.Return(BuildTree( Chunked, id).then(() => API.UpdateItem( id, { body: toMd( data.body)})));
}  // end function block

/*
    // We can dispatch both plain object API and other thunks,
    // which lets us compose the asynchronous API in a single flow.

    return dispatch(makeASandwichWithSecretSauce('My Grandma'))
      .then(() =>
        Promise.all([
          dispatch(makeASandwichWithSecretSauce('Me')),
          dispatch(makeASandwichWithSecretSauce('My wife')),
        ]),
      )
      .then(() => dispatch(makeASandwichWithSecretSauce('Our kids')))
      .then(() =>
        dispatch(
          getState().myMoney > 42
            ? withdrawMoney(42)
            : apologize('Me', 'The Sandwich Shop'),
        ),
      );
      */

