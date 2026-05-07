import { calculateAge, validateName, validatePrenom, validateEmail, validateDateOfBirth, validateVille, validateCodePostal, validateFormData, isAdult, isFrenchCodePostal, saveFormData, getFormData, clearFormData, handleSubmit } from './module';

let referenceDate = new Date(Date.now());

let birthDate17 = new Date(referenceDate.getFullYear() - 17, referenceDate.getMonth(), referenceDate.getDate());
let birthDate18 = new Date(referenceDate.getFullYear() - 18, referenceDate.getMonth(), referenceDate.getDate());


/**
 * @function calculateAge
 */
describe('calculateAge Unit Test Suites', () => {
  describe('valid data tests', () => {
    it('should return 17 for birthDate17', () => {
      expect(calculateAge(birthDate17)).toEqual(17);
    });

    it('should return 18 for birthDate18', () => {
      expect(calculateAge(birthDate18)).toEqual(18);
    });
  });

  describe('invalid data tests', () => {
    it('should not return 18 for birthDate17', () => {
      expect(calculateAge(birthDate17)).not.toEqual(18);
    });

    it('should throw a "missing param birthDate" error', () => {
      expect(() => calculateAge()).toThrow("missing param birthDate")
    })

    it('should throw a "birthDate is not a Date" error', () => {
      expect(() => calculateAge("not a Date")).toThrow("birthDate is not a Date")
    })

    it('should throw a "birthDate is not a valid Date" error', () => {
      expect(() => calculateAge(new Date("not a valid Date"))).toThrow("birthDate is not a valid Date")
    })
  });
});

/**
 * @function validateName
 */
describe('validateName Unit Test Suites', () => {
  describe('valid data tests', () => {
    it('should return "John" for "John"', () => {
      expect(validateName("John")).toEqual("John");
    });
  });

  describe('invalid data tests', () => {
    it('should throw a "name is required" error', () => {
      expect(() => validateName()).toThrow("name is required")
    })

    it('should throw a "name must be a string" error', () => {
      expect(() => validateName(123)).toThrow("name must be a string")
    })

    it('should throw a "name must be a valid name" error', () => {
      expect(() => validateName("John-123")).toThrow("name must be a valid name")
    })
  });
});

/**
 * @function validatePrenom
 */
describe('validatePrenom Unit Test Suites', () => {
  describe('valid data tests', () => {
    it('should return "Doe" for "Doe"', () => {
      expect(validatePrenom("Doe")).toEqual("Doe");
    });
  });

  describe('invalid data tests', () => {
    it('should throw a "prenom is required" error', () => {
      expect(() => validatePrenom()).toThrow("prenom is required")
    })

    it('should throw a "prenom must be a string" error', () => {
      expect(() => validatePrenom(123)).toThrow("prenom must be a string")
    })

    it('should throw a "prenom must be a valid prenom" error', () => {
      expect(() => validatePrenom("Doe-123")).toThrow("prenom must be a valid prenom")
    })
  });
});

/**
 * @function validateEmail
 */
describe('validateEmail Unit Test Suites', () => {
  describe('valid data tests', () => {
    it('should return "john.doe@example.com" for "john.doe@example.com"', () => {
      expect(validateEmail("john.doe@example.com")).toEqual("john.doe@example.com");
    });
  });

  describe('invalid data tests', () => {
    it('should throw a "email is required" error', () => {
      expect(() => validateEmail()).toThrow("email is required")
    })

    it('should throw a "email must be a string" error', () => {
      expect(() => validateEmail(123)).toThrow("email must be a string")
    })

    it('should throw a "email must be a valid email address" error', () => {
      expect(() => validateEmail("john.doe@example")).toThrow("email must be a valid email address")
    })
  });
});

/**
 * @function validateDateOfBirth
 */
