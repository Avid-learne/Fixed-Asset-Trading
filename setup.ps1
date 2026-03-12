# Blockchain Hospital - Complete Setup Script
# Run this script to install all dependencies for the project

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Blockchain Hospital Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js v18+" -ForegroundColor Red
    exit 1
}

$javaVersion = java -version 2>&1 | Select-String "version" | Out-String
if ($javaVersion) {
    Write-Host "✓ Java found" -ForegroundColor Green
} else {
    Write-Host "✗ Java not found. Please install JDK 21+" -ForegroundColor Red
    exit 1
}

$mavenVersion = mvn --version 2>$null | Select-String "Apache Maven" | Out-String
if ($mavenVersion) {
    Write-Host "✓ Maven found" -ForegroundColor Green
} else {
    Write-Host "! Maven not found. Backend services may not build." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 1: Installing Root Dependencies (Smart Contracts & Hardhat)" -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Root dependencies installed" -ForegroundColor Green
Write-Host ""

# Frontend dependencies
Write-Host "Step 2: Installing Frontend Dependencies (Next.js)" -ForegroundColor Cyan
Push-Location "hospital-frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Pop-Location
Write-Host ""

# Backend services
Write-Host "Step 3: Installing Backend Dependencies (Spring Boot Services)" -ForegroundColor Cyan
Write-Host ""

$services = @("bank-service", "hospital-service", "patient-service")

foreach ($service in $services) {
    Write-Host "Installing $service..." -ForegroundColor Yellow
    Push-Location "backend/$service"
    
    # Clean and install
    mvn clean install -q
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $service installed" -ForegroundColor Green
    } else {
        Write-Host "! Warning: $service build had issues" -ForegroundColor Yellow
    }
    
    Pop-Location
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review and configure backend services:"
Write-Host "   - backend/*/src/main/resources/application.properties"
Write-Host ""
Write-Host "2. Ensure PostgreSQL, Redis, and Kafka are running"
Write-Host ""
Write-Host "3. Start the services in separate terminals:" -ForegroundColor Cyan
Write-Host "   Terminal 1: npm run hardhat node"
Write-Host "   Terminal 2: cd backend/bank-service && mvn spring-boot:run"
Write-Host "   Terminal 3: cd backend/hospital-service && mvn spring-boot:run"
Write-Host "   Terminal 4: cd backend/patient-service && mvn spring-boot:run"
Write-Host "   Terminal 5: cd hospital-frontend && npm run dev"
Write-Host ""
Write-Host "See RUN_GUIDE.md for detailed instructions"
Write-Host ""
