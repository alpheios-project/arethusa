annotationApp.service('comment', function(state, configurator) {
  this.conf = configurator.conf_for('comment');
  this.comments = [
    {
      "id": "1",
      "comment": "Marcus was someone."
    },
    {
      "id": "2",
      "comment": "Nothing to see here."
    },
    {
      "id": "3",
      "comment": "-"
    },
    {
      "id": "4",
      "comment": "-"
    },
  ];

  this.currentComment = function() {
    return this.comments[state.selectedToken.id - 1];
  };

  this.template = this.conf.template;
});
