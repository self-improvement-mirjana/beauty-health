package com.mockbank.clients.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.mockbank.cards.api.dto.CardResponse;
import com.mockbank.cards.repo.VirtualCardRepository;
import com.mockbank.clients.api.dto.ClientResponse;
import com.mockbank.clients.api.dto.CreateClientRequest;
import com.mockbank.clients.domain.BankClient;
import com.mockbank.clients.repo.BankClientRepository;
import com.mockbank.common.money.MoneyResponse;

@Service
public class ClientService {

    private final BankClientRepository clientRepo;
    private final VirtualCardRepository cardRepo;

    public ClientService(BankClientRepository clientRepo, VirtualCardRepository cardRepo) {
        this.clientRepo = clientRepo;
        this.cardRepo = cardRepo;
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> listAll() {
        return clientRepo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ClientResponse getById(long id) {
        return toResponse(clientRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found")));
    }

    @Transactional
    public ClientResponse create(CreateClientRequest req) {
        if (clientRepo.findByEmail(req.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        BankClient client = new BankClient(req.fullName(), req.email(), req.taxId());
        clientRepo.save(client);
        return toResponse(client);
    }

    private ClientResponse toResponse(BankClient c) {
        List<CardResponse> cards = cardRepo.findByClient_Id(c.getId()).stream()
                .map(card -> new CardResponse(
                    card.getId(), card.getPanLast4(), card.getHolderName(),
                    card.getExpMonth(), card.getExpYear(),
                    MoneyResponse.rsd(card.getBalance()), card.getStatus(), card.getCreatedAt()
                )).toList();
        return new ClientResponse(c.getId(), c.getFullName(), c.getEmail(), c.getTaxId(), c.getStatus(), c.getCreatedAt(), cards);
    }
}
