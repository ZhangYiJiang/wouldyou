(function () {
  FB.Event.subscribe('edge.create', function () {
    // Make sure the alert doesn't show up again after the like button is clicked
    Cookies.set('like_alert_dismissed', true, {
      expires: 365,  // One year
    });
  });
})();
