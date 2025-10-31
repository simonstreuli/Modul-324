const request = require('supertest');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const app = require('../index');

// Mock axios to prevent actual HTTP calls during tests
jest.mock('axios');

// Mock mongoose Employee model
jest.mock('../models/Employee');

// Mock swagger
jest.mock('../swagger.json', () => ({}), { virtual: true });

// In-memory storage for test data
let employees = [];

// Helper function to generate MongoDB-like ObjectId
const generateObjectId = () => {
  return new mongoose.Types.ObjectId().toString();
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
  setupEmployeeMocks();
});

beforeEach(() => {
  employees = [];
  jest.clearAllMocks();
  setupEmployeeMocks();
});

describe('Employee API - User Story 1 & 2', () => {
  describe('POST /api/employees - User Story 1: Mitarbeiter erfassen', () => {
    // Abnahmekriterium 1-5, 7: Create employee with all required fields
    it('should create an employee with vorname, nachname, beitrittsdatum, and skillLevel', async () => {
      // Arrange
      const employeeData = {
        vorname: 'Max',
        nachname: 'Muster',
        beitrittsdatum: '2021-05-15',
        skillLevel: 4,
      };

      // Act
      const res = await request(app).post('/api/employees').send(employeeData);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.vorname).toBe('Max');
      expect(res.body.nachname).toBe('Muster');
      expect(res.body.skillLevel).toBe(4);
    });

    // Abnahmekriterium 5: Unique ID is generated automatically
    it('should automatically generate a unique ID for each employee', async () => {
      // Arrange
      const employee1 = {
        vorname: 'Anna',
        nachname: 'Schmidt',
        beitrittsdatum: '2020-03-10',
        skillLevel: 3,
      };
      const employee2 = {
        vorname: 'Peter',
        nachname: 'Müller',
        beitrittsdatum: '2022-01-20',
        skillLevel: 5,
      };

      // Act
      const res1 = await request(app).post('/api/employees').send(employee1);
      const res2 = await request(app).post('/api/employees').send(employee2);

      // Assert
      expect(res1.body._id).toBeDefined();
      expect(res2.body._id).toBeDefined();
      expect(res1.body._id).not.toBe(res2.body._id);
    });

    // Abnahmekriterium 6: Validation for skillLevel range (1-5)
    it('should reject skillLevel less than 1', async () => {
      // Arrange
      const employeeData = {
        vorname: 'Max',
        nachname: 'Muster',
        beitrittsdatum: '2021-05-15',
        skillLevel: 0,
      };

      // Act
      const res = await request(app).post('/api/employees').send(employeeData);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain(
        'Skilllevel muss eine ganze Zahl zwischen 1 und 5 sein'
      );
    });

    it('should reject skillLevel greater than 5', async () => {
      // Arrange
      const employeeData = {
        vorname: 'Max',
        nachname: 'Muster',
        beitrittsdatum: '2021-05-15',
        skillLevel: 6,
      };

      // Act
      const res = await request(app).post('/api/employees').send(employeeData);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain(
        'Skilllevel muss eine ganze Zahl zwischen 1 und 5 sein'
      );
    });

    it('should accept skillLevel values 1 through 5', async () => {
      // Test all valid values
      for (let skillLevel = 1; skillLevel <= 5; skillLevel++) {
        // Arrange
        const employeeData = {
          vorname: 'Test',
          nachname: `User${skillLevel}`,
          beitrittsdatum: '2021-05-15',
          skillLevel,
        };

        // Act
        const res = await request(app)
          .post('/api/employees')
          .send(employeeData);

        // Assert
        expect(res.statusCode).toBe(201);
        expect(res.body.skillLevel).toBe(skillLevel);
      }
    });

    // Abnahmekriterium 8: Clear error messages for invalid input
    it('should return clear error message when vorname is missing', async () => {
      // Arrange
      const employeeData = {
        nachname: 'Muster',
        beitrittsdatum: '2021-05-15',
        skillLevel: 4,
      };

      // Act
      const res = await request(app).post('/api/employees').send(employeeData);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Vorname');
    });

    it('should return clear error message when nachname is missing', async () => {
      // Arrange
      const employeeData = {
        vorname: 'Max',
        beitrittsdatum: '2021-05-15',
        skillLevel: 4,
      };

      // Act
      const res = await request(app).post('/api/employees').send(employeeData);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Nachname');
    });

    it('should return clear error message when beitrittsdatum is missing', async () => {
      // Arrange
      const employeeData = {
        vorname: 'Max',
        nachname: 'Muster',
        skillLevel: 4,
      };

      // Act
      const res = await request(app).post('/api/employees').send(employeeData);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Beitrittsdatum');
    });

    it('should return clear error message when skillLevel is missing', async () => {
      // Arrange
      const employeeData = {
        vorname: 'Max',
        nachname: 'Muster',
        beitrittsdatum: '2021-05-15',
      };

      // Act
      const res = await request(app).post('/api/employees').send(employeeData);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Skilllevel');
    });
  });

  describe('GET /api/employees - User Story 2: Alle Mitarbeiter auslesen', () => {
    // Abnahmekriterium 1, 2: Get all employees with all fields
    it('should return all employees with all fields', async () => {
      // Arrange - Create test employees
      const employees = [
        {
          vorname: 'Max',
          nachname: 'Muster',
          beitrittsdatum: '2021-05-15',
          skillLevel: 4,
        },
        {
          vorname: 'Anna',
          nachname: 'Schmidt',
          beitrittsdatum: '2020-03-10',
          skillLevel: 3,
        },
      ];

      for (const emp of employees) {
        await request(app).post('/api/employees').send(emp);
      }

      // Act
      const res = await request(app).get('/api/employees');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);

      // Verify all fields are returned
      res.body.forEach((employee) => {
        expect(employee).toHaveProperty('_id');
        expect(employee).toHaveProperty('vorname');
        expect(employee).toHaveProperty('nachname');
        expect(employee).toHaveProperty('beitrittsdatum');
        expect(employee).toHaveProperty('skillLevel');
      });
    });

    // Abnahmekriterium 3: List is structured and clear
    it('should return employees in a structured format', async () => {
      // Arrange
      const employeeData = {
        vorname: 'Max',
        nachname: 'Muster',
        beitrittsdatum: '2021-05-15',
        skillLevel: 4,
      };

      await request(app).post('/api/employees').send(employeeData);

      // Act
      const res = await request(app).get('/api/employees');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    // Abnahmekriterium 4: Works with large number of employees
    it('should handle large number of employees without delays', async () => {
      // Arrange - Create multiple employees
      const createPromises = [];
      for (let i = 0; i < 50; i++) {
        createPromises.push(
          request(app)
            .post('/api/employees')
            .send({
              vorname: `Vorname${i}`,
              nachname: `Nachname${i}`,
              beitrittsdatum: '2021-05-15',
              skillLevel: (i % 5) + 1,
            })
        );
      }
      await Promise.all(createPromises);

      // Act
      const startTime = Date.now();
      const res = await request(app).get('/api/employees');
      const duration = Date.now() - startTime;

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(50);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    // Abnahmekriterium 5: Message when no employees exist
    it('should return appropriate message when no employees exist', async () => {
      // Act
      const res = await request(app).get('/api/employees');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Keine Mitarbeiter');
      expect(res.body.employees).toEqual([]);
    });

    // Abnahmekriterium 6: Clear error messages for faulty queries
    it('should return clear error for invalid employee ID', async () => {
      // Act
      const res = await request(app).get('/api/employees/invalid-id');

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Ungültige Mitarbeiter-ID');
    });

    it('should return 404 for non-existent employee ID', async () => {
      // Arrange - Valid MongoDB ID format but non-existent
      const fakeId = new mongoose.Types.ObjectId();

      // Act
      const res = await request(app).get(`/api/employees/${fakeId}`);

      // Assert
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toContain('nicht gefunden');
    });
  });
});
