module.exports = {
  "mysql": {
    "host": (process.env.OPENSHIFT_MYSQL_DB_HOST || "127.0.0.1"),
    "port": (process.env.OPENSHIFT_MYSQL_DB_PORT || 3306),
    "user": (process.env.MYSQL_USER || "root"),
    "password": (process.env.MYSQL_PASSWORD || ""),
    "database": (process.env.MYSQL_SCHEMA || "tracker")
  },
  "express": {
    "port": (process.env.NODE_PORT || 8000),
    "host": (process.env.NODE_IP || "localhost")
  },
  "twitter": {
    "consumer_key": process.env.TWITTER_CONSUMER_KEY,
    "consumer_secret": process.env.TWITTER_CONSUMER_SECRET,
    "token": process.env.TWITTER_TOKEN,
    "token_secret": process.env.TWITTER_TOKEN_SECRET
  },
  "logging": false 
};
