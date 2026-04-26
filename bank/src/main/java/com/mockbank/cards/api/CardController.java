package com.mockbank.cards.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.mockbank.cards.api.dto.CardResponse;
import com.mockbank.cards.api.dto.IssueCardRequest;
import com.mockbank.cards.api.dto.TopupRequest;
import com.mockbank.cards.service.CardService;

import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/admin", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @PostMapping(value = "/clients/{clientId}/cards", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CardResponse> issueCard(@PathVariable long clientId, @Valid @RequestBody IssueCardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cardService.issueCard(clientId, request));
    }

    @PostMapping(value = "/cards/{cardId}/topup", consumes = MediaType.APPLICATION_JSON_VALUE)
    public CardResponse topup(@PathVariable long cardId, @Valid @RequestBody TopupRequest request) {
        return cardService.topup(cardId, request);
    }
}
