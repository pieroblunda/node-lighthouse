import Lighthouse from './lighthouse.server.model.js';

// Call as string
// Lighthouse.run('https://stackoverflow.com');

// Call as Array
/*
Lighthouse.run([
	'https://stackoverflow.com',
	'https://github.com',
	'https://www.npmjs.com'
]);
*/

Lighthouse.run();