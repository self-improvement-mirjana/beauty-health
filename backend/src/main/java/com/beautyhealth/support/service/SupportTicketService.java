
@Service
public class SupportTicketService {

    //SupportTicketRepository  repo = new SupportTicketRepository()
// 
// findById
// create
// save (update)
// .delete 

//  @Autowired 
//  SupportTicketRepository supportTicketRepository;

private final SupportTicketRepository supportTicketRepository;

public SupportTicketService(SupportTicketRepository supportTicketRepository) {
    this.supportTicketRepository = supportTicketRepository; 
}

//  supportTicketRepository.create
//  .findById(1)
}