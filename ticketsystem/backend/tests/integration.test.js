const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Employee = require('../models/Employee');
const Ticket = require('../models/Ticket');
const config = require('../config');

jest.mock('../swagger.json', () => ({}), { virtual: true });

/**
 * Integration Tests
 *
 * These tests verify the complete system behavior with real database connections.
 * Unlike unit tests that mock dependencies, integration tests ensure:
 * - Real database operations work correctly
 * - Cross-service interactions function properly
 * - Full request-response cycles complete successfully
 */

describe('Integration Tests', () => {
  let server;

  // Connect to test database and start server before all tests
  beforeAll(async () => {
    // Use a separate test database
    const testDbUri = config.mongoUri.replace(
      /\/[^/]+$/,
      '/ticketsystem-integration-test'
    );
    await mongoose.connect(testDbUri);

    // Start the server so internal API calls work
    server = app.listen(config.port);
  });

  // Clean up database before each test
  beforeEach(async () => {
    await Employee.deleteMany({});
    await Ticket.deleteMany({});
  });

  // Close server and database connection after all tests
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('Employee Integration Tests', () => {
    it('should create an employee and persist it to the database', async () => {
      // Arrange
      const employeeData = {
        vorname: 'Maria',
        nachname: 'Schmidt',
        beitrittsdatum: '2023-01-15',
        skillLevel: 4,
      };

      // Act
      const res = await request(app).post('/api/employees').send(employeeData);

      // Assert - Response is correct
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.vorname).toBe('Maria');
      expect(res.body.nachname).toBe('Schmidt');

      // Assert - Data is actually in database
      const savedEmployee = await Employee.findById(res.body._id);
      expect(savedEmployee).toBeTruthy();
      expect(savedEmployee.vorname).toBe('Maria');
      expect(savedEmployee.nachname).toBe('Schmidt');
      expect(savedEmployee.skillLevel).toBe(4);
    });

    it('should retrieve all employees from the database', async () => {
      // Arrange - Create employees directly in database
      await Employee.create({
        vorname: 'John',
        nachname: 'Doe',
        beitrittsdatum: '2022-03-10',
        skillLevel: 3,
      });
      await Employee.create({
        vorname: 'Jane',
        nachname: 'Smith',
        beitrittsdatum: '2021-06-20',
        skillLevel: 5,
      });

      // Act
      const res = await request(app).get('/api/employees');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].vorname).toBeDefined();
      expect(res.body[1].vorname).toBeDefined();
    });

    it('should retrieve a specific employee by ID', async () => {
      // Arrange
      const employee = await Employee.create({
        vorname: 'Test',
        nachname: 'User',
        beitrittsdatum: '2023-01-01',
        skillLevel: 2,
      });

      // Act
      const res = await request(app).get(`/api/employees/${employee._id}`);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body._id.toString()).toBe(employee._id.toString());
      expect(res.body.vorname).toBe('Test');
      expect(res.body.nachname).toBe('User');
    });
  });

  describe('Ticket Integration Tests', () => {
    it('should create a ticket with valid employee reference', async () => {
      // Arrange - Create an employee first
      const employee = await Employee.create({
        vorname: 'Support',
        nachname: 'Agent',
        beitrittsdatum: '2023-01-01',
        skillLevel: 4,
      });

      const ticketData = {
        titel: 'Integration Test Ticket',
        text: 'This is a real integration test',
        status: 'Open',
        mitarbeiterId: employee._id.toString(),
      };

      // Act
      const res = await request(app).post('/api/tickets').send(ticketData);

      // Assert - Response is correct
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.titel).toBe('Integration Test Ticket');
      expect(res.body.mitarbeiterId).toBe(employee._id.toString());

      // Assert - Data is actually in database
      const savedTicket = await Ticket.findById(res.body._id);
      expect(savedTicket).toBeTruthy();
      expect(savedTicket.titel).toBe('Integration Test Ticket');
      expect(savedTicket.mitarbeiterId).toBe(employee._id.toString());
    });

    it('should reject ticket with non-existent employee', async () => {
      // Arrange - Create a fake MongoDB ObjectId that doesn't exist
      const fakeEmployeeId = new mongoose.Types.ObjectId().toString();

      const ticketData = {
        titel: 'Invalid Ticket',
        text: 'This should fail',
        mitarbeiterId: fakeEmployeeId,
      };

      // Act
      const res = await request(app).post('/api/tickets').send(ticketData);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('nicht gefunden');

      // Assert - No ticket was created in database
      const ticketCount = await Ticket.countDocuments();
      expect(ticketCount).toBe(0);
    });

    it('should retrieve all tickets from the database', async () => {
      // Arrange - Create employee and tickets
      const employee = await Employee.create({
        vorname: 'Tech',
        nachname: 'Support',
        beitrittsdatum: '2023-01-01',
        skillLevel: 3,
      });

      await Ticket.create({
        titel: 'First Ticket',
        text: 'Description 1',
        mitarbeiterId: employee._id.toString(),
      });

      await Ticket.create({
        titel: 'Second Ticket',
        text: 'Description 2',
        mitarbeiterId: employee._id.toString(),
      });

      // Act
      const res = await request(app).get('/api/tickets');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });
  });

  describe('Cross-Service Integration Tests', () => {
    it('should handle complete workflow: create employee, create ticket, verify both', async () => {
      // Step 1: Create an employee
      const employeeRes = await request(app).post('/api/employees').send({
        vorname: 'Full',
        nachname: 'Workflow',
        beitrittsdatum: '2023-05-01',
        skillLevel: 5,
      });

      expect(employeeRes.statusCode).toBe(201);
      const employeeId = employeeRes.body._id;

      // Step 2: Create a ticket assigned to that employee
      const ticketRes = await request(app).post('/api/tickets').send({
        titel: 'Workflow Test',
        text: 'Testing complete workflow',
        status: 'In Progress',
        mitarbeiterId: employeeId,
      });

      expect(ticketRes.statusCode).toBe(201);
      const ticketId = ticketRes.body._id;

      // Step 3: Verify employee exists in database
      const dbEmployee = await Employee.findById(employeeId);
      expect(dbEmployee).toBeTruthy();
      expect(dbEmployee.vorname).toBe('Full');

      // Step 4: Verify ticket exists in database
      const dbTicket = await Ticket.findById(ticketId);
      expect(dbTicket).toBeTruthy();
      expect(dbTicket.titel).toBe('Workflow Test');
      expect(dbTicket.mitarbeiterId).toBe(employeeId);

      // Step 5: Verify we can retrieve both via API
      const getEmployeeRes = await request(app).get(
        `/api/employees/${employeeId}`
      );
      expect(getEmployeeRes.statusCode).toBe(200);

      const getTicketRes = await request(app).get(`/api/tickets/${ticketId}`);
      expect(getTicketRes.statusCode).toBe(200);
    });

    it('should enforce employee validation across services', async () => {
      // Arrange - Create an employee
      const employee = await Employee.create({
        vorname: 'Valid',
        nachname: 'Employee',
        beitrittsdatum: '2023-01-01',
        skillLevel: 3,
      });

      // Act - Create ticket with valid employee
      const validTicketRes = await request(app).post('/api/tickets').send({
        titel: 'Valid Ticket',
        text: 'This should work',
        mitarbeiterId: employee._id.toString(),
      });

      // Assert - Valid ticket is created
      expect(validTicketRes.statusCode).toBe(201);

      // Act - Try to create ticket with invalid employee
      const invalidTicketRes = await request(app).post('/api/tickets').send({
        titel: 'Invalid Ticket',
        text: 'This should fail',
        mitarbeiterId: new mongoose.Types.ObjectId().toString(),
      });

      // Assert - Invalid ticket is rejected
      expect(invalidTicketRes.statusCode).toBe(400);

      // Assert - Only one ticket exists in database
      const ticketCount = await Ticket.countDocuments();
      expect(ticketCount).toBe(1);
    });

    it('should handle status transitions with date validations', async () => {
      // Arrange
      const employee = await Employee.create({
        vorname: 'Status',
        nachname: 'Tester',
        beitrittsdatum: '2023-01-01',
        skillLevel: 4,
      });

      // Create ticket with Open status
      const openTicket = await request(app).post('/api/tickets').send({
        titel: 'Status Test',
        text: 'Testing status transitions',
        status: 'Open',
        mitarbeiterId: employee._id.toString(),
      });

      expect(openTicket.statusCode).toBe(201);
      expect(openTicket.body.status).toBe('Open');

      // Create ticket with Review status and reviewDatum
      const reviewTicket = await request(app).post('/api/tickets').send({
        titel: 'Review Test',
        text: 'Testing review status',
        status: 'Review',
        reviewDatum: new Date(),
        mitarbeiterId: employee._id.toString(),
      });

      expect(reviewTicket.statusCode).toBe(201);
      expect(reviewTicket.body.status).toBe('Review');
      expect(reviewTicket.body.reviewDatum).toBeDefined();

      // Create ticket with Done status
      const doneTicket = await request(app).post('/api/tickets').send({
        titel: 'Done Test',
        text: 'Testing done status',
        status: 'Done',
        reviewDatum: new Date(),
        doneDatum: new Date(),
        mitarbeiterId: employee._id.toString(),
      });

      expect(doneTicket.statusCode).toBe(201);
      expect(doneTicket.body.status).toBe('Done');
      expect(doneTicket.body.doneDatum).toBeDefined();

      // Verify all tickets are in database
      const allTickets = await Ticket.find();
      expect(allTickets.length).toBe(3);
    });
  });

  describe('Data Integrity Tests', () => {
    it('should maintain data consistency across multiple operations', async () => {
      // Create multiple employees
      const employees = await Promise.all([
        Employee.create({
          vorname: 'Alice',
          nachname: 'Johnson',
          beitrittsdatum: '2022-01-01',
          skillLevel: 3,
        }),
        Employee.create({
          vorname: 'Bob',
          nachname: 'Williams',
          beitrittsdatum: '2022-06-01',
          skillLevel: 4,
        }),
        Employee.create({
          vorname: 'Charlie',
          nachname: 'Brown',
          beitrittsdatum: '2023-01-01',
          skillLevel: 5,
        }),
      ]);

      // Create tickets for each employee
      for (const employee of employees) {
        const res = await request(app)
          .post('/api/tickets')
          .send({
            titel: `Ticket for ${employee.vorname}`,
            text: `Work assigned to ${employee.vorname} ${employee.nachname}`,
            mitarbeiterId: employee._id.toString(),
          });
        expect(res.statusCode).toBe(201);
      }

      // Verify counts
      const employeeCount = await Employee.countDocuments();
      const ticketCount = await Ticket.countDocuments();

      expect(employeeCount).toBe(3);
      expect(ticketCount).toBe(3);

      // Verify all tickets have valid employee references
      const tickets = await Ticket.find();
      for (const ticket of tickets) {
        const employee = await Employee.findById(ticket.mitarbeiterId);
        expect(employee).toBeTruthy();
      }
    });

    it('should handle concurrent requests without data corruption', async () => {
      // Create an employee
      const employee = await Employee.create({
        vorname: 'Concurrent',
        nachname: 'Test',
        beitrittsdatum: '2023-01-01',
        skillLevel: 4,
      });

      // Create multiple tickets concurrently
      const ticketPromises = [];
      for (let i = 0; i < 5; i++) {
        ticketPromises.push(
          request(app)
            .post('/api/tickets')
            .send({
              titel: `Concurrent Ticket ${i}`,
              text: `Testing concurrent creation ${i}`,
              mitarbeiterId: employee._id.toString(),
            })
        );
      }

      const results = await Promise.all(ticketPromises);

      // All should succeed
      results.forEach((res) => {
        expect(res.statusCode).toBe(201);
      });

      // Verify all tickets are in database
      const ticketCount = await Ticket.countDocuments();
      expect(ticketCount).toBe(5);
    });
  });
});
