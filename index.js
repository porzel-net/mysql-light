const mysql = require('mysql2/promise');

class Database {
    /**
     * Initializes a database connection.
     * @param {string} host - The MySQL database host.
     * @param {string} user - The MySQL database user.
     * @param {string} password - The user's password for the database.
     * @param {string} database - The name of the database to connect to.
     */
    constructor(host, user, password, database) {
        return mysql.createConnection({ host: host, user: user, password: password, database: database })
            .then(connection => this.connection = connection)
            .then(() => this)
            .catch(error => Promise.reject(`An error occurred while connecting to the MySQL database "${database}" with user "${user}" and password "${Array.from(password).reduce((sum) => sum + "*", "")}" on host "${host}:\n${error}`))
    }

    /**
     * Create a SELECT query object with specified columns.
     * @param {string|string[]} columns - The columns to select in the query.
     * @returns {Object} - A SELECT query object with the specified columns.
     */
    select(columns)  {
        return Clauses.select(this.connection, columns)
    }

    /**
     * Create an INSERT query object for the specified table.
     * @param {string} table - The name of the table to insert data into.
     * @returns {Object} - An INSERT query object for the specified table.
     */
    insert(table) {
        return Clauses.insert(this.connection, table)
    }

    /**
     * Create an UPDATE query object for the specified table.
     * @param {string} table - The name of the table to update data in.
     * @returns {Object} - An UPDATE query object for the specified table.
     */
    update(table) {
        return Clauses.update(this.connection, table)
    }
}

class Clauses {
    /**
     * Execute a query object.
     * @param {Object} queryObject - The query object to execute.
     */
    static execute(queryObject) {
        queryObject.databaseConnection.execute(queryObject.query)
    }

    /**
     * Add a LIMIT clause to the query object.
     * @param {Object} queryObject - The query object to add the LIMIT clause to.
     * @param {number} limit - The maximum number of results to return.
     * @returns {Object} - The query object with the added LIMIT clause.
     */
    static limit(queryObject, limit) {
        queryObject = {
            ...queryObject,
            query: `${queryObject.query} LIMIT ${limit}`,
        }

        return {
            ...queryObject,
            execute: () => Clauses.execute(queryObject)
        }
    }

    /**
     * Add an ORDER BY clause to the query object.
     * @param {Object} queryObject - The query object to add the ORDER BY clause to.
     * @param {string} orderBy - The column to order the results by.
     * @returns {Object} - The query object with the added ORDER BY clause.
     */
    static orderBy(queryObject, orderBy) {
        queryObject = {
            ...queryObject,
            query: `${queryObject.query} ORDER BY ${orderBy}`,
        }

        return {
            ...queryObject,
            limit: (limit) => Clauses.limit(queryObject, limit),
            execute: () => Clauses.execute(queryObject)
        }
    }

    /**
     * Add a WHERE clause to the query object.
     * @param {Object} queryObject - The query object to add the WHERE clause to.
     * @param {string} where - The condition for the WHERE clause.
     * @returns {Object} - The query object with the added WHERE clause.
     */
    static where(queryObject, where) {
        queryObject = {
            ...queryObject,
            query: `${queryObject.query} WHERE ${where}`,
        }

        let functions;

        if (queryObject.type === "SELECT") {
            functions = {
                orderBy: (orderBy) => Clauses.orderBy(queryObject, orderBy),
            }
        }

        return {
            ...queryObject,
            ...functions,
            limit: (limit) => Clauses.limit(queryObject, limit),
            execute: () => Clauses.execute(queryObject)
        }
    }

    /**
     * Add a JOIN clause to the query object.
     * @param {Object} queryObject - The query object to add the JOIN clause to.
     * @param {string} type - The type of JOIN (e.g., INNER, LEFT).
     * @param {string} table - The name of the table to join.
     * @param {string} on - The condition for the join.
     * @returns {Object} - The query object with the added JOIN clause.
     */
    static join(queryObject, type = "", table, on) {
        queryObject = {
            ...queryObject,
            query: `${queryObject.query} ${type} JOIN ${table} ON ${on}`,
        }

        let functions;

        if (queryObject.type === "UPDATE") {
            functions = {
                set: (values) => Clauses.set(queryObject, values)
            }
        }

        return {
            ...queryObject,
            ...functions,

            //JOINS
            join: (table, on) => this.join(queryObject, undefined, table, on),
            leftJoin: (table, on) => this.join(queryObject, "LEFT", table, on),
            leftOuterJoin: (table, on) => this.join(queryObject, "LEFT OUTER", table, on),
            rightJoin: (table, on) => this.join(queryObject, "RIGHT", table, on),
            rightOuterJoin: (table, on) => this.join(queryObject, "RIGHT OUTER", table, on),
            fullJoin: (table, on) => this.join(queryObject, "FULL", table, on),
            fullOuterJoin: (table, on) => this.join(queryObject, "FULL OUTER", table, on),
            selfJoin: (table, on) => this.join(queryObject, "SELF", table, on),
            crossJoin: (table, on) => this.join(queryObject, "CROSS", table, on),
            innerJoin: (table, on) => this.join(queryObject, "INNER", table, on),

            limit: (limit) => Clauses.limit(queryObject, limit),
            where: (where) => Clauses.where(queryObject, where),
            execute: () => Clauses.execute(queryObject)
        }
    }

