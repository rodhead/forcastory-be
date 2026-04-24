package com.hks.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "tenant_details",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "property_key"}))
@Getter
@Setter
@NoArgsConstructor
public class TenantDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "property_key", nullable = false)
    private String propertyKey;

    @Column(name = "property_value")
    private String propertyValue;
}
