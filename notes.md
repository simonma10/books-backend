
## Local Install of MongoDb

Start as a service:

```brew services start mongodb/brew/mongodb-community```

Start on demand:

```mongod --config /usr/local/etc/mongod.conf```

OR, use cloud.mongodb.com

smar / S..1

simondo_sys / SPvmYuCknfKFkO5B

mongodb+srv://simondo_sys:<password>@cluster0-ebpvl.mongodb.net/test?retryWrites=true&w=majority


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://simondo_sys:<password>@cluster0-ebpvl.mongodb.net/test?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});


