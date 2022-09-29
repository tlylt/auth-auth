# Authentication & Authorization

## Setup Guide

1. Clone the repository locally
1. Rename `.env.sample` to `.env`
1. Run `docker-compose up --build -d`
1. Visit `http://localhost:8000/api/v1/auth/status` to see that hello world
1. `docker-compose stop` to stop the containers

## Instructions

First, start the required services. The service will seed 2 users for testing:

```js
    const users = [
        { username: "basic", password: hashPassword("basic"), role: ROLE.BASIC },
        { username: "admin", password: hashPassword("admin"), role: ROLE.ADMIN },
    ]
```

### Test Authentication

> Unsuccessful GET request to API endpoint when a user is not authenticated, returns 
> HTTP 401 response. Successful GET request to API endpoint after user is authenticated, 
> returns HTTP 200.

- Try GET http://localhost:8000/api/v1/auth/authenticated without auth header
- Login via user "basic" and copy the accessToken, put it in the header, see `requests.rest` for example
- Retry GET http://localhost:8000/api/v1/auth/authenticated

### Test Authorization

> Unsuccessful GET request to API endpoint when a user is not authorized, returns 
> HTTP 403 response. Successful GET request to API endpoint if user is authorized, returns 
> HTTP 200.

- Try GET http://localhost:8000/api/v1/auth/admin with token from "basic" user, should return 403
- Try GET http://localhost:8000/api/v1/auth/admin with token from "admin" user, should return 200
- Try GET http://localhost:8000/api/v1/auth/basic with token from "basic" or "admin" user, should all work

### Implementation details

The `auth` service is implemented via JWT

- `accessToken` is sent via JSON response and ideally stored in memory in the frontend
  - Expires in 60 seconds
- `refreshToken` is sent via httpOnly cookie, to prevent access from Javascript
  - Expires in 7 days
- The JWT token encodes the username and the user's role

The Role based permissions work as follows:

Every user is given a role, which could be:

```js
export const ROLE = {
    UNKNOWN: 0,
    BASIC: 1,
    ADMIN: 2
};
```

When registering, user gets the role of "BASIC".

The role is checked via a `authenticateWithAuthorize` middleware function, which performs a check on whether the current user's role is sufficient to access the endpoint.

The role number is used to provide levels of access. For example, if a user has role "BASIC", they can access endpoints with role "BASIC" or "UNKNOWN". If a user has role "ADMIN", they can access endpoints with role "ADMIN", "BASIC" or "UNKNOWN".

## Daily Development Guide

(Change the .env's mongo and redis host to "localhost")

1. Start the required database services:
   1. `docker-compose -f docker-compose.dev.yml up --build`
2. Start the express server:
   1. `npm run dev`
3. Shut down database services:
   1. `docker-compose -f docker-compose.yml stop`

## JWT

JWT is a JSON Web Token (JWT) is a compact token format used to represent claims to be transferred between two parties.
To generate the secret tokens using NodeJS, run the following command:

```bash
node
require('crypto').randomBytes(64).toString('hex')
```

## Reference

- https://www.youtube.com/watch?v=T0k-3Ze4NLo
- https://softwareengineering.stackexchange.com/questions/387243/best-practice-to-confirm-unique-username-for-user-creation-in-jsp-and-jdbc
