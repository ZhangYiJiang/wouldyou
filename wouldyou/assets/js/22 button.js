(function ($) {
  function generateHtml(content, icon) {
    return '<i class="fa fa-' + icon + '"></i> ' + content;
  }

  var widget = function (buttonElement, message, icon) {
    this.button = $(buttonElement);
    this.originalContent = this.button.html();
    this.successMessage = message || 'Success!';
    this.successIcon = icon || 'thumbs-o-up';
  };

  widget.prototype = {
    defaultSpinner: '<div class="spinner">' +
      '<div class="bounce1"></div>' +
      '<div class="bounce2"></div>' +
      '<div class="bounce3"></div>' +
    '</div>',

    start: function () {
      if (this.button.data('started')) {
        return false;
      }

      // Fix button height and width before replacing content
      this.button.height(this.button.height());

      // Replace with spinner
      var html = this.defaultSpinner;
      this.button.html(html);

      // Make sure button can't be pressed multiple times
      this.button.addClass('btn-started')
        .data('started', true);

      return true;
    },

    reset: function () {
      this.button.html(this.originalContent);

      // Reset started button state
      this.button
        .removeClass('btn-started')
        .data('started', false);
    },

    success: function () {
      var html = generateHtml(this.successMessage, this.successIcon);
      this.button.html(html);
    },
  };

  window.LoadingButton = widget;
})(jQuery);
