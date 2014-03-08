// template data, if any, is available in 'this'
Template.selector.events({
  'click #graph-button' : function () {
    if (typeof console !== 'undefined')
      console.log("You clicked the Graph button!");
  }, 
  'click #excel-button' : function () {
    if (typeof console !== 'undefined')
      console.log("You clicked the Excel button!");
  }, 
  'click #access-button' : function () {
    if (typeof console !== 'undefined')
      console.log("You clicked the Access button!");
  }
});