    /**
     * Add a FROM clause to the query object.
     * @param {Object} queryObject - The query object to add the FROM clause to.
     * @param {string} table - The name of the table to select data from.
     * @returns {Object} - The query object with the added FROM clause.
     */
    static from(queryObject, table) {
        queryObject = {
            ...queryObject,
            query: `${queryObject.query} FROM ${table}`
        }

        return {
            ...queryObject,

            //JOINS
            join: (table, on) => this.join(queryObject, undefined, table, on),
            leftJoin: (table, on) => this.join(queryObject, "LEFT", table, on),
            leftOuterJoin: (table, on) => this.join(queryObject, "LEFT OUTER", table, on),
            rightJoin: (table, on) => this.join(queryObject, "RIGHT", table, on),
            rightOuterJoin: (table, on) => this.join(queryObject, "RIGHT OUTER", table, on),
            fullJoin: (table, on) => this.join(queryObject, "FULL", table, on),
            fullOuterJoin: (table, on) => this.join(queryObject, "FULL OUTER", table, on),
            selfJoin: (table, on) => this.join(queryObject, "SELF", table, on),
            crossJoin: (table, on) => this.join(queryObject, "CROSS", table, on),
            innerJoin: (table, on) => this.join(queryObject, "INNER", table, on),

            where: (where) => Clauses.where(queryObject, where),
            orderBy: (orderBy) => Clauses.orderBy(queryObject, orderBy),
            limit: (limit) => Clauses.limit(queryObject, limit),
            execute: () => Clauses.execute(queryObject),
        }
    }

    /**
     * Create a SELECT query object with specified columns.
     * @param {Object} databaseConnection - The database connection.
     * @param {string|string[]} columns - The columns to select in the query.
     * @returns {Object} - A SELECT query object with the specified columns.
     */
    static select(databaseConnection, columns) {
        if (Array.isArray(columns)) {
            columns = columns.join(", ")
        }

        const queryObject = {
            databaseConnection: databaseConnection,
            type: "SELECT",
            query: `SELECT ${columns}`
        }

        return {
            ...queryObject,
            from: (table) => Clauses.from(queryObject, table),
            limit: (limit) => Clauses.limit(queryObject, limit)
        }
    }

    /**
     * Add a VALUES clause to the query object.
     * @param {Object} queryObject - The query object to add the VALUES clause to.
     * @param {string|string[]} values - The values to insert into the table.
     * @returns {Object} - The query object with the added VALUES clause.
     */
    static values(queryObject, values) {
        if (Array.isArray(values)) {
            values = values.map(value => {
                if (value instanceof Buffer) {
                    value = `X'${value.toString("hex")}'`
                } else if (typeof value === "string") {
                    value = `"${value}"`;
                } else if (value === undefined || value === null) {
                    value = "NULL";
                }

                return value;
            })

            values = values.join(", ")
        }

        queryObject = {
            ...queryObject,
            query: `${queryObject.query} VALUES (${values})`
        }

        return {
            ...queryObject,
            execute: () => Clauses.execute(queryObject)
        }
    }

    /**
     * Add a COLUMNS clause to the query object.
     * @param {Object} queryObject - The query object to add the COLUMNS clause to.
     * @param {string|string[]} columns - The columns to specify in the query.
     * @returns {Object} - The query object with the added COLUMNS clause.
     */
    static columns(queryObject, columns) {
        if (Array.isArray(columns)) {
            columns = columns.join(", ")
        }

        queryObject = {
            ...queryObject,
            query: `${queryObject.query} (${columns})`
        }

        return {
            ...queryObject,
            values: (values) => Clauses.values(queryObject, values)
        }
    }

    /**
     * Add an object with key-value pairs to the INSERT query object.
     * @param {Object} queryObject - The query object to add the object data to.
     * @param {Object} object - An object with key-value pairs to be inserted into the table.
     * @returns {Object} - The updated INSERT query object with the added data to be inserted.
     */
    static object(queryObject, object) {
        return Clauses.columns(queryObject, Object.keys(object)).values(Object.values(object));
    }

