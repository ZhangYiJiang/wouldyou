(function ($) {
  var verbCount = 3;

  var widget = function (gameArea) {
    var me = this;

    this.gameArea = $(gameArea);
    this.gameForm = gameArea.find('form');
    this.buttons = this.gameArea.find('.verb-btn');
    this.selected = [];
    this.completed = false;

    // Event binding
    this.gameArea.on('click', '.verb-btn', function (evt) {
      evt.preventDefault();
      me.select($(this));
    });

    this.gameArea.find('.undo-btn').click(function (evt) {
      evt.preventDefault();
      me.undo();
    });

    this.gameForm.submit(function (evt) {
      // Don't allow form submission unless game has been completed
      if (!me.completed)
        return false;
    });

  };

  widget.prototype = {
    undo: function () {
      // Clear selected verbs
      this.selected = [];

      // Unselect all cards
      this.gameArea.find('.game-card')
        .removeClass('card-selected')
        .addClass('card-unselected');

      // Enable all buttons
      this.buttons.removeClass('disabled');

      // Clear all hidden inputs
      this.gameArea.find('.game-card input')
        .prop('checked', false);
    },

    select: function (btn) {
      var verb = btn.data('verb');
      // Make sure the button can't be clicked again
      if (this.selected.indexOf(verb) !== -1)
        return;
      this.selected.push(verb);

      // Disable the button of the same verb on other cards
      this.otherButtons(btn)
        .addClass('disabled');

      // Switch current card class
      btn.closest('.game-card')
        .removeClass('card-unselected')
        .addClass('card-selected');

      // Fill in hidden input
      btn.next('input').prop('checked', true);

      // TODO: Fade in action image

      // Check if the game is finished
      if (this.selected.length === verbCount)
        this.complete();
    },

    otherButtons: function (btn) {
      var verb = btn.data('verb');
      return this.buttons.not(btn).filter(function () {
        return $(this).data('verb') === verb;
      });
    },

    complete: function () {
      this.completed = true;

      // Switch 'Skip' button with 'Next'
      this.gameArea.find('.skip-btn').hide();
      this.gameArea.find('.next-btn').removeClass('hidden');
    },
  };

  window.Game = widget;
})(jQuery);

if ($('body').hasClass('game')) {
  var game = new Game($('.game-area'));
}
/*

(function ($) {
  var verbBtn = $('body.game .verb-button');
  var gameArea = $('body.game .game-area');
  var gameAction = $('body.game .game-action');
  var url = gameArea.data('url'),
      setId = gameArea.data('set'),
      model = gameArea.data('model');
  var count = 0;

  verbBtn.click(function(evt){
    evt.preventDefault();

    // Make sure the button can't be clicked more than once
    var $t = $(this);
    if ($t.data('clicked'))
      return;
    $t.data('clicked', true);
    count++;

    // Remove the same option from all other profile
    var verb = $t.data('verb');
    verbBtn.not(this).filter(function () {
      return $(this).data('verb') == verb;
    }).css('visibility', 'hidden');

    // Remove all other option on the same profile
    $t.closest('li')
      .siblings()
      .find('button')
      .remove();

    // Mark the game card as selected
    $t.closest('.game-card-unselected')
      .removeClass('game-card-unselected');

    if (count == 3) {
      $('body.game .game-result')
        .removeClass('hidden');
      verbBtn.closest('li')
        .siblings()
        .remove();
      gameAction.css('justify-content', 'flex-start');
    }
  });

})(jQuery);*/