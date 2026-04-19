package com.beautyhealth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan(basePackages = "com.beautyhealth.config")
public class BeautyHealthApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(BeautyHealthApiApplication.class, args);
	}

}
