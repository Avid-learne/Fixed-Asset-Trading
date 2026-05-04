package com.SehatVault.SehatVaultBackend.dashboard.service;

import com.SehatVault.SehatVaultBackend.dashboard.dto.AssetPricesDto;
import com.SehatVault.SehatVaultBackend.wallet.service.TokenPriceService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssetPricingService {

    private final TokenPriceService tokenPriceService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${pricing.gold-api-url}")
    private String goldApiUrl;

    @Value("${pricing.silver-api-url}")
    private String silverApiUrl;

    @Value("${pricing.gold-api-key}")
    private String goldApiKey;

    @Value("${pricing.exchange-api-url}")
    private String exchangeApiUrl;

    @Value("${pricing.exchange-api-key}")
    private String exchangeApiKey;

    @Value("${pricing.cache-duration-minutes:5}")
    private long cacheDurationMinutes;

    // Cache structure: key -> {price, timestamp}
    private final Map<String, CacheEntry> priceCache = new HashMap<>();

    private static class CacheEntry {
        double price;
        long timestamp;

        CacheEntry(double price, long timestamp) {
            this.price = price;
            this.timestamp = timestamp;
        }

        boolean isExpired(long cacheDurationMs) {
            return System.currentTimeMillis() - timestamp > cacheDurationMs;
        }
    }

    public AssetPricesDto getLiveAssetPrices() {
        try {
            double exchangeRate = getUsdToPkrRate();
            double goldPricePkr = getMetalPriceInPkr("gold", goldApiUrl, exchangeRate);
            double silverPricePkr = getMetalPriceInPkr("silver", silverApiUrl, exchangeRate);
            double tokenPricePkr = tokenPriceService.getHtPricePkr().doubleValue();
            System.out.println("Fetched live asset prices: goldPricePerGram=" + goldPricePkr + " PKR, silverPricePerGram=" + silverPricePkr + " PKR, tokenPricePerPkr=" + tokenPricePkr + " PKR");

            AssetPricesDto result = new AssetPricesDto(goldPricePkr, silverPricePkr, tokenPricePkr);
            log.info("Backend returning live asset prices: goldPricePerGram={} PKR, silverPricePerGram={} PKR, tokenPricePerPkr={} PKR", 
                     goldPricePkr, silverPricePkr, tokenPricePkr);
            return result;
        } catch (Exception ex) {
            log.error("Error fetching live asset prices: {}", ex.getMessage(), ex);
            // Return null or throw - controller will handle as needed
            throw new RuntimeException("Unable to fetch current asset prices. Please try again later.", ex);
        }
    }

    private double getMetalPriceInPkr(String metalName, String apiUrl, double exchangeRate) {
        long cacheDurationMs = cacheDurationMinutes * 60 * 1000;
        CacheEntry cached = priceCache.get(metalName);

        if (cached != null && !cached.isExpired(cacheDurationMs)) {
            log.debug("Using cached {} price: {}", metalName, cached.price);
            return cached.price;
        }

        double priceUsd = fetchMetalPriceUsd(metalName, apiUrl);
        // Price from API is per troy ounce, convert to per gram (1 troy ounce = 31.1035 grams)
        double pricePerGramUsd = priceUsd / 31.1035;
        double pricePkr = pricePerGramUsd * exchangeRate;

        priceCache.put(metalName, new CacheEntry(pricePkr, System.currentTimeMillis()));
        log.info("Fetched and cached {} price: USD {} per troy oz -> {} PKR per gram", metalName, priceUsd, pricePkr);

        return pricePkr;
    }

    private double fetchMetalPriceUsd(String metalName, String apiUrl) {
        try {
            // Gold API requires API key as header, not query parameter
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-access-token", goldApiKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            log.debug("Fetching {} price from: {}", metalName, apiUrl);

            ResponseEntity<JsonNode> responseEntity = restTemplate.exchange(apiUrl, HttpMethod.GET, entity, JsonNode.class);
            JsonNode response = responseEntity.getBody();
            
            log.info("Raw API response for {} live rate fetch: {}", metalName, response);
            if (response == null) {
                throw new IllegalStateException("Empty response from " + metalName + " price API");
            }

            Double price = extractMetalPrice(response, metalName);
            if (price == null || price <= 0) {
                throw new IllegalStateException("Invalid " + metalName + " price from API");
            }

            return price;
        } catch (Exception ex) {
            log.error("Failed to fetch {} price: {}", metalName, ex.getMessage());
            throw new RuntimeException("Failed to fetch " + metalName + " price", ex);
        }
    }

    private double getUsdToPkrRate() {
        long cacheDurationMs = cacheDurationMinutes * 60 * 1000;
        CacheEntry cached = priceCache.get("exchange_rate");

        if (cached != null && !cached.isExpired(cacheDurationMs)) {
            log.debug("Using cached exchange rate: {}", cached.price);
            return cached.price;
        }

        try {
            String url = exchangeApiUrl + "?apikey=" + exchangeApiKey;
            log.debug("Fetching USD to PKR exchange rate from: {}", url);

            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            if (response == null || !response.has("rates")) {
                throw new IllegalStateException("Invalid response from exchange rate API");
            }

            JsonNode rates = response.get("rates");
            if (!rates.has("PKR")) {
                throw new IllegalStateException("PKR rate not found in exchange API response");
            }

            double rate = rates.get("PKR").asDouble();
            if (rate <= 0) {
                throw new IllegalStateException("Invalid PKR exchange rate");
            }

            priceCache.put("exchange_rate", new CacheEntry(rate, System.currentTimeMillis()));
            log.info("Fetched and cached USD to PKR rate: {}", rate);

            return rate;
        } catch (Exception ex) {
            log.error("Failed to fetch exchange rate: {}", ex.getMessage());
            throw new RuntimeException("Failed to fetch USD to PKR exchange rate", ex);
        }
    }

    private Double extractMetalPrice(JsonNode node, String metalName) {
        if (node == null || node.isNull()) {
            return null;
        }

        // Gold-API returns: { "timestamp": "...", "metal": "XAU/XAG", "price": 123.45, ... }
        if (node.has("price")) {
            Double price = node.get("price").asDouble();
            if (price != null && price > 0) {
                return price;
            }
        }

        // Fallback for alternative response structures
        for (String key : List.of("price", "rate", "value", "spot", metalName, metalName + "Price")) {
            if (node.has(key)) {
                JsonNode priceNode = node.get(key);
                if (priceNode.isNumber()) {
                    return priceNode.asDouble();
                }
                if (priceNode.isTextual()) {
                    try {
                        return Double.parseDouble(priceNode.asText());
                    } catch (NumberFormatException ex) {
                        log.debug("Could not parse {} price: {}", key, priceNode.asText());
                    }
                }
            }
        }

        return null;
    }
}