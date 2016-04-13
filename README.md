# iron-filings

Iron-filings is a utility for testing the security of node.js applications using [Iron](https://github.com/hueniverse/iron) to ensure that they do not use weak or predictable passwords. You can easily tell if an application uses Iron because the application will store strings beginning with "Fe26.2" on the client, normally in HTTP cookies.

[Iron](https://github.com/hueniverse/iron) is an npm module for encapsulated tokens (encrypted and authenticated JSON). The module uses a secret developer-supplied password to generate symmetric keys which are used to encrypt and authenticate the JSON object used by the application. If we can successfully guess this password, then we could decrypt existing tokens and create new tokens.

A common use of Iron is for storing session state on the client instead of the server. To prevent client manipulation of that state, such as changing the user identifier, the contents have to be integrity protected by a Message Authentication Code (MAC). However, with knowledge of the password, we can generate the MAC for any message and therefore impersonate any user.

Iron is used by several plugins for the Hapi framework for Node.js including:
* [hapi-auth-cookie](https://github.com/hapijs/hapi-auth-cookie)
* [YaR](https://github.com/hapijs/yar). 

Prior to Iron 4.0.0, it was possible to choose short and insecure passwords like 'password', 'test' and 'changeme' and inadvertently deploy those applications to production. But starting with Iron 4.0.0 an improvement was made to require passwords to be [at least 32-characters](https://github.com/hueniverse/iron/issues/39). Though even with this improvement, an unwary developer could still use one of many predictable passwords from various online examples such as 'some\_not\_random\_password\_that\_is\_also\_long\_enough'.

Iron-filings simply takes a wordlist, works out the most likely configuration for Iron, then tries to verify the MAC on an existing token using each of the passwords in the wordlist. A default wordlist is provided based on searching online for example Iron configurations.

## Example

```
# nodejs iron-filings.js --token Fe26.2**0cdd607945dd1dffb7da0b0bf5f1a7daa6218cbae14cac51dcbd91fb077aeb5b*aOZLCKLhCt0D5IU1qLTtYw*g0ilNDlQ3TsdFUqJCqAm9iL7Wa60H7eYcHL_5oP136TOJREkS3BzheDC1dlxz5oJ**05b8943049af490e913bbc3a2485bee2aaf7b823f4c41d0ff0b7c168371a3772*R8yscVdTBRMdsoVbdDiFmUL8zb-c3PQLGJn4Y8C-AqI

Starting Password Brute-Force...

Unsealed Token: {"a":1,"b":2,"c":[3,4,5],"d":{"e":"f"}}
Password Found! - 'some_not_random_password_that_is_also_long_enough'
```

## Token Format

The token format is:
```
Fe26.<Version>*<Key Id>*<Encryption_Key_Salt>*<Encryption_IV>*<Encrypted_Payload>*<Expiry_Time>*<MAC_Key_Salt>*<MAC>
```

## Key Stretching

A previous attempt to fix this potential weakness was to [increase the iteration count of the hash function](https://github.com/hueniverse/iron/issues/21) using PBKDF2, which is a way to slow down password cracking. This technique is known as key-stretching and is useful when you are trying protect relatively weak user-supplied passwords, which need to be simple enough for users to remember, from brute-force attacks. But in the case of Iron the secret is stored on the server and doesn't need to be memorised, which makes key stretching a poor solution. A better solution is to require longer passwords, as Iron chose to do instead.

For this reason, Iron-filings assumes that the iteration count is always the default value of 1.

## Mitigation

To protect your application from this issue, follow these guidelines:
* Upgrade to the latest version of Iron and any modules that depend on Iron
* Use a randomly generated password of at least 32 characters
* Don't store any production passwords in your code repository
* Use different passwords in development and production environments
* Put in automated tests to ensure that weak test passwords are not accidentally used in production.
