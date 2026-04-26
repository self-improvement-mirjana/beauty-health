package com.mockbank.cards.service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.mockbank.cards.api.dto.CardResponse;
import com.mockbank.cards.api.dto.IssueCardRequest;
import com.mockbank.cards.api.dto.TopupRequest;
import com.mockbank.cards.domain.VirtualCard;
import com.mockbank.cards.repo.VirtualCardRepository;
import com.mockbank.clients.domain.BankClient;
import com.mockbank.clients.repo.BankClientRepository;
import com.mockbank.common.money.MoneyResponse;

@Service
public class CardService {

    private final VirtualCardRepository cardRepo;
    private final BankClientRepository clientRepo;
    private final PasswordEncoder passwordEncoder;
    private static final SecureRandom RNG = new SecureRandom();

    public CardService(VirtualCardRepository cardRepo, BankClientRepository clientRepo, PasswordEncoder passwordEncoder) {
        this.cardRepo = cardRepo;
        this.clientRepo = clientRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public CardResponse issueCard(long clientId, IssueCardRequest req) {
        BankClient client = clientRepo.findById(clientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));
        String pan = generatePan();
        String cvv = String.format("%03d", RNG.nextInt(1000));
        String cvvHash = passwordEncoder.encode(cvv);
        LocalDate exp = LocalDate.now().plusMonths(req.expMonths());

        VirtualCard card = new VirtualCard(client, pan, cvvHash, req.holderName().toUpperCase(),
                BigDecimal.valueOf(req.initialBalance()), exp.getMonthValue(), exp.getYear());
        cardRepo.save(card);

        org.slf4j.LoggerFactory.getLogger(CardService.class)
                .info("Issued card PAN={} CVV={} for client={}", pan, cvv, clientId);

        return toResponse(card);
    }

    @Transactional
    public CardResponse topup(long cardId, TopupRequest req) {
        VirtualCard card = cardRepo.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));
        card.setBalance(card.getBalance().add(BigDecimal.valueOf(req.amount())));
        return toResponse(card);
    }

    private CardResponse toResponse(VirtualCard c) {
        return new CardResponse(c.getId(), c.getPanLast4(), c.getHolderName(),
                c.getExpMonth(), c.getExpYear(), MoneyResponse.rsd(c.getBalance()), c.getStatus(), c.getCreatedAt());
    }

    private String generatePan() {
        StringBuilder sb = new StringBuilder("4");
        for (int i = 1; i < 16; i++) sb.append(RNG.nextInt(10));
        return sb.toString();
    }
}
