package com.hks.service.localization;

import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {
	
	private final MessageSource messageSource;
	
	public String get(String code, Object... args) {
		Locale locale = LocaleContextHolder.getLocale();
		return messageSource.getMessage(code, args, code, locale);
	}
	
	public String getOrDefault(String code, String defaultMessage, Object... args) {
		Locale locale = LocaleContextHolder.getLocale();
		return messageSource.getMessage(code, args, defaultMessage, locale);
	}
	
	public String getWithLocale(String code, Locale locale, Object... args) {
		return messageSource.getMessage(code,  args, code, locale);
	}

}
