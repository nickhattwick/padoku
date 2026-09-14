const parseEmailSet = (value: string | undefined): Set<string> => {
  if (!value) {
    return new Set();
  }

  return new Set(
    value
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
};

export const getAllowedEmails = (): Set<string> => {
  return parseEmailSet(process.env.PADOKU_ALLOWED_EMAILS || process.env.ALLOWED_EMAILS);
};

export const getAdminEmails = (): Set<string> => {
  return parseEmailSet(process.env.PADOKU_ADMIN_EMAILS || process.env.ADMIN_EMAILS);
};

export const getMigrationEmails = (): Set<string> => {
  return parseEmailSet(process.env.PADOKU_MIGRATION_EMAILS || process.env.MIGRATION_EMAILS);
};

export const getDevUserEmail = (): string => {
  return (process.env.PADOKU_DEV_USER_EMAIL || process.env.DEV_USER_EMAIL || '').trim().toLowerCase();
};

export const hasConfiguredEmail = (emails: Set<string>, email: string): boolean => {
  return emails.has(email.trim().toLowerCase());
};
