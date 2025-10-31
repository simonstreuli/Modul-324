const request = require('supertest');
const mongoose = require('mongoose');
const axios = require('axios');
const Ticket = require('../models/Ticket');
const Employee = require('../models/Employee');
const app = require('../index');

// Mock axios for API calls
jest.mock('axios');

// Mock mongoose models
jest.mock('../models/Ticket');
jest.mock('../models/Employee');

// Mock swagger
jest.mock('../swagger.json', () => ({}), { virtual: true });

// In-memory storage for test data
let tickets = [];
let employees = [];

// Helper function to generate MongoDB-like ObjectId
const generateObjectId = () => {
  return new mongoose.Types.ObjectId().toString();
};

// Helper function to setup Ticket model mocks
const setupTicketMocks = () => {
  Ticket.prototype.save = jest.fn(function () {
    const ticket = {
      _id: generateObjectId(),
      status: this.status || 'Open',
      titel: this.titel,
      text: this.text,
      reviewDatum: this.reviewDatum || null,
      doneDatum: this.doneDatum || null,
      mitarbeiterId: this.mitarbeiterId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    tickets.push(ticket);
    Object.assign(this, ticket);
    return Promise.resolve(this);
  });

  Ticket.find = jest.fn(() => ({
    sort: jest.fn(() => Promise.resolve(tickets)),
  }));

  Ticket.findById = jest.fn((id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Cast to ObjectId failed');
      error.name = 'CastError';
      throw error;
    }
    const ticket = tickets.find((t) => t._id === id);
    return Promise.resolve(ticket || null);
  });

  Ticket.deleteMany = jest.fn(() => {
    tickets = [];
    return Promise.resolve();
  });

  Ticket.create = jest.fn((data) => {
    const ticket = {
      _id: generateObjectId(),
      status: data.status || 'Open',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    tickets.push(ticket);
    return Promise.resolve(ticket);
  });

  Ticket.mockImplementation(function (data) {
    this.status = data.status || 'Open';
    this.titel = data.titel;
    this.text = data.text;
    this.reviewDatum = data.reviewDatum || null;
    this.doneDatum = data.doneDatum || null;
    this.mitarbeiterId = data.mitarbeiterId;
    this.toJSON = function () {
      return {
        _id: this._id,
        status: this.status,
        titel: this.titel,
        text: this.text,
        reviewDatum: this.reviewDatum,
        doneDatum: this.doneDatum,
        mitarbeiterId: this.mitarbeiterId,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    };
    return this;
  });
};

// Helper function to setup Employee model mocks
const setupEmployeeMocks = () => {
  Employee.prototype.save = jest.fn(function () {
    const employee = {
      _id: generateObjectId(),
      vorname: this.vorname,
      nachname: this.nachname,
      beitrittsdatum: this.beitrittsdatum,
      skillLevel: this.skillLevel,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    employees.push(employee);
    Object.assign(this, employee);
    return Promise.resolve(this);
  });

  Employee.find = jest.fn(() => ({
    sort: jest.fn(() => Promise.resolve(employees)),
  }));

  Employee.findById = jest.fn((id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Cast to ObjectId failed');
      error.name = 'CastError';
      throw error;
    }
    const employee = employees.find((emp) => emp._id === id);
    return Promise.resolve(employee || null);
  });

  Employee.deleteMany = jest.fn(() => {
    employees = [];
    return Promise.resolve();
  });

  Employee.create = jest.fn((data) => {
    const employee = {
      _id: generateObjectId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    employees.push(employee);
    return Promise.resolve(employee);
  });

  Employee.mockImplementation(function (data) {
    this.vorname = data.vorname;
    this.nachname = data.nachname;
    this.beitrittsdatum = data.beitrittsdatum;
    this.skillLevel = data.skillLevel;
    this.toJSON = function () {
      return {
        _id: this._id,
        vorname: this.vorname,
        nachname: this.nachname,
        beitrittsdatum: this.beitrittsdatum,
        skillLevel: this.skillLevel,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    };
    return this;
  });
};

beforeAll(() => {
  setupTicketMocks();
  setupEmployeeMocks();
});

beforeEach(() => {
  tickets = [];
  employees = [];
  jest.clearAllMocks();
  setupTicketMocks();
  setupEmployeeMocks();
});

describe('Ticket API - User Story 3: Ticket erfassen', () => {
  let testEmployee;

  beforeEach(async () => {
    // Create a test employee
    testEmployee = await Employee.create({
      vorname: 'Max',
      nachname: 'Muster',
      beitrittsdatum: '2021-05-15',
      skillLevel: 4,
    });

    // Mock axios.get to simulate employee validation
    axios.get.mockResolvedValue({
      status: 200,
      data: testEmployee,
    });
  });

  // Abnahmekriterium 1: Can select status (Open, In Progress, Review, Done)
  it('should create a ticket with status "Open"', async () => {
    // Arrange
    const ticketData = {
      status: 'Open',
      titel: 'Test Ticket',
      text: 'This is a test ticket',
      mitarbeiterId: testEmployee._id.toString(),
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('Open');
  });

  it('should create tickets with all valid status values', async () => {
    const statuses = ['Open', 'In Progress', 'Review', 'Done'];

    for (const status of statuses) {
      // Arrange
      const ticketData = {
        status,
        titel: `Ticket ${status}`,
        text: 'Test ticket',
        mitarbeiterId: testEmployee._id.toString(),
      };

      // Act
      const res = await request(app).post('/api/tickets').send(ticketData);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe(status);
    }
  });

  // Abnahmekriterium 2: Can enter a title
  it('should create a ticket with a title', async () => {
    // Arrange
    const ticketData = {
      titel: 'Bug Fix Needed',
      text: 'Fix the login issue',
      mitarbeiterId: testEmployee._id.toString(),
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.body.titel).toBe('Bug Fix Needed');
  });

  // Abnahmekriterium 3: Can enter description text
  it('should create a ticket with text description', async () => {
    // Arrange
    const ticketData = {
      titel: 'Feature Request',
      text: 'Add dark mode to the application',
      mitarbeiterId: testEmployee._id.toString(),
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.body.text).toBe('Add dark mode to the application');
  });

  // Abnahmekriterium 4: Can enter reviewDatum (UTC)
  it('should create a ticket with reviewDatum when status is Review', async () => {
    // Arrange
    const reviewDate = new Date('2024-01-15T10:00:00Z');
    const ticketData = {
      status: 'Review',
      titel: 'Code Review',
      text: 'Review the new feature',
      reviewDatum: reviewDate,
      mitarbeiterId: testEmployee._id.toString(),
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(new Date(res.body.reviewDatum)).toEqual(reviewDate);
  });

  // Abnahmekriterium 5: Can enter doneDatum (UTC)
  it('should create a ticket with doneDatum when status is Done', async () => {
    // Arrange
    const doneDate = new Date('2024-01-20T15:30:00Z');
    const ticketData = {
      status: 'Done',
      titel: 'Completed Task',
      text: 'Task finished successfully',
      doneDatum: doneDate,
      reviewDatum: new Date('2024-01-18T10:00:00Z'),
      mitarbeiterId: testEmployee._id.toString(),
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(new Date(res.body.doneDatum)).toEqual(doneDate);
  });

  // Abnahmekriterium 6: Employee assignment is mandatory
  it('should reject ticket without employee assignment', async () => {
    // Arrange
    const ticketData = {
      titel: 'No Employee Ticket',
      text: 'This ticket has no employee',
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Mitarbeiter');
  });

  it('should validate employee exists via API call', async () => {
    // Arrange - Mock employee not found
    axios.get.mockRejectedValue({ response: { status: 404 } });

    const ticketData = {
      titel: 'Test Ticket',
      text: 'Test description',
      mitarbeiterId: new mongoose.Types.ObjectId().toString(),
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('nicht gefunden');
    expect(axios.get).toHaveBeenCalled();
  });

  // Abnahmekriterium 7: Validation for review and done dates based on status
  it('should reject reviewDatum when status is Open', async () => {
    // Arrange
    const ticketData = {
      status: 'Open',
      titel: 'Test Ticket',
      text: 'Test',
      reviewDatum: new Date(),
      mitarbeiterId: testEmployee._id.toString(),
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('reviewDatum');
  });

  it('should reject reviewDatum when status is In Progress', async () => {
    // Arrange
    const ticketData = {
      status: 'In Progress',
      titel: 'Test Ticket',
      text: 'Test',
      reviewDatum: new Date(),
      mitarbeiterId: testEmployee._id.toString(),
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('reviewDatum');
  });

  it('should accept reviewDatum when status is Review', async () => {
    // Arrange
    const ticketData = {
      status: 'Review',
      titel: 'Test Ticket',
      text: 'Test',
      reviewDatum: new Date(),
      mitarbeiterId: testEmployee._id.toString(),
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.body.reviewDatum).toBeDefined();
  });

  it('should accept reviewDatum when status is Done', async () => {
    // Arrange
    const ticketData = {
      status: 'Done',
      titel: 'Test Ticket',
      text: 'Test',
      reviewDatum: new Date(),
      doneDatum: new Date(),
      mitarbeiterId: testEmployee._id.toString(),
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.body.reviewDatum).toBeDefined();
  });

  it('should reject doneDatum when status is not Done', async () => {
    // Arrange
    const ticketData = {
      status: 'Review',
      titel: 'Test Ticket',
      text: 'Test',
      doneDatum: new Date(),
      mitarbeiterId: testEmployee._id.toString(),
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('doneDatum');
  });

  it('should accept doneDatum when status is Done', async () => {
    // Arrange
    const ticketData = {
      status: 'Done',
      titel: 'Test Ticket',
      text: 'Test',
      reviewDatum: new Date(),
      doneDatum: new Date(),
      mitarbeiterId: testEmployee._id.toString(),
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.body.doneDatum).toBeDefined();
  });

  // Abnahmekriterium 8: Display ticket with all details after creation
  it('should return ticket with all details after successful creation', async () => {
    // Arrange
    const ticketData = {
      status: 'In Progress',
      titel: 'Complete Feature',
      text: 'Implement user authentication',
      mitarbeiterId: testEmployee._id.toString(),
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('titel');
    expect(res.body).toHaveProperty('text');
    expect(res.body).toHaveProperty('mitarbeiterId');
    expect(res.body).toHaveProperty('createdAt');
  });

  // Abnahmekriterium 9: Clear error messages for invalid input
  it('should return clear error when titel is missing', async () => {
    // Arrange
    const ticketData = {
      text: 'Test description',
      mitarbeiterId: testEmployee._id.toString(),
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Titel');
  });

  it('should return clear error when text is missing', async () => {
    // Arrange
    const ticketData = {
      titel: 'Test Title',
      mitarbeiterId: testEmployee._id.toString(),
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Text');
  });

  it('should return clear error when employee ID is invalid', async () => {
    // Arrange - Mock employee not found
    axios.get.mockRejectedValue({ response: { status: 404 } });

    const ticketData = {
      titel: 'Test Ticket',
      text: 'Test description',
      mitarbeiterId: 'invalid-employee-id',
    };

    // Act
    const res = await request(app).post('/api/tickets').send(ticketData);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('Ticket API - Additional Tests', () => {
  it('should get all tickets', async () => {
    // Arrange - Create a test employee and mock axios
    const employee = await Employee.create({
      vorname: 'Test',
      nachname: 'User',
      beitrittsdatum: '2021-01-01',
      skillLevel: 3,
    });

    axios.get.mockResolvedValue({
      status: 200,
      data: employee,
    });

    // Create test tickets
    await request(app).post('/api/tickets').send({
      titel: 'Ticket 1',
      text: 'Description 1',
      mitarbeiterId: employee._id.toString(),
    });

    await request(app).post('/api/tickets').send({
      titel: 'Ticket 2',
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

  it('should return message when no tickets exist', async () => {
    // Act
    const res = await request(app).get('/api/tickets');

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Keine Tickets');
  });
});
