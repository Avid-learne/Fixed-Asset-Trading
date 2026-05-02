package com.SehatVault.SehatVaultBackend.profitallocation.controller;

import com.SehatVault.SehatVaultBackend.profitallocation.dto.AllocationKpisDto;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.ExecuteProfitAllocationRequest;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.ExecuteProfitAllocationResponse;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.ProfitAllocationPreviewResponse;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.ProfitDistributionHistoryItemDto;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.ProfitableTradeDto;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.TradeDistributionPreviewDto;
import com.SehatVault.SehatVaultBackend.profitallocation.service.ProfitAllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profit-allocation")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProfitAllocationController {

    private final ProfitAllocationService profitAllocationService;

    @GetMapping("/preview")
    public ResponseEntity<?> getPreview(
            Authentication authentication,
            @RequestParam(required = false) BigDecimal totalProfit
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }

            ProfitAllocationPreviewResponse data = profitAllocationService
                    .getPreview(authentication.getName(), totalProfit);
            return ResponseEntity.ok(success("Preview generated", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error generating preview: " + e.getMessage()));
        }
    }

    @PostMapping("/distribute")
    public ResponseEntity<?> distribute(
            Authentication authentication,
            @RequestBody ExecuteProfitAllocationRequest request
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }

            ExecuteProfitAllocationResponse data = profitAllocationService
                    .distribute(authentication.getName(), request);
            return ResponseEntity.ok(success("Distribution completed", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error distributing profits: " + e.getMessage()));
        }
    }

    @GetMapping("/kpis")
    public ResponseEntity<?> kpis(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            AllocationKpisDto data = profitAllocationService.getKpis(authentication.getName());
            return ResponseEntity.ok(success("KPIs loaded", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error loading KPIs: " + e.getMessage()));
        }
    }

    @GetMapping("/profitable-trades")
    public ResponseEntity<?> profitableTrades(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            List<ProfitableTradeDto> data = profitAllocationService
                    .getProfitableTrades(authentication.getName());
            return ResponseEntity.ok(success("Profitable trades loaded", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error loading profitable trades: " + e.getMessage()));
        }
    }

    @GetMapping("/trade/{tradeId}/preview")
    public ResponseEntity<?> tradePreview(Authentication authentication, @PathVariable UUID tradeId) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            TradeDistributionPreviewDto data = profitAllocationService
                    .getTradePreview(authentication.getName(), tradeId);
            return ResponseEntity.ok(success("Trade preview generated", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error generating trade preview: " + e.getMessage()));
        }
    }

    @PostMapping("/trade/{tradeId}/distribute")
    public ResponseEntity<?> distributeTrade(Authentication authentication, @PathVariable UUID tradeId) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            ExecuteProfitAllocationResponse data = profitAllocationService
                    .distributeTradeProfit(authentication.getName(), tradeId);
            return ResponseEntity.ok(success("Trade distribution completed", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error distributing trade profit: " + e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> history(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }

            List<ProfitDistributionHistoryItemDto> data = profitAllocationService.getHistory(authentication.getName());
            return ResponseEntity.ok(success("History loaded", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error loading history: " + e.getMessage()));
        }
    }

    private Map<String, Object> success(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
