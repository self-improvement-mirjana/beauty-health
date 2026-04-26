package com.mockbank.clients.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.mockbank.clients.api.dto.ClientResponse;
import com.mockbank.clients.api.dto.CreateClientRequest;
import com.mockbank.clients.service.ClientService;

import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/admin/clients", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    public List<ClientResponse> list() {
        return clientService.listAll();
    }

    @GetMapping("/{id}")
    public ClientResponse get(@PathVariable long id) {
        return clientService.getById(id);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ClientResponse> create(@Valid @RequestBody CreateClientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clientService.create(request));
    }
}
