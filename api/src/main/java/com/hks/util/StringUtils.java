package com.hks.util;

public final class StringUtils {

    private StringUtils() {}

    public static boolean isBlankOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    public static String getStatus(boolean status) {
        return status ? "ACTIVE" : "INACTIVE";
    }

    public static boolean getStatus(String status) {
        return "ACTIVE".equalsIgnoreCase(status);
    }

    public static String getRowsProcessedMsg(int rows, int totalRows) {
        return String.format("%d/%d rows processed", rows, totalRows);
    }

    public static String getRowsValidationMsg(int rows, int totalRows) {
        return String.format("%d/%d rows data validation error", rows, totalRows);
    }
}
