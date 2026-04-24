package com.hks.exception;

public class JsonConversionException extends RuntimeException {
  public JsonConversionException(String message, Throwable cause) {
    super(message, cause);
  }
}