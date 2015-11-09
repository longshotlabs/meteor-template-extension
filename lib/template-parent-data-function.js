// Allow to specify a function to test parent data for at various
// levels, instead of specifying a fixed number of levels to traverse.
var originalParentData = Blaze._parentData;
Blaze._parentData = function (height, _functionWrapped) {
  // If height is not a function, simply call original implementation.
  if (typeof height !== 'function') return originalParentData(height, _functionWrapped);

  var theWith = Blaze.getView('with');
  var test = () => { return height(theWith.dataVar.get()); };
  while (theWith) {
    if (Tracker.nonreactive(test)) break;
    theWith = Blaze.getView(theWith, 'with');
  }

  // _functionWrapped is internal and will not be
  // specified with non numeric height, so we ignore it.
  if (!theWith) return null;
  // This registers a Tracker dependency.
  return theWith.dataVar.get();
};

Template.parentData = Blaze._parentData;
