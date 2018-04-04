var socket = io();


socket.on('connect', function () {
    console.log('connected to server');
    var params = jQuery.deparam(window.location.search);
    console.log(params, window.location.search);
    socket.emit('join', params, function(err) { // acknowledgement
        if(err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log('socket no error');
        }
    })
});

socket.on('disconnect', function(){
    console.log('Disconnected from server');
})

socket.on('updateUserList', function (users) {
    var ol = jQuery('<ol></ol>');
  
    users.forEach(function (user) {
      ol.append(jQuery('<li></li>').text(user));
    });
  
    jQuery('#users').html(ol);
});