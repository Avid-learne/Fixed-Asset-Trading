#!/usr/bin/env pwsh
# Quick Start - Run Individual Components

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("contracts", "node", "frontend", "bank", "hospital", "patient", "all")]
    [string]$Component = "node"
)

$rootPath = "C:\Users\850 G5\fyp-blockchain-hospital"

function Show-Help {
    Write-Host ""
    Write-Host "Blockchain Hospital - Quick Start" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\quick-start.ps1 -Component [component]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Components:" -ForegroundColor Cyan
    Write-Host "  contracts  - Compile smart contracts" -ForegroundColor White
    Write-Host "  node       - Start Hardhat Ethereum node (DEFAULT)" -ForegroundColor White
    Write-Host "  frontend   - Start Next.js frontend (http://localhost:3000)" -ForegroundColor White
    Write-Host "  bank       - Start Bank Service (http://localhost:8080)" -ForegroundColor White
    Write-Host "  hospital   - Start Hospital Service (http://localhost:8081)" -ForegroundColor White
    Write-Host "  patient    - Start Patient Service (http://localhost:8082)" -ForegroundColor White
    Write-Host "  all        - Start all services (requires multiple terminals)" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\quick-start.ps1 -Component node       # Start Hardhat node" -ForegroundColor Gray
    Write-Host "  .\quick-start.ps1 -Component frontend   # Start frontend" -ForegroundColor Gray
    Write-Host "  .\quick-start.ps1 -Component contracts  # Compile contracts" -ForegroundColor Gray
    Write-Host ""
}

function Start-Contracts {
    Write-Host "Compiling smart contracts..." -ForegroundColor Cyan
    cd $rootPath
    npx hardhat compile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Contracts compiled successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Compilation failed" -ForegroundColor Red
    }
}

function Start-Node {
    Write-Host "Starting Hardhat Ethereum node..." -ForegroundColor Cyan
    Write-Host "Node will be available at http://localhost:8545" -ForegroundColor Yellow
    cd $rootPath
    npx hardhat node
}

function Start-Frontend {
    Write-Host "Starting Next.js frontend..." -ForegroundColor Cyan
    Write-Host "Frontend will be available at http://localhost:3000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Requirements:" -ForegroundColor Yellow
    Write-Host "  - Make sure Hardhat node is running (Terminal 1: npx hardhat node)" -ForegroundColor Gray
    Write-Host "  - Frontend dependencies installed (npm install in hospital-frontend/)" -ForegroundColor Gray
    Write-Host ""
    cd "$rootPath\hospital-frontend"
    npm run dev
}

function Start-BankService {
    Write-Host "Starting Bank Service..." -ForegroundColor Cyan
    Write-Host "Service will be available at http://localhost:8080" -ForegroundColor Yellow
    cd "$rootPath\backend\bank-service"
    mvn spring-boot:run
}

function Start-HospitalService {
    Write-Host "Starting Hospital Service..." -ForegroundColor Cyan
    Write-Host "Service will be available at http://localhost:8081" -ForegroundColor Yellow
    cd "$rootPath\backend\hospital-service"
    mvn spring-boot:run
}

function Start-PatientService {
    Write-Host "Starting Patient Service..." -ForegroundColor Cyan
    Write-Host "Service will be available at http://localhost:8082" -ForegroundColor Yellow
    cd "$rootPath\backend\patient-service"
    mvn spring-boot:run
}

function Start-All {
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "Starting all services requires multiple terminals" -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Run each command in a SEPARATE TERMINAL:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Terminal 1:" -ForegroundColor Cyan
    Write-Host "  cd '$rootPath'" -ForegroundColor Gray
    Write-Host "  npx hardhat node" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Terminal 2:" -ForegroundColor Cyan
    Write-Host "  cd '$rootPath\backend\bank-service'" -ForegroundColor Gray
    Write-Host "  mvn spring-boot:run" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Terminal 3:" -ForegroundColor Cyan
    Write-Host "  cd '$rootPath\backend\hospital-service'" -ForegroundColor Gray
    Write-Host "  mvn spring-boot:run" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Terminal 4:" -ForegroundColor Cyan
    Write-Host "  cd '$rootPath\backend\patient-service'" -ForegroundColor Gray
    Write-Host "  mvn spring-boot:run" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Terminal 5:" -ForegroundColor Cyan
    Write-Host "  cd '$rootPath\hospital-frontend'" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
    Write-Host ""
}

# Main logic
if ($Component -eq "") {
    Show-Help
    exit 0
}

Write-Host ""
Write-Host "Blockchain Hospital - Quick Start" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

switch ($Component) {
    "contracts" { Start-Contracts }
    "node" { Start-Node }
    "frontend" { Start-Frontend }
    "bank" { Start-BankService }
    "hospital" { Start-HospitalService }
    "patient" { Start-PatientService }
    "all" { Start-All }
    default { Show-Help }
}
