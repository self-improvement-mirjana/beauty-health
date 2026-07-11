
@Entity
@Table("support_ticket")
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @OneToOne
    // @OneToMany
    // @ManyToMany
     @ManyToOne
     @JoinColumn(name = "user_id")
    private User     user;  
    // private List<User> users;


}