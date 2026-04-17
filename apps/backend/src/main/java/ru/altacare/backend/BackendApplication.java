package ru.altacare.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;
import ru.altacare.backend.modules.notifications.config.FcmPushProperties;

@SpringBootApplication
@EnableScheduling
@ConfigurationPropertiesScan(basePackageClasses = FcmPushProperties.class)
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
