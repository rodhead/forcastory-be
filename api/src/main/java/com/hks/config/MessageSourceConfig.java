/**
 * 
 */
package com.hks.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.hks.service.localization.PseudoLocaleMessageSource;

/**
 * Author: Misbah Ur Rahman
 * Email:
 * Created on: 
 * Description:
 * 
 */
@Profile("service")
@Configuration
public class MessageSourceConfig {
	
	@Value("locales/messages")
	private String baseName;
	
	@Value("UTF-8")
	private String encoding;
	
	@Value("true")
	private boolean useCodeAsDefaultMessage;
	
	@Bean
	public MessageSource messageSource() {
		PseudoLocaleMessageSource messageSource = new PseudoLocaleMessageSource();
		messageSource.setBasename(baseName);
		messageSource.setDefaultEncoding(encoding);
		messageSource.setUseCodeAsDefaultMessage(useCodeAsDefaultMessage);
		return messageSource;
	}

}
