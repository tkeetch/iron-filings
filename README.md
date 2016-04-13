# iron-filings

[Iron](https://github.com/hueniverse/iron) is an npm module for encapsulated tokens (encrypted and mac'ed objects). The module uses a configuration supplied password to generate symmetric keys which are used to encrypt and authenticate a JSON object provided by the application. By successfully guessing the password, an attack could decrypt and modify the token.

Iron is used by several plugins for the Hapi framework for Node.js; including [hapi-auth-cookie](https://github.com/hapijs/hapi-auth-cookie) and [YaR](https://github.com/hapijs/yar). In these applications, by guessing the associated password, it may be possible to impersonate any user.

Starting with [Iron 4.0.0](https://github.com/hueniverse/iron/issues/39), passwords must be at least 32 characters by default, but the risk of accidentally using an insecure password remains, and this utility tries to detect the use of common passwords taken from tutorials and other example configurations.

To use it, find any cookie beginning with 'Fe26.2*' and iron-filings will do an offline dictionary attack trying common passwords until it finds one that successfully decrypts the cookie.

A default wordlist is provided, but you can provide a more comprehensive wordlist of your own.

## Example

```
# nodejs iron-filings.js  --token Fe26.2**0cdd607945dd1dffb7da0b0bf5f1a7daa6218cbae14cac51dcbd91fb077aeb5b*aOZLCKLhCt0D5IU1qLTtYw*g0ilNDlQ3TsdFUqJCqAm9iL7Wa60H7eYcHL_5oP136TOJREkS3BzheDC1dlxz5oJ**05b8943049af490e913bbc3a2485bee2aaf7b823f4c41d0ff0b7c168371a3772*R8yscVdTBRMdsoVbdDiFmUL8zb-c3PQLGJn4Y8C-AqI

Starting Password Brute-Force...

Unsealed Token: {"a":1,"b":2,"c":[3,4,5],"d":{"e":"f"}}
Password Found! - 'some_not_random_password_that_is_also_long_enough'
```

## Mitigation

To protect your application from this issue, follow these guidelines:
* Upgrade to the latest version of Iron and any modules that depend on Iron
* Use a randomly generated password of at least 32 characters
* Don't store any production passwords in your code repository
* Use different passwords in development and production environments
* Put in automated tests to ensure that weak test passwords are not accidentally used in production.