    /**
     * Add a set of key-value pairs to the query object using the SET clause.
     * @param {Object} queryObject - The query object to add the SET clause to.
     * @param {Object} values - An object with key-value pairs to set in the query.
     * @returns {Object} - The query object with the added SET clause.
     */
    static set(queryObject, values) {
        if (Array.isArray(values)) {
            values = values.join(", ");
        }

        if (typeof values === "object") {
            values = Object.entries(values).map(([key, value]) => {
                if (value instanceof Buffer) {
                    value = `X'${value.toString("hex")}'`

                } else if (typeof value === "boolean") {
                    value = `${(value) ? "TRUE" : "FALSE"}`;
                }
                else if (typeof value === "string") {
                    value = `"${value}"`;
                } else if (value === undefined || value === null) {
                    value = "NULL";
                }

                return `${key}=${value}`
            }).join(", ")
        }

        queryObject = {
            ...queryObject,
            query: `${queryObject.query} SET ${values}`
        }

        return {
            ...queryObject,
            where: (where) => Clauses.where(queryObject, where),
            execute: () => Clauses.execute(queryObject),
            limit: (limit) => Clauses.limit(queryObject, limit),
        }
    }

    /**
     * Create an INSERT query object for the specified table.
     * @param {Object} databaseConnection - The database connection.
     * @param {string} table - The name of the table to insert data into.
     * @returns {Object} - An INSERT query object for the specified table.
     */
    static insert(databaseConnection, table) {
        const queryObject = {
            databaseConnection: databaseConnection,
            type: "INSERT",
            query: `INSERT INTO ${ table }`
        }

        return {
            ...queryObject,
            columns: (columns) => Clauses.columns(queryObject, columns),
            object: (object) => Clauses.object(queryObject, object)
        }
    }

    /**
     * Create an UPDATE query object for the specified table.
     * @param {Object} databaseConnection - The database connection.
     * @param {string} table - The name of the table to update data in.
     * @returns {Object} - An UPDATE query object for the specified table.
     */
    static update(databaseConnection, table) {
        const queryObject = {
            databaseConnection: databaseConnection,
            type: "UPDATE",
            query: `UPDATE ${table}`
        }

        return {
            ...queryObject,

            //JOINS
            join: (table, on) => this.join(queryObject, undefined, table, on),
            leftJoin: (table, on) => this.join(queryObject, "LEFT", table, on),
            leftOuterJoin: (table, on) => this.join(queryObject, "LEFT OUTER", table, on),
            rightJoin: (table, on) => this.join(queryObject, "RIGHT", table, on),
            rightOuterJoin: (table, on) => this.join(queryObject, "RIGHT OUTER", table, on),
            fullJoin: (table, on) => this.join(queryObject, "FULL", table, on),
            fullOuterJoin: (table, on) => this.join(queryObject, "FULL OUTER", table, on),
            selfJoin: (table, on) => this.join(queryObject, "SELF", table, on),
            crossJoin: (table, on) => this.join(queryObject, "CROSS", table, on),
            innerJoin: (table, on) => this.join(queryObject, "INNER", table, on),

            set: (values) => Clauses.set(queryObject, values),
        }
    }

    /**
     * Create a DELETE query object for the specified table.
     * @param {Object} databaseConnection - The database connection.
     * @param {string} table - The name of the table to delete data from.
     * @returns {Object} - A DELETE query object for the specified table.
     */
    static delete(databaseConnection, table) {
        const queryObject = {
            databaseConnection: databaseConnection,
            type: "DELETE",
            query: `DELETE
                    FROM ${table}`
        }

        return {
            ...queryObject,

            //JOINS
            join: (table, on) => this.join(queryObject, undefined, table, on),
            leftJoin: (table, on) => this.join(queryObject, "LEFT", table, on),
            leftOuterJoin: (table, on) => this.join(queryObject, "LEFT OUTER", table, on),
            rightJoin: (table, on) => this.join(queryObject, "RIGHT", table, on),
            rightOuterJoin: (table, on) => this.join(queryObject, "RIGHT OUTER", table, on),
            fullJoin: (table, on) => this.join(queryObject, "FULL", table, on),
            fullOuterJoin: (table, on) => this.join(queryObject, "FULL OUTER", table, on),
            selfJoin: (table, on) => this.join(queryObject, "SELF", table, on),
            crossJoin: (table, on) => this.join(queryObject, "CROSS", table, on),
            innerJoin: (table, on) => this.join(queryObject, "INNER", table, on),

            where: (where) => Clauses.where(queryObject, where),
            limit: (limit) => Clauses.limit(queryObject, limit),
        }
    }
}

module.exports = Database