describe('validateDateOfBirth Unit Test Suites', () => {
  describe('valid data tests', () => {
    it('should return "1990/01/01" for "1990/01/01"', () => {
      expect(validateDateOfBirth("1990/01/01")).toEqual("1990/01/01");
    });

    it('should return "1990-01-01" for "1990-01-01"', () => {
      expect(validateDateOfBirth("1990-01-01")).toEqual("1990-01-01");
    });

    it('should return personnalized date of birth for birthDate18', () => {
      expect(validateDateOfBirth(birthDate18.toISOString().split('T')[0])).toEqual(birthDate18.toISOString().split('T')[0]);
    });

    it('should return "01/01/1990" for "01/01/1990"', () => {
      expect(validateDateOfBirth("01/01/1990")).toEqual("01/01/1990");
    });

    it('should return "01-01-1990" for "01-01-1990"', () => {
      expect(validateDateOfBirth("01-01-1990")).toEqual("01-01-1990");
    });
  });

  describe('invalid data tests', () => {
    it('should throw a "date of birth is required" error', () => {
      expect(() => validateDateOfBirth()).toThrow("date of birth is required")
    })

    it('should throw a "date of birth must be a string" error', () => {
      expect(() => validateDateOfBirth(123)).toThrow("date of birth must be a string")
    })

    it('should throw a "date of birth must be a valid date" error', () => {
      expect(() => validateDateOfBirth("not a valid date")).toThrow("date of birth must be a valid date")
    })

    it('should throw a "date of birth must be at least 18 years old" error', () => {
      expect(() => validateDateOfBirth(birthDate17.toISOString().split('T')[0])).toThrow("date of birth must be at least 18 years old")
    })

    it('should throw for impossible calendar date "31/02/1990"', () => {
      expect(() => validateDateOfBirth("31/02/1990")).toThrow("date of birth must be a valid date");
    });
  });
});

/**
 * @function validateVille
 */
describe('validateVille Unit Test Suites', () => {
  describe('valid data tests', () => {
    it('should return "Paris" for "Paris"', () => {
      expect(validateVille("Paris")).toEqual("Paris");
    });
  });

  describe('invalid data tests', () => {
    it('should throw a "ville is required" error', () => {
      expect(() => validateVille()).toThrow("ville is required")
    })

    it('should throw a "ville must be a string" error', () => {
      expect(() => validateVille(123)).toThrow("ville must be a string")
    })

    it('should throw a "ville must be a valid ville" error', () => {
      expect(() => validateVille("Paris-123")).toThrow("ville must be a valid ville")
    })
  });
});

/**
 * @function validateCodePostal
 */
describe('validateCodePostal Unit Test Suites', () => {
  describe('valid data tests', () => {
    it('should return "75001" for "75001"', () => {
      expect(validateCodePostal("75001")).toEqual("75001");
    });

    it('should return "20200" for "20200" (Corse)', () => {
      expect(validateCodePostal("20200")).toEqual("20200");
    });

    it('should return "97400" for "97400" (DOM)', () => {
      expect(validateCodePostal("97400")).toEqual("97400");
    });

    it('should return "98800" for "98800" (TOM)', () => {
      expect(validateCodePostal("98800")).toEqual("98800");
    });
  });

  describe('invalid data tests', () => {
    it('should throw a "code postal is required" error', () => {
      expect(() => validateCodePostal()).toThrow("code postal is required")
    })

    it('should throw a "code postal must be a string" error', () => {
      expect(() => validateCodePostal(123)).toThrow("code postal must be a string")
    })

    it('should throw a "code postal must be a valid code postal" error', () => {
      expect(() => validateCodePostal("123456")).toThrow("code postal must be a valid code postal")
    });

    it('should throw a "code postal must be a valid code postal" error for 00123', () => {
      expect(() => validateCodePostal("00123")).toThrow("code postal must be a valid code postal")
    });

    it('should throw a "code postal must be a valid code postal" error for 96000', () => {
      expect(() => validateCodePostal("96000")).toThrow("code postal must be a valid code postal")
    });

    it('should throw a "code postal must be a valid code postal" error for 97900', () => {
      expect(() => validateCodePostal("97900")).toThrow("code postal must be a valid code postal")
    });

    it('should throw a "code postal must be a valid code postal" error for 2A000', () => {
      expect(() => validateCodePostal("2A000")).toThrow("code postal must be a valid code postal")
    });
  });
});

/**
 * @function validateFormData
 */
describe('validateFormData Unit Test Suites', () => {
  describe('valid data tests', () => {
    it('should return validated plain object data', () => {
      const formData = new FormData();
      formData.append('nom', "John");
      formData.append('prenom', "Doe");
      formData.append('email', "john.doe@example.com");
      formData.append('dateOfBirth', "1990/01/01");
      formData.append('ville', "Paris");
      formData.append('codePostal', "75001");
      expect(validateFormData(formData)).toEqual({
        nom: "John",
        prenom: "Doe",
        email: "john.doe@example.com",
        dateOfBirth: "1990/01/01",
        ville: "Paris",
        codePostal: "75001"
      });
    });

    it('should return validated plain object data for birthDate18', () => {
      const formData = new FormData();
      formData.append('nom', "John");
      formData.append('prenom', "Doe");
      formData.append('email', "john.doe@example.com");
      formData.append('dateOfBirth', birthDate18.toISOString().split('T')[0]);
      formData.append('ville', "Paris");
      formData.append('codePostal', "75001");
      expect(validateFormData(formData)).toEqual({
        nom: "John",
        prenom: "Doe",
        email: "john.doe@example.com",
        dateOfBirth: birthDate18.toISOString().split('T')[0],
        ville: "Paris",
        codePostal: "75001"
      });
    });
  });

  describe('invalid data tests', () => {
    it('should throw a "form data is required" error', () => {
      expect(() => validateFormData()).toThrow("form data is required")
    })

    it('should throw a "form data must be a FormData" error', () => {
      expect(() => validateFormData(123)).toThrow("form data must be a FormData")
    })
  });
});

/**
 * @function isFrenchCodePostal
 */
describe('isFrenchCodePostal Unit Test Suites', () => {
  it('should return true for metropolitan postal code', () => {
    expect(isFrenchCodePostal("75001")).toBe(true);
  });

  it('should return true for overseas postal code', () => {
    expect(isFrenchCodePostal("98800")).toBe(true);
  });

  it('should return false when value is not a string', () => {
    expect(isFrenchCodePostal(75001)).toBe(false);
  });
});

/**
 * @function localStorage helpers
 */
describe('localStorage helper Unit Test Suites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and retrieve form data', () => {
    const payload = { nom: "John", codePostal: "75001" };
    saveFormData(payload);
    expect(getFormData()).toEqual(payload);
  });

  it('should clear saved form data', () => {
    saveFormData({ nom: "John" });
    clearFormData();
    expect(localStorage.getItem('formData')).toBeNull();
  });

  it('should return null when no saved form data exists', () => {
    expect(getFormData()).toBeNull();
  });

  it('should throw when saved form data is not valid JSON', () => {
    localStorage.setItem('formData', "{invalid json");
    expect(() => getFormData()).toThrow("unable to parse saved form data");
  });

  it('should throw when localStorage setItem fails', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    expect(() => saveFormData({ nom: "John" })).toThrow("unable to save form data");

    setItemSpy.mockRestore();
  });
});

/**
 * @function handleSubmit
 */
describe('handleSubmit Unit Test Suites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should prevent default and save validated data in localStorage', () => {
    const form = document.createElement('form');
    form.innerHTML = `
      <input name="nom" value="John" />
      <input name="prenom" value="Doe" />
      <input name="email" value="john.doe@example.com" />
      <input name="dateOfBirth" value="1990/01/01" />
      <input name="ville" value="Paris" />
      <input name="codePostal" value="75001" />
    `;

    const fakeEvent = {
      target: form,
      preventDefault: jest.fn()
    };

    handleSubmit(fakeEvent);

    expect(fakeEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(getFormData()).toEqual({
      nom: "John",
      prenom: "Doe",
      email: "john.doe@example.com",
      dateOfBirth: "1990/01/01",
      ville: "Paris",
      codePostal: "75001"
    });
  });
});



