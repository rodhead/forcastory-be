package com.hks.exception;

public class InvalidTenantIdException extends RuntimeException {
  public InvalidTenantIdException(String message) {
    super(message);
  }
}
