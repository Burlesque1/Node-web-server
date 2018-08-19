var expect = require('expect');

var {generateMessage, generateLocationMessage} = require('./../utils/message');

describe('generateMessage', () => {
    it('should generate correct message object', () => {
        var user = 'test';
        var text = 'text';
        var message = generateMessage(user, text);
        expect(typeof message.createdAt).toBe('number');
        expect(message).toMatchObject({user, text});
    });
});

describe('generateLocationMessage', () => {
    it('should generate correct location object', () => {
        var from = 'Deb';
        var latitude = 1;
        var longitude = 1;
        var url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        var message = generateLocationMessage(from, latitude, longitude);

        expect(typeof message.createdAt).toBe('number');
        expect(message).toMatchObject({from, url});
    })
})