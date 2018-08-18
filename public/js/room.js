var socket = io();


socket.on('connect', function () {
    console.log('connected to server');
    // var params = jQuery.deparam(window.location.search);
    
    var name = jQuery('#uname').text().substr(3);
    var params = {
        name, 
        room: "room"
    }
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
    var template = '<li class="message">' + 
        '<div class="message__title"><h4>{{from}}</h4>' +
                '<span>{{createdAt}}</span>' + 
            '</div>' + 
            '<div class="message__body">' +
                '<p>{{text}}</p>' + 
            '</div>' + 
        '</li>';
    var data = {
      text: message.text,
      from: message.from,
      createdAt: formattedTime
    };
    var html = Mustache.render(template, data);
    jQuery('#messages').append(html);
    // scrollToBottom();
  });

socket.on('newPrivMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = '<li class="message">' + 
        '<div class="message__title"><h4>{{from}}</h4>' +
                '<span>{{createdAt}}</span>' + 
            '</div>' + 
            '<div class="message__body">' +
                '<p>{{text}}</p>' + 
            '</div>' + 
        '</li>';
    var data = {
      text: message.text,
      from: message.from,
      createdAt: formattedTime
    };
    var html = Mustache.render(template, data);
    jQuery('#messages').append(html);
    // scrollToBottom();
});

socket.on('newLocationMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = '<li class="message">' + 
        '<div class="message__title"><h4>{{from}}</h4>' +
                '<span>{{createdAt}}</span>' + 
            '</div>' + 
            '<div class="message__body">' +
                '<p><a href="{{url}}" target="_blank">My current location</a></p>' + 
            '</div>' + 
        '</li>';
    var data = {
      from: message.from,
      url: message.url,
      createdAt: formattedTime
    };
    var html = Mustache.render(template, data);
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

var logoutButton = jQuery('#log-out');
logoutButton.on('click', () => {
    window.location.href='/';
});

var locationButton = jQuery('#send-location');
locationButton.on('click', function () {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser.');
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...');

  navigator.geolocation.getCurrentPosition(function (position) {
    locationButton.removeAttr('disabled').text('Send location');
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  }, function () {
    locationButton.removeAttr('disabled').text('Send location');
    alert('Unable to fetch location.');
  });
});