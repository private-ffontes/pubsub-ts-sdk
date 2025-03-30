# Considerations about the test

- The requirement "The client that calls listen must receive every message sent on the send message, each message must be received with a difference of 60 seconds" does not specify if the delay must be at the topic, application, or instance level. In this test, the delay is applied at both instance and topic levels.
- The "interface" mentioned in test.md was actually an abstract class. Since the project does not have any default implementation of the SDK, I decided to create an interface instead.
- The horizontal scaling is scoped through the "server" itself, not to external resources (e.g., Redis server).
