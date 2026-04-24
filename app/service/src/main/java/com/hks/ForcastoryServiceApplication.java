package com.hks;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;
import org.springframework.scheduling.annotation.EnableAsync;

@Slf4j
@SpringBootApplication(
        scanBasePackages = "com.hks"
)
@PropertySource(value = "classpath:git.properties", ignoreResourceNotFound = true)
@EnableAsync
public class ForcastoryServiceApplication {

    public static void main(String... args){
        SpringApplication.run(
                ForcastoryServiceApplication.class,
                args
        );
    }
}
