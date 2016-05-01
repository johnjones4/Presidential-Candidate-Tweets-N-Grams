{
  "mysql": {
    "host": (process.env.MYSQL_HOST || "127.0.0.1"),
    "user": (process.env.MYSQL_USER || "root"),
    "password": (process.env.MYSQL_PASSWORD || ""),
    "database": (process.env.MYSQL_PASSWORD || "tracker")
  },
  "express": {
    "port": (process.env.PORT || 8000)
  },
  "twitter": {
    "consumer_key": process.env.TWITTER_CONSUMER_KEY,
    "consumer_secret": process.env.TWITTER_CONSUMER_SECRET,
    "token": process.env.TWITTER_TOKEN,
    "token_secret": process.env.TWITTER_TOKEN_SECRET
  },
  "logging": false
}
