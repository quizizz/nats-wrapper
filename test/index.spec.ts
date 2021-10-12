/* eslint no-console:0 */

const hold = require('hold-it');
const EventEmitter = require('events').EventEmitter;

import NATS from '../src/index';

const emitter = new EventEmitter();
emitter.on('error', console.error.bind(console));
emitter.on('success', console.log.bind(console));
emitter.on('info', console.log.bind(console));

describe('NATS', function () {
	it('should connect to default config', async function () {
		const nats = new NATS('nats', emitter);
		await nats.init();
		hold.add('nats', nats);
	});

	it('should subscribe/unsubscribe to a subject', function () {
		hold.get('nats').subscribe({
			subject: 'hello',
			callback: ({ data, sub }) => {
				console.log(data);
				hold.get('nats').unsubscribe(sub);
				console.log('Successfully unsubscribed');
			}
		});
	});

	it('should publish payload on subject', function () {
		hold.get('nats').publish({
			subject: 'hello',
			data: {
				text: 'world'
			},
		});
	});

	it('should process request/reply', function (done) {
		hold.get('nats').subscribe({
			subject: 'requestSub',
			callback: ({ data, reply }) => {
				console.log(`Request received: ${JSON.stringify(data)}`);
				console.log(`Reply subject - ${reply}`)
				hold.get('nats').publish({ subject: reply, data: { a: 2 } });
			}
		});

		hold.get('nats').subscribe({
			subject: 'responseSub',
			callback: ({ data }) => {
				console.log(`Response received: ${JSON.stringify(data)}`);
				done();
			}
		});

		hold.get('nats').publish({
			subject: 'requestSub',
			data: {
				a: 1,
			},
			options: {
				reply: 'responseSub',
			},
		});
	});

});
