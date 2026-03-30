# AT Trading System - Complete Documentation Index

Complete reference for the Asset Token (AT) Trading implementation in the FYP Blockchain Hospital project.

## 📚 Documentation Files

### Core Implementation
1. **[AT_TRADING_IMPLEMENTATION.md](AT_TRADING_IMPLEMENTATION.md)** (500+ lines)
   - Complete system architecture overview
   - Entity descriptions with SQL and JPA code
   - Service layer documentation
   - API endpoint specifications
   - Workflow diagrams
   - Conversion rate reference
   - Integration points

2. **[AT_TRADING_QUICK_REFERENCE.md](AT_TRADING_QUICK_REFERENCE.md)** (600+ lines)
   - Quick start guide
   - API usage examples (6 endpoints) with curl commands
   - Integration code snippets for:
     - Asset Deposit Module
     - Marketplace/Trade Module
     - Wallet/Token Module
     - Settlement Module
   - Frontend integration (Next.js/TypeScript examples)
   - Unit test examples
   - Database initialization SQL
   - Performance tuning guide

### Integration & Setup
3. **[AT_TRADING_IMPLEMENTATION_CHECKLIST.md](AT_TRADING_IMPLEMENTATION_CHECKLIST.md)** (NEW)
   - Implementation status tracking
   - Step-by-step integration instructions
   - Code examples for integrating with existing services
   - Testing procedures (unit, integration, API)
   - Verification checklist
   - Deployment checklist
   - Troubleshooting guide

### API Reference
4. **[AT_TRADING_API_EXAMPLES.md](AT_TRADING_API_EXAMPLES.md)** (NEW)
   - HTTP request examples for all endpoints
   - Real curl commands
   - Request/response formats
   - Error scenarios
   - Complete lifecycle walkthroughs
   - Testing scenarios
   - Calculation examples

---

## 🎯 Quick Start Path

### For Developers Implementing This
1. Read [AT_TRADING_IMPLEMENTATION_CHECKLIST.md](AT_TRADING_IMPLEMENTATION_CHECKLIST.md) - Overview & integration steps
2. Reference [AT_TRADING_API_EXAMPLES.md](AT_TRADING_API_EXAMPLES.md) - See real usage examples
3. Use [AT_TRADING_QUICK_REFERENCE.md](AT_TRADING_QUICK_REFERENCE.md) - Code snippets for integration
4. Check [AT_TRADING_IMPLEMENTATION.md](AT_TRADING_IMPLEMENTATION.md) - Deep dive on architecture

### For API Integration Only
1. Start with [AT_TRADING_API_EXAMPLES.md](AT_TRADING_API_EXAMPLES.md) - Understand endpoints
2. Reference [AT_TRADING_QUICK_REFERENCE.md](AT_TRADING_QUICK_REFERENCE.md) - Integration code
3. Check error codes in API docs when issues arise

### For Frontend Developers
1. See [AT_TRADING_QUICK_REFERENCE.md](AT_TRADING_QUICK_REFERENCE.md) - React/Next.js component examples
2. Use [AT_TRADING_API_EXAMPLES.md](AT_TRADING_API_EXAMPLES.md) - API endpoint contracts
3. Check [AT_TRADING_IMPLEMENTATION.md](AT_TRADING_IMPLEMENTATION.md) - Business logic explanation

---

## 📁 Source Code Files

### Java Backend Classes
All files created in `SehatVaultBackend/src/main/java/com/SehatVault/SehatVaultBackend/marketplace/`

#### Entities
- `entity/PatientAtAssignment.java` - Tracks patient's AT with availability status
- `entity/TradeParticipation.java` - Records AT allocation to specific trades
- `entity/MonthlyHtDistribution.java` - Tracks monthly 5% HT distributions
- `entity/TradeAtSettlement.java` - Records final settlement and HT issuance
- `entity/PatientAtWithdrawalRequest.java` - Manages withdrawal requests with approval flow

#### Data Access
- `repository/PatientAtAssignmentRepository.java` - 7 custom queries for AT assignments
- `repository/TradeParticipationRepository.java` - 7 custom queries for participations
- `repository/MonthlyHtDistributionRepository.java` - 7 custom queries for distributions
- `repository/TradeAtSettlementRepository.java` - 6 custom queries including aggregations
- `repository/PatientAtWithdrawalRequestRepository.java` - 6 custom queries for requests

#### Business Logic
- `service/AtTradingService.java` - Core orchestration (14+ methods, ~400 lines)
- `service/AtTradingService.AtStatusSummary` - Inner DTO for status aggregation

#### API
- `controller/AtTradingController.java` - REST endpoints (6 endpoints, ~200 lines)

#### DTOs
- `dto/PatientAtAssignmentDto.java`
- `dto/TradeParticipationDto.java`
- `dto/MonthlyHtDistributionDto.java`
- `dto/TradeAtSettlementDto.java`
- `dto/PatientAtWithdrawalRequestDto.java`
- `dto/AtStatusSummaryDto.java`
- `dto/AtTradingRequestDto.java` - Contains request DTO classes

#### Scheduled Tasks (Create New File)
- `scheduler/MonthlyHtDistributionScheduler.java` - Monthly distribution automation

---

## 🔄 Data Flow Overview

```
Asset Deposit Approved
    ↓
Initialize AT Assignment (AVAILABLE)
    ↓
Patient Chooses to Participate in Trade
    ↓
Start Trade with AT
    → Creates TradeParticipation
    → Marks AT UNAVAILABLE
    → Schedules Monthly HT (5%)
    ↓
Trade Active (Multiple Months)
    → Each month: Create MonthlyHtDistribution
    → Patient may request withdrawal (PENDING → APPROVED → RETRIEVED)
    ↓
Trade Closes/Settles
    → Calculate profit/loss
    → Issue profit-based HT
    → Return AT to AVAILABLE
    → Process pending withdrawals
    → Create TradeAtSettlement record
    ↓
Patient Token Balance Updated
    → Add monthly HT + profit HT
    → Mark AT available again
```

---

## 🔑 Key Calculations

### Asset to AT Conversion
```
1 PKR asset value = 0.1 AT
Example: 100 PKR asset = 10 AT
```

### AT to PKR Monetary Value
```
1 AT = 10 PKR (monetary value)
Example: 5 AT participating in trade = 50 PKR monetary value
```

### Monthly HT Distribution (5%)
```
Monthly HT per participation = AT Monetary Value × 0.05
Example: 5 AT (50 PKR) in trade
  → Monthly HT = 50 × 0.05 = 2.5 HT per month
  → 3 months = 7.5 HT total
```

### Profit-Based HT Distribution
```
If trade profit = 100 PKR:
  → Per AT: 100 PKR ÷ total AT in trade = profit per AT
  → Profit HT = profit amount × 0.1
  
Example: 5 AT at 100 PKR trade profit
  → 100 PKR × 0.1 = 10 HT
  → if split among 5 AT: 2 HT per AT
```

### Total HT at Settlement
```
Total HT = Monthly HT (all months) + Profit HT
Example:
  - 3 months × 2.5 HT/month = 7.5 HT
  - Profit = 10 HT
  - Total = 17.5 HT to patient
```

---

## 📊 Current Status

### ✅ Completed
- [x] Database schema updated (34 tables)
- [x] All 5 entity classes created
- [x] All 5 repositories with custom queries
- [x] Service layer (14+ business methods)
- [x] REST controller (6 endpoints)
- [x] All DTOs for request/response
- [x] Comprehensive documentation (4 files, 2000+ lines)

### 🔄 In Progress
- [ ] Copy code into actual Spring Boot project
- [ ] Create unit tests
- [ ] Create integration tests
- [ ] Database migrations
- [ ] API testing with Postman

### ⏳ Next Steps
- [ ] Integration with MarketplaceService
- [ ] Integration with AssetDepositService
- [ ] Scheduled task for monthly distributions
- [ ] Integration with wallet/token balance
- [ ] Frontend components
- [ ] Production deployment

---

## 🧪 Testing Reference

### Unit Test Coverage
- AT initialization
- Monthly HT calculation (5% formula)
- Trade participation workflow
- Withdrawal request lifecycle
- Trade settlement calculations
- Profit HT distribution
- Error handling

