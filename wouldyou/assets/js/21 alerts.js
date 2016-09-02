(function ($) {
  var alertArea = $('.alert-container');

  // No need to continue if there are no place for alerts on this page
  if (!alertArea.length) return;

  var Widget = function (level, text, icon, dismissable) {
    var me = this;

    this.level = level;
    this.dismissed = false;
    this.alert = $('<div>', {
      'class': 'alert alert-' + level,
    });

    $('<p>', { text: text }).appendTo(this.alert);

    if (icon) {
      $('<i>', {
        'class': 'fa fa-2x fa-' + icon,
      }).prependTo(this.alert);
    }

    if (dismissable) {
      var closeBtn = $(this.closeBtnHtml);
      closeBtn.appendTo(this.alert)
        .click(function () {
          me.dismiss();
          if (typeof dismissable === 'function') {
            dismissable(alert);
          }
        });
    }

    this.alert.hide();
  };

  Widget.prototype = {
    closeBtnHtml: '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>',

    open: function () {
      this.alert.slideDown(200);
    },

    dismiss: function () {
      if (this.dismissed)
        return;

      var me = this;
      this.alert.slideUp(200, function () {
        $(this).remove();
        me.dismissed = true;
      });
    },

  };

  var Manager = function () {
    var me = this;

    this.alerts = [];
    this.alertArea = alertArea;

    this.alertArea.children().each(function () {
      me.alerts.push($(this));
    });
  };

  Manager.prototype = {
    add: function (level, text, icon, dismissable) {
      var alert = this.makeButton(level, text, icon, dismissable);
      this.alerts.push(alert);
      this.alertArea.prepend(alert.alert);
      alert.open();
      return alert;
    },

    clear: function (level) {
      var removedElements, keepElements = [];

      if (!level) {
        removedElements = this.alerts;
      } else {
        removedElements = [];

        this.alerts.forEach(function(alert){
          if (alert.level == level) {
            removedElements.push(alert);
          } else {
            keepElements.push(alert);
          }
        });
      }

      removedElements.forEach(function (alert) {
        alert.dismiss();
      });

      this.alerts = keepElements;
    },

    makeButton: function(level, text, icon, dismissable) {
      return new Widget(level, text, icon, dismissable);
    }
  };

  window.AlertManager = new Manager();
  window.Alert = Widget;
})(jQuery);