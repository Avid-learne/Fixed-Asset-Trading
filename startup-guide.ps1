# Blockchain Hospital - Startup All Services Script
# This script helps you understand what to run in separate terminals

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Blockchain Hospital - Startup Guide" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This project requires running multiple services in separate terminals." -ForegroundColor Yellow
Write-Host "Please follow these steps:" -ForegroundColor Yellow
Write-Host ""

Write-Host "PREREQUISITES:" -ForegroundColor Cyan
Write-Host "1. PostgreSQL is running on localhost:5432"
Write-Host "2. Redis is running on localhost:6379"
Write-Host "3. Kafka is running on localhost:9092"
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TERMINAL 1: Hardhat Ethereum Node" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "cd $PWD"
Write-Host "npm run hardhat node"
Write-Host ""
Write-Host "^ This must be running before you start the frontend"
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TERMINAL 2: Bank Service (Port 8080)" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "cd $PWD/backend/bank-service"
Write-Host "mvn spring-boot:run"
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TERMINAL 3: Hospital Service (Port 8081)" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "cd $PWD/backend/hospital-service"
Write-Host "mvn spring-boot:run"
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TERMINAL 4: Patient Service (Port 8082)" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "cd $PWD/backend/patient-service"
Write-Host "mvn spring-boot:run"
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TERMINAL 5: Frontend (Port 3000)" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "cd $PWD/hospital-frontend"
Write-Host "npm run dev"
Write-Host ""
Write-Host "^ Frontend will be available at http://localhost:3000"
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "QUICK COMMANDS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To compile smart contracts:"
Write-Host "  npm run hardhat compile"
Write-Host ""
Write-Host "To deploy smart contracts:"
Write-Host "  npm run hardhat ignition deploy ignition/modules/Counter.ts"
Write-Host ""
Write-Host "To run smart contract tests:"
Write-Host "  npm run hardhat test"
Write-Host ""

Write-Host "================================" -ForegroundColor Green
Write-Host "For more details, see RUN_GUIDE.md" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
