package backend.config;

import backend.entity.Role;
import backend.enums.RoleType;
import backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner loadRoles(RoleRepository roleRepository) {
        return args -> {
            for (RoleType roleType : RoleType.values()) {
                roleRepository.findByRoleName(roleType)
                        .orElseGet(() -> roleRepository.save(new Role(roleType)));
            }
        };
    }
}