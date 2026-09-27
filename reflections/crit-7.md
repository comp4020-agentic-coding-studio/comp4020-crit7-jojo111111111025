# Crit 7 Reflection

The breakthrough in this crit was moving from a generic CRUD prototype to a small system that represents a real student planning need. The starter application was a guestbook, but I wanted the prototype to model something I actually deal with at ANU: deciding which courses I intend to take before completing enrolment.

I used Claude Code as the primary implementation agent, but the important part of the process was directing its scope. I specified the user flow, database requirements, and explicit scope cuts before implementation. The core requirement was that adding a course had to travel through the API and database, rather than being simulated with client-side state. This gave the prototype a clear full-stack story that I could demonstrate through a reload and server restart.

The first version proved the technical flow, but it felt too much like a CRUD interface. I then redirected the agent towards a more recognisable "ANU Semester Planner" experience, with clearer course cards, study-load information, and Core/Elective classification. I also used tests and manual API checks to catch invalid inputs and verify persistence.

The main lesson was that agentic coding is most useful when I define the product boundary and acceptance criteria clearly. The agent could implement and iterate quickly, but I still needed to decide what the system should represent and verify that the implementation matched that intention.
