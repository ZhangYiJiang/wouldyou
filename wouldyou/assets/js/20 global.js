Object.values = Object.values || function (obj) {
  var val = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
        val.push(obj[key]);
    }
  }
  return val;
};

$.ajaxSetup({
  headers: {
    'X-CSRFToken': $('meta[name="csrf_token"]').attr('content'),
  }
});

// Block UI widget
(function ($) {
  // Save a copy of the block UI element for future use
  var block = $('#block-ui')
    .clone()
    .removeAttr('id')
    .removeClass('hidden')
    .hide();

  var widget = function(parent, show) {
    this.block = block.clone();

    this.parent = $(parent);
    this.parent.append(this.block);

    this.show();
  };

  widget.prototype = {
    hide: function (completed) {
      this.block.fadeOut(300, function () {
        $(this).remove();
      })
    },

    show: function (completed) {
      this.block.fadeIn(300);
    }, 
  };

  window.BlockUi = widget;
})(jQuery);