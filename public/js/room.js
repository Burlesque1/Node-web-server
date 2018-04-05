var socket = io();


socket.on('connect', function () {
    console.log('connected to server');
    // var params = jQuery.deparam(window.location.search);
    
    var name = jQuery('#uname').text().substr(3);
    var params = {
        name, 
        room: "room"
    }
    console.log(typeof params, params)
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
    var sl = jQuery('<select></select>');
    sl.append(jQuery('<option></option>').text('All'));
    users.forEach(function (user) {
      ol.append(jQuery('<li></li>').text(user));
      sl.append(jQuery('<option></option>').text(user));
    });
    
    jQuery('#users').html(ol);
    jQuery('#user-list').html(sl);
});

socket.on('newMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template, {
      text: message.text,
      from: message.from,
      createdAt: formattedTime
    });
    jQuery('#messages').append(html);
    // scrollToBottom();
  });

socket.on('newPrivMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#message-template-priv').html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });

    jQuery('#messages').append(html);
    // scrollToBottom();
});

jQuery('#message-form').on('submit', function (e) {
    e.preventDefault();
  
    var messageTextbox = jQuery('[name=message]');
    var receiver = jQuery( "#user-list option:selected" ).val();
    console.log(receiver)
    socket.emit('createMessage', {
      text: messageTextbox.val(), 
      receiver,
    }, function () {
      messageTextbox.val('')
    });
});