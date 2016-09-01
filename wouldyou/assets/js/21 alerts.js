(function ($) {
  var alertArea = $('.alert-container');

  // No need to continue if there are no place for alerts on this page
  if (!alertArea.length) return;

  function makeAlert(level, text, icon, dismissable) {
    var alert = $('<div>', {
      'class': 'alert alert-' + level,
    });

    $('<p>', { text: text }).appendTo(alert);

    if (icon) {
      $('<i>', {
        'class': 'fa fa-2x fa-' + icon,
      }).prependTo(alert);
    }

    return alert;
  }

  var widget = function () {
    var me = this;

    // Instantiate alerts array with
    this.alerts = [];
    this.alertArea = alertArea;

    this.alertArea.children().each(function () {
      me.alerts.push($(this));
    });
  };

  widget.prototype = {
    add: function (level, text, icon, dismissable) {
      var alert = makeAlert(level, text, icon, dismissable);
      this.alerts.push(alert);
      this.alertArea.append(alert);

      alert.hide().slideDown();
    },

    clear: function (level) {
      var removedElements;

      if (!level) {
        removedElements = this.alertArea.children();
        this.alerts = [];
      } else {
        removedElements = this.alertArea.find('.alert-' + level);
        this.alerts = this.alerts.filter(function () {
          return !$(this).hasClass('alert-' + level);
        });
      }

      removedElements.slideUp(300, function () {
        $(this).remove();
      });
    }
  };

  window.Alerts = new widget();
})(jQuery);