package com.hks.config.tenant;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BaseService {

	private String tenantId;
	private Long userId;
	private Long coreUserId;
	private String displayName;
	private String locale;
	private String accessToken;
	private String serverName;
	
	public BaseService(String tenantId) {
		this.tenantId = tenantId;
	}
	
}
