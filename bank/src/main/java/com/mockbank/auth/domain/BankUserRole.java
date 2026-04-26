package com.mockbank.auth.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "bank_user_role")
public class BankUserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private BankUser user;

    @Column(name = "role_name", nullable = false, length = 64)
    private String roleName;

    protected BankUserRole() {}

    public BankUserRole(BankUser user, String roleName) {
        this.user = user;
        this.roleName = roleName;
    }

    public Long getId() { return id; }
    public String getRoleName() { return roleName; }
}
