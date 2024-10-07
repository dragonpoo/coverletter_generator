// import twilio = require('twilio');
// false && (function() { //Twilio SMS Test
//     // Download the helper library from https://www.twilio.com/docs/node/install
//     // Find your Account SID and Auth Token at twilio.com/console
//     // and set the environment variables. See http://twil.io/secure
//     const accountSid = "";
//     const authToken = "";
//     const client = twilio(accountSid, authToken);

//     client.messages
//     .create({
//         body: 'This is twilio test?',
//         from: '+18669680848',
//         to: '+18593274876'
//         //  to: '+14344714249'
//     })
//     .then(message => console.log(message.sid));
// })();

import nodemailer from 'nodemailer';
import socks from 'socks';
var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
//  service: 'gmail',
  auth: {
	user: 'techninjas514@gmail.com',
	pass: 'gbsa ueex erlj fvvg'
  },
  proxy: 'socks5://localhost:1080'
});
// enable support for socks URLs
transporter.set('proxy_socks_module', socks);


var mailOptions = {
	from: 'UP-BOT <techninjas514@gmail.com>',
	to: `test@begintrust.com`,
	cc: ``,
	subject: `Test Email`,
	text: `EmailTesting now`,
	html: `EmailTesting now`
};

transporter.sendMail(mailOptions, function(error, info){
	if (error) {
		console.log(error);
	} else {
		console.log('Email sent: ' + info.response);
	}
});