# Considerations about the test
- The requirement “The client that calls listen must receive every message sent on the send message; each message must be received with a difference of 60 seconds” does not specify whether the delay must be at the topic, application, or instance level. In this test, the delay is applied at both instance and topic levels.
- The “interface” mentioned in test.md was actually an abstract class. Since the project does not have any default implementation of the SDK, I decided to create an interface instead.
- Horizontal scaling is scoped within the “server” itself, not external resources (e.g., a Redis server).
- I really wanted to create a Postman collection to document and expose the application for testing, but Postman does not support importing/exporting WebSocket collections (Postman issue).
- The Nginx configuration only includes the basics to load balance through service replicas. The default load balancing algorithm is Round Robin.
