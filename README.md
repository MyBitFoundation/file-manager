# MyBit-FileManager

## Setup

* `yarn setup`
* Create an ```.env``` file at the root of the project with the following variables:

```
REACT_APP_USERNAME=yourusername
REACT_APP_PASSWORD=yourpassword
REACT_APP_SERVER_DEV=http://localhost:8000
```
* Add same username and password with `htpasswd` to `server/users.htpasswd`

## How to run the front-end

`yarn start:fe`

## How to run the server

`yarn start:server`

## How to create the server `htpassword` file

```
sudo apt-get install apache2-utils
htpasswd -Bc server/users.htpasswd admin
```

## Deployment

`yarn start:prod`

### Important notes

* Files with over **2GB** are not supported.

* `.env` admin/password need to match the ones in the server, defined in 
the file ```users.htpasswd``` under **/server** (check [http-auth](https://github.com/http-auth/http-auth) 
for more information about the authentication method used). Currently those credentials are encrypted using bcrypt.

* Don't encrypt the credentials in the ```.env``` file. 

* The url for the server can be changed. 
Make sure not to include a forward slash at the end of it and make sure to include the port if needed.