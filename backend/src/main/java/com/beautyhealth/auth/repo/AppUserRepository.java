package com.beautyhealth.auth.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.beautyhealth.auth.domain.AppUser;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    boolean existsByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = "roles")
    Optional<AppUser> findByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = "roles")
    @Query("select u from AppUser u where u.id = :id")
    Optional<AppUser> findDetailedById(@Param("id") Long id);
}
