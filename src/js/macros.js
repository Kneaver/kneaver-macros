
const { IsSet, IsNull, invariant } = require('kneaver-stdjs/KNVBase');
const KNVTrace = require('kneaver-stdjs/trace');

const { splitBody } = require('kneaver-ui-sdk');

// using redux-thunk
export function SplitItem (id, Actions) {
  const T = new KNVTrace.Proc("SplitItem")
    .TVAR("Actions", Actions)
    .D();

  return T.Return( (dispatch, getState) => {
    const item = getState().items.findById(id);
    const Chunked = splitBody(item.body);
    // KNVTrace.log("SplitItem", Chunked);
    const data = {
      body: Chunked.body,
    };
    function CreateLink(data, Body) {
      if (!data.children)
        data.children = [];
      const child = {
        Body: Body,
      }
      data.children.push(child)
      return child;
    }
    function AddLinks(data, Chunk) {
      if (Chunk.children)
        Chunk.children.forEach(child => {
          AddLinks(CreateLink(data, child.body), child);
        })
    }
    const PointTypeId = getState().items.Types.PointTypeId;
    const RelatedLinkTypeId = getState().items.LinkTypes.relatedId;
    AddLinks(data, Chunked);
    BuildTree = (data, id) => data.children && Promise.all(data.children.map(
        child => dispatch(Actions.CreateItem({ body: child.body, typeId: PointTypeId, linkTypeId: RelatedLinkTypeId, sourceId: id }))
          .then(ret => BuildTree(child, ret.value.result))));
    return BuildTree(data, id)
    // .then(() => dispatch( Action.UpdateItem( id, { Body: data.body})));
  })  // end object constructor
}  // end function block

/*
    // We can dispatch both plain object actions and other thunks,
    // which lets us compose the asynchronous actions in a single flow.

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

