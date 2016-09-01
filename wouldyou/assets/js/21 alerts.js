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
        'class': 'fa fa-' + icon,
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
      alert.hide().slideDown();
      this.alerts.push(alert);
      this.alertArea.append(alert);
    },
  };

  window.Alerts = new widget();
})(jQuery);