### Integration Test Scenarios
- Complete AT trading lifecycle
- Multiple concurrent trades
- Withdrawal request approval flow
- Monthly distribution processing
- Trade settlement with various profit/loss scenarios

### API Test Coverage
- All 6 endpoints with valid data
- Error cases (insufficient AT, invalid IDs, etc.)
- Edge cases (withdrawal limits, negative profit, etc.)
- Performance tests (bulk operations)

See [AT_TRADING_QUICK_REFERENCE.md](AT_TRADING_QUICK_REFERENCE.md) for example test code.

---

## 🔗 Dependencies & Integrations

### Within Marketplace Module
- `MarketplaceService` - Calls AT Trading Service for trade execution
- `MarketplaceTradeRepository` - Referenced for trade lookups
- `Trade` entity - Referenced in all trading operations

### External Module Integrations
- **Asset Deposit**: Call `initializeAtAssignment()` when asset approved
- **Wallet/Token**: Update `PatientTokenBalance` with HT amounts
- **Settlement**: Reference TradeAtSettlement for final accounting
- **Notifications**: Notify patients on withdrawal approvals

### Database Tables Required
All created in schema.sql:
- `patient_at_assignments`
- `trade_participations`
- `monthly_ht_distributions`
- `trade_at_settlements`
- `patient_at_withdrawal_requests`

---

## 📖 Example Usage

### Get Patient's AT Status
```bash
GET /api/marketplace/at-trading/patient/{patientId}/status
Response: totalAt, availableAt, unavailableAt, pendingHT, activeTradeCount
```

### Start Trade with AT
```bash
POST /api/marketplace/at-trading/trades/start-with-at
Body: {tradeId, patientId, assetId, assignmentId, atAmount}
Response: TradeParticipationDto with monthlyHtAmount calculated
```

### Request AT Withdrawal
```bash
POST /api/marketplace/at-trading/withdrawals/request
Body: {patientId, assetId, tradeId, assignmentId, reason}
Response: PatientAtWithdrawalRequestDto with PENDING status
```

See [AT_TRADING_API_EXAMPLES.md](AT_TRADING_API_EXAMPLES.md) for complete examples.

---

## 🚀 Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing (unit, integration, API)
- [ ] Database migrations applied
- [ ] Schema verified in production environment
- [ ] Scheduled tasks configured
- [ ] Monitoring/alerting set up
- [ ] Documentation reviewed by team
- [ ] API contracts confirmed
- [ ] Performance tested (bulk operations)
- [ ] Rollback plan documented

---

## 📞 Support & Troubleshooting

### Common Issues
1. **Entities not recognized** - Check @Entity annotations and package scanning
2. **Repositories not created** - Verify @Repository annotation and extension of JpaRepository
3. **Scheduled tasks not running** - Add @EnableScheduling to main application
4. **Incorrect HT calculations** - Verify BigDecimal operations and conversion rates

See [AT_TRADING_IMPLEMENTATION_CHECKLIST.md](AT_TRADING_IMPLEMENTATION_CHECKLIST.md) for detailed troubleshooting.

---

## 📝 Version History

- **v1.0** (Current) - Complete implementation with endpoints, entities, repositories, service
- Includes all 5 entities, 5 repositories, service, controller, DTOs
- Supports monthly HT distributions (5%), profit-based HT, withdrawal requests
- Full documentation with examples

---

## 🎓 Learning Resources

For understanding the system better:
1. **Database Design**: See schema in documentation/schema.sql
2. **Business Logic**: Read [AT_TRADING_IMPLEMENTATION.md](AT_TRADING_IMPLEMENTATION.md) workflows section
3. **API Design**: Check [AT_TRADING_API_EXAMPLES.md](AT_TRADING_API_EXAMPLES.md) for endpoint patterns
4. **Integration Code**: Reference [AT_TRADING_QUICK_REFERENCE.md](AT_TRADING_QUICK_REFERENCE.md) snippets
5. **Testing**: Review example test code in quick reference

---

**Last Updated**: February 2024
**Status**: Complete - Ready for Integration
**Next Review**: After unit test implementation

