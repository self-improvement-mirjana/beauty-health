package com.beautyhealth.analytics.config;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class AnalyticsKafkaConfiguration {

    @Bean
    @ConditionalOnProperty(name = "app.analytics.kafka.enabled", havingValue = "true", matchIfMissing = true)
    ProducerFactory<String, String> analyticsProducerFactory(KafkaProperties kafkaProperties) {
        Map<String, Object> props = new HashMap<>(kafkaProperties.buildProducerProperties(null));
        props.putIfAbsent(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,
                org.apache.kafka.common.serialization.StringSerializer.class);
        props.putIfAbsent(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                org.apache.kafka.common.serialization.StringSerializer.class);
        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    @ConditionalOnProperty(name = "app.analytics.kafka.enabled", havingValue = "true", matchIfMissing = true)
    KafkaTemplate<String, String> analyticsKafkaTemplate(ProducerFactory<String, String> analyticsProducerFactory) {
        return new KafkaTemplate<>(analyticsProducerFactory);
    }
}
