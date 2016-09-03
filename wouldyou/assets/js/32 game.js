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
    showLikeAlertAfter: 5,

    undo: function () {
      // Clear selected verbs
      this.selected = {};

      // Unselect all cards
      this.gameArea.find('.game-card')
        .removeClass('card-selected')
        .addClass('card-unselected');

      // Enable all buttons
      this.buttons.prop('disabled', false)
        .removeClass('disabled');

      // Clear all hidden inputs
      this.gameArea.find('.game-card input')
        .prop('checked', false);

      // Hide all action image
      this.gameArea.find('.overlay-image')
        .children().hide();
    },

    select: function (btn) {
      var verb = btn.data('verb');
      var btnIndex = btn
        .closest('.game-choice')
        .prevAll('.game-choice').length;

      // Make sure the button can't be clicked again
      if (this.selected.hasOwnProperty(btnIndex))
        return;
      if (Object.values(this.selected).includes(verb)) {
        return;
      }

      this.selected[btnIndex] = verb;

      // Disable the button of the same verb on other cards
      this.otherButtons(btn)
        .addClass('disabled')
        .prop('disabled', true);

      // Switch current card class
      var card = btn.closest('.game-card')
        .removeClass('card-unselected')
        .addClass('card-selected');

      // Fill in hidden input
      btn.next('input').prop('checked', true);

      // Fade in action image
      card.find('.overlay-image').children().filter(function () {
        return $(this).data('verb') == verb;
      }).fadeIn();

      // Check if the game is finished
      if (Object.keys(this.selected).length === verbCount)
        this.complete();
    },

    otherButtons: function (btn) {
      var verb = btn.data('verb');
      return this.buttons.not(btn).filter(function () {
        return $(this).data('verb') === verb;
      });
    },

    complete: function () {
      var me = this;
      var gameCards = this.gameArea.find('.game-card');
      var specialMatches = [];

      this.completed = true;

      // Hide reset button
      this.gameArea.find('.undo-btn').fadeOut();

      // Switch 'Skip' button with 'Next'
      this.gameArea.find('.skip-btn').hide();
      this.gameArea.find('.next-btn').removeClass('hidden');

      // Show the correct user story button
      gameCards.each(function(i){
        var $t = $(this);
        var selected = me.selected[i];
        var story = $t.find('.game-story[data-verb="' + selected + '"]')
          .removeClass('hidden');

        // Special match
        if (!story.length) {
          specialMatches.push($t.find('.friend-stories').data('subject'));
        }
      });

      // Wait a bit before showing the results, so that any
      // card animations can complete in time
      setTimeout(this.showResults.bind(this), 400);

      if (specialMatches.length) {
        setTimeout(function(){
          me.showMatchModal(specialMatches);
        }, 500);
      }

      // Show a like button after the player played the game a few times
      setTimeout(this.showLikeAlert.bind(this), 1800);
    },

    showResults: function () {
      this.gameArea.find('.game-card').each(function (i, ele) {
        // Add a bit of delay between each card to add tension
        setTimeout(function () {
          $(ele).find('.game-result').fadeIn(300);
        }, 400 * i);
      });
    },

    showMatchModal: function (matches) {
      var modalContent = $('.match-modal');

      modalContent.find('.player-match').filter(function () {
        return matches.includes($(this).data('subject'));
      }).removeClass('hidden');

      modalContent.find('.match-btn').click(function () {
        $.featherlight.close();
      });

      $.featherlight(modalContent);
    },

    showLikeAlert: function () {
      if (!Cookies.get('like_alert_dismissed')) {
        var completeCount = +Cookies.get('complete_count') || 0;

        if (completeCount > this.showLikeAlertAfter) {
          // TODO: Hacky, should be replaced later
          var btnHtml = $('footer.global .fb-like').get(0).outerHTML;
          var message = 'Having fun? Why not spread the word by ' +
            'giving us a like? ';
          var alert = AlertManager.add('info', message + btnHtml, 'thumbs-o-up', function() {
            Cookies.set('like_alert_dismissed', true, {
              expires: 365,  // One year
            });
          });
        } else {
          Cookies.set('complete_count', completeCount + 1, {
            expires: 365,  // One year
          });
        }
      }
    }
  };

  window.Game = widget;
})(jQuery);

if ($('body').hasClass('game')) {
  var game = new Game($('.game-area'));
}
