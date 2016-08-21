$('body.onboard .friends button').click(function(){
    var ids = $('.friend-selector input:checked').map(function(){
        return $(this).val();
    }).get();

    FB.ui({method: 'apprequests',
      message: 'Hello world',
      to: ids.join(','),
    }, function(response){
      console.log(response);
    });
});

//# sourceMappingURL=app.js.map
