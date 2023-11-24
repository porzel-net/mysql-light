# mysql-light
A lightweight MySQL driver for Node.js
This is a lightweight MySQL library for Node.js that provides a simplified way to interact with a MySQL database. It allows you to easily create and execute SELECT, INSERT, UPDATE, and DELETE queries.

## Usage

To use the library, you need to import it and create an instance of the `Database` class. The `Database` class takes four parameters: `host`, `user`, `password`, and `database`. These parameters are used to establish a connection to the MySQL database.

```javascript
const db = new Database('localhost', 'root', 'password', 'mydatabase');
```

### SELECT Queries

To create a SELECT query, you can use the `select` method of the `Database` instance. The `select` method takes one parameter: `columns`, which can be a string or an array of strings representing the columns to select.

```javascript
const query = db.select(['name', 'email']).from('users').where('age > 18').limit(10);

query.execute()
    .then(results => {
        // Handle the query results
    })
    .catch(error => {
        // Handle any errors
    });
```

### INSERT Queries

To create an INSERT query, you can use the `insert` method of the `Database` instance. The `insert` method takes one parameter: `table`, which is the name of the table to insert data into.

```javascript
const query = db.insert('users').columns(['name', 'email']).values(['John Doe', 'john@example.com']);

query.execute()
    .then(() => {
        // Handle the query execution
    })
    .catch(error => {
        // Handle any errors
    });
```

### UPDATE Queries

To create an UPDATE query, you can use the `update` method of the `Database` instance. The `update` method takes one parameter: `table`, which is the name of the table to update data in.

```javascript
const query = db.update('users').set({ age: 25 }).where('id = 1');

query.execute()
    .then(() => {
        // Handle the query execution
    })
    .catch(error => {
        // Handle any errors
    });
```

### DELETE Queries

To create a DELETE query, you can use the `delete` method of the `Database` instance. The `delete` method takes one parameter: `table`, which is the name of the table to delete data from.

```javascript
const query = db.delete('users').where('id = 1');

query.execute()
    .then(() => {
        // Handle the query execution
    })
    .catch(error => {
        // Handle any errors
    });
```

### execute(query)

Execute a raw SQL query on the connected database.

```javascript
const query = 'SELECT * FROM users';

db.execute(query)
    .then(results => {
        // Handle the query results
    })
    .catch(error => {
        // Handle any errors
    });
```

### executeTransaction(query)

Execute a transactional SQL query on the connected database.

```javascript
const query = 'UPDATE users SET age = 30 WHERE id = 1';

db.executeTransaction(query)
    .then(() => {
        // Handle the query execution
    })
    .catch(error => {
        // Handle any errors or rolled back transactions
    });
```

## License

This library is licensed under the MIT License.