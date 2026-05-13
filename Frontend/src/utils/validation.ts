export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

export const validateCitizenId = (citizenId: string): boolean => {
  const re = /^[0-9]{12}$/;
  return re.test(citizenId);
};
