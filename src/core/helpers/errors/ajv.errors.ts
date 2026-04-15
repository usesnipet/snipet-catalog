export class AjvValidationFailedError extends Error {
  code = "AJV_VALIDATION_FAILED";

  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = "AjvValidationFailedError";
  }
}

export class AjvEncryptionError extends Error {
  code = "AJV_ENCRYPTION_ERROR";

  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "AjvEncryptionError";
  }
}

export class AjvDecryptionError extends Error {
  code = "AJV_DECRYPTION_ERROR";

  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "AjvDecryptionError";
  }
}

