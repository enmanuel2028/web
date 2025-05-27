const crypto = require('crypto');

try {
    const secret = crypto.randomBytes(32).toString('base64');
    console.log('Generated JWT Secret:', secret);
} catch (error) {
    console.error('Error generating secret:', error);
}