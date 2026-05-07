

/**
 * Calculate a person's age in years.
 * 
 * @param {Date} birthDate - The birth date of the person.
 * @returns {Number} - The age in years of the person.
 */
function calculateAge(birthDate) {
    if (!birthDate) {
        throw new Error("missing param birthDate");
    }
    if (!(birthDate instanceof Date)) {
        throw new Error("birthDate is not a Date");
    }
    if (isNaN(birthDate.getTime())) {
        throw new Error("birthDate is not a valid Date");
    }
    let dateDiff = new Date(Date.now() - birthDate.getTime());
    let age = Math.abs(dateDiff.getUTCFullYear() - 1970);
    return age;
}

/**
 * Validate the name string.
 * 
 * @param {String} name - The name string to validate.
 * @returns {String} - The validated name string.
 */
function validateName(name) {
    if (!name) {
        throw new Error("name is required");
    }
    if (typeof name !== 'string') {
        throw new Error("name must be a string");
    }
    const trimmedName = name.trim();
    if (!trimmedName.match(/^[\p{L}]+(?:[-' ][\p{L}]+)*$/u)) {
        throw new Error("name must be a valid name");
    }
    return trimmedName;
}

/**
 * Validate the prenom string.
 * 
 * @param {String} prenom - The prenom string to validate.
 * @returns {String} - The validated prenom string.
 */
function validatePrenom(prenom) {
    if (!prenom) {
        throw new Error("prenom is required");
    }
    if (typeof prenom !== 'string') {
        throw new Error("prenom must be a string");
    }
    const trimmedPrenom = prenom.trim();
    if (!trimmedPrenom.match(/^[\p{L}]+(?:[-' ][\p{L}]+)*$/u)) {
        throw new Error("prenom must be a valid prenom");
    }
    return trimmedPrenom;
}

/**
 * Validate the email string.
 * 
 * @param {String} email - The email string to validate.
 * @returns {String} - The validated email string.
 */
function validateEmail(email) {
    if (!email) {
        throw new Error("email is required");
    }
    if (typeof email !== 'string') {
        throw new Error("email must be a string");
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error("email must be a valid email address");
    }
    return trimmedEmail;
}

/**
 * Validate the date of birth string.
 * 
 * @param {String} dateOfBirth - The date of birth string to validate.
 * @returns {String} - The validated date of birth string.
 */
function validateDateOfBirth(dateOfBirth) {
    if (!dateOfBirth) {
        throw new Error("date of birth is required");
    }
    if (typeof dateOfBirth !== 'string') {
        throw new Error("date of birth must be a string");
    }
    const trimmedDateOfBirth = dateOfBirth.trim();
    const parsedDate = parseDateOfBirth(trimmedDateOfBirth);
    if (!parsedDate) {
        throw new Error("date of birth must be a valid date");
    }
    if (!isAdult(parsedDate)) {
        throw new Error("date of birth must be at least 18 years old");
    }
    return trimmedDateOfBirth;
}

/**
 * Validate the ville string.
 * 
 * @param {String} ville - The ville string to validate.
 * @returns {String} - The validated ville string.
 */
function validateVille(ville) {
    if (!ville) {
        throw new Error("ville is required");
    }
    if (typeof ville !== 'string') {
        throw new Error("ville must be a string");
    }
    const trimmedVille = ville.trim();
    if (!trimmedVille.match(/^[\p{L}]+(?:[-' ][\p{L}]+)*$/u)) {
        throw new Error("ville must be a valid ville");
    }
    return trimmedVille;
}

/**
 * Validate the code postal string.
 * 
 * @param {String} codePostal - The code postal string to validate.
 * @returns {String} - The validated code postal string.
 */
function validateCodePostal(codePostal) {
    if (!codePostal) {
        throw new Error("code postal is required");
    }
    if (typeof codePostal !== 'string') {
        throw new Error("code postal must be a string");
    }
    const trimmedCodePostal = codePostal.trim();
    if (!isFrenchCodePostal(trimmedCodePostal)) {
        throw new Error("code postal must be a valid code postal");
    }
    return trimmedCodePostal;
}

/**
 * Validate the form data object.
 * 
 * @param {FormData} formData - The form data object to validate.
 * @returns {Object} - The validated form data object.
 */
function validateFormData(formData) {
    if (!formData) {
        throw new Error("form data is required");
    }
    if (!(formData instanceof FormData)) {
        throw new Error("form data must be a FormData");
    }
    const data = Object.fromEntries(formData);
    return {
        nom: validateName(data.nom),
        prenom: validatePrenom(data.prenom),
        email: validateEmail(data.email),
        dateOfBirth: validateDateOfBirth(data.dateOfBirth),
        ville: validateVille(data.ville),
        codePostal: validateCodePostal(data.codePostal)
    };
}

/**
 * Check if the date of birth string is an adult.
 * 
 * @param {Date} dateOfBirth - The date of birth to check.
 * @returns {Boolean} - True if the date of birth string is an adult, false otherwise.
 */
function isAdult(dateOfBirth) {
    const age = calculateAge(dateOfBirth);
    return age >= 18;
}

/**
 * Parse date of birth from supported formats:
 * YYYY-MM-DD, YYYY/MM/DD, DD/MM/YYYY, DD-MM-YYYY.
 *
 * @param {String} rawDateOfBirth - The date string to parse.
 * @returns {Date|null} - Parsed date if valid, otherwise null.
 */
function parseDateOfBirth(rawDateOfBirth) {
    const dateOfBirth = rawDateOfBirth.trim();

    const yearFirstMatch = dateOfBirth.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
    if (yearFirstMatch) {
        return buildValidDate(
            Number(yearFirstMatch[1]),
            Number(yearFirstMatch[2]),
            Number(yearFirstMatch[3])
        );
    }

    const dayFirstMatch = dateOfBirth.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
    if (dayFirstMatch) {
        return buildValidDate(
            Number(dayFirstMatch[3]),
            Number(dayFirstMatch[2]),
            Number(dayFirstMatch[1])
        );
    }

    return null;
}

/**
 * Build a date and ensure day/month/year are real.
 *
 * @param {Number} year - Year component.
 * @param {Number} month - Month component (1-12).
 * @param {Number} day - Day component (1-31).
 * @returns {Date|null} - Date when valid, otherwise null.
 */
function buildValidDate(year, month, day) {
    const date = new Date(year, month - 1, day);
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }
    return date;
}

/**
 * Check if the code postal is a valid French code postal.
 * 
 * @param {String} codePostal - The code postal string to check.
 * @returns {Boolean} - True if the code postal is a valid French code postal, false otherwise.
 */
function isFrenchCodePostal(codePostal) {
    if (typeof codePostal !== 'string') {
        return false;
    }

    const trimmedCodePostal = codePostal.trim();

    // Metropolitan France (01-95), including Corsica postal codes (20xxx).
    const metropolitanPattern = /^(?:0[1-9]|[1-8]\d|9[0-5])\d{3}$/;
    // Overseas departments/collectivities (971-978, 984-989).
    const overseasPattern = /^(?:97[1-8]|98[4-9])\d{2}$/;

    return metropolitanPattern.test(trimmedCodePostal) || overseasPattern.test(trimmedCodePostal);
}

/**
 * Save the form data object to localStorage.
 * 
 * @param {Object} formData - The form data object to save.
 */
function saveFormData(formData) {
    try {
        localStorage.setItem('formData', JSON.stringify(formData));
    } catch (error) {
        throw new Error("unable to save form data");
    }
}

/**
 * Get the form data object from localStorage.
 * 
 * @returns {Object} - The form data object.
 */
function getFormData() {
    const rawFormData = localStorage.getItem('formData');
    if (!rawFormData) {
        return null;
    }
    try {
        return JSON.parse(rawFormData);
    } catch (error) {
        throw new Error("unable to parse saved form data");
    }
}

/**
 * Clear the form data object from localStorage.
 */
function clearFormData() {
    localStorage.removeItem('formData');
}

/**
 * Handle the form submission event.
 * 
 * @param {Event} e - The form submission event.
 */
function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const validatedData = validateFormData(formData);
    saveFormData(validatedData);
}

export { calculateAge, validateName, validatePrenom, validateEmail, validateDateOfBirth, validateVille, validateCodePostal, validateFormData, isAdult, isFrenchCodePostal, saveFormData, getFormData, clearFormData, handleSubmit };
