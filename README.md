# Multiplayer-Tetris
A full stack tetris application that allows a single player and a multiplayer mode using socket.io

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

| Prerequisite                                | Version |
| ------------------------------------------- | ------- |
| [Node.js](http://nodejs.org) /  npm (comes with Node)  | `~ ^8.11.2` / `~^6.1.0` |
| [yarn](https://yarnpkg.com/lang/en/docs/install/) | `~ ^1.3.2` |
| [Git](https://git-scm.com/downloads) | `~ ^2` |
| [MongoDB Community Server](https://docs.mongodb.com/manual/administration/install-community/) | `~ ^3.4.9`  |


### Installing

Create a new directory and initialize git

```
mkdir Multiplayer-Tetris
cd Multiplayer-Tetris
git init
```

Pull from github and install packages

```
git pull https://github.com/Dereje1/Multiplayer-Tetris.git
yarn
cd client
yarn
cd ..
```

If using mongoDB locally see below to start the db (if using mlab skip this step)

```
mkdir data
mongod --port 27017 --dbpath=./data
```

create .env files
>In the root of the project create a .env file with the following contents
```
MONGOLAB_URI=<mongoDB connection string>
COOKIE_KEY=<Cookie key>
GOOGLE_CLIENT_ID=<Google Client ID>
GOOGLE_CLIENT_SECRET=<Google Client Secret>
NODE_ENV=development
```
Run development environment
```
yarn dev
```
The Browser should now open up with the application in development mode.

## Built With

* [MongoDB](https://www.mongodb.com/) - Database
* [Express](https://expressjs.com/) - Node.js web application framework
* [React](https://reactjs.org/) - A JavaScript library for building user interfaces
* [Node.js](https://nodejs.org/) - JavaScript runtime
* [Socket.io](https://socket.io/) - enables real-time, bidirectional and event-based communication.
 
## Authors

* **Dereje Getahun** - [Dereje Getahun](https://github.com/Dereje1)

## History
* [Canvas Concept](https://codepen.io/Dee73/pen/KeRYqV)
* [Game Concept](https://github.com/Dereje1/React-Canvas-Playground/tree/master/client)
* [Game First Version](https://github.com/Dereje1/Bears-Team-05)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone who's code was used