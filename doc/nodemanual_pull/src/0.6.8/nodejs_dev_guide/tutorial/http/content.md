# HTTP Servers and Clients

Among its most populated modules, Node's `http` module is double-booked, containing functionality for running both HTTP servers, and for making requests via an HTTP client. In addition, many of the objects in this module are also event emitters, and streams. Finally, the module also contains objects for both server and client requests and responses. That's a lot of stuff!

Fortunately, Node.js was designed to work with network applications, so there are plenty of ways to accomplish your objectives.