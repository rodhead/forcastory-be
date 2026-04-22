package com.hks.service.localization;

import java.text.MessageFormat;
import java.util.Locale;

import org.springframework.context.support.ResourceBundleMessageSource;

public class PseudoLocaleMessageSource extends ResourceBundleMessageSource {
	
	@Override
	protected String resolveCodeWithoutArguments(String code, Locale locale) {
		String message = super.resolveCodeWithoutArguments(code, locale);
		
		// Apply pseudo-localization for "en-ZZ" locale
		if("en-ZZ".equalsIgnoreCase(locale.toLanguageTag()) && message != null) {
			return pseudolocalize(message);
		}
		
		return message;
	}
	

	@Override
	protected MessageFormat resolveCode(String code, Locale locale) {
		String message = resolveCodeWithoutArguments(code, locale);
		
		// Return a MessageFormat or a default fallback MessageFormat
		if(message != null) {
			return new MessageFormat(message, locale);
		}
		
		return new MessageFormat(code, locale);
	}
	
	private String pseudolocalize(String message) {
		return "[" + message + "]";
	}

}
