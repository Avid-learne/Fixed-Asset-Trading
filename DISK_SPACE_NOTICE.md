# ⚠️ DISK SPACE ISSUE DETECTED

Your C drive is almost full (only 0.68 GB remaining after cleanup).

## Immediate Actions Required

### Option 1: Free Up Space (Recommended)
You need at least **5-10 GB** of free space to install all dependencies. Consider:

1. **Delete Temporary Files:**
   - Windows temp folder: `C:\Windows\Temp\`
   - User temp: `%TEMP%`
   - Recycle bin

2. **Remove Large Unused Programs:**
   - Use Settings → Apps → Installed apps to uninstall unused software

3. **Move Project to Different Drive:**
   - If you have another drive (D:, E:, etc.), consider moving the project there
   - Example:
     ```powershell
     Move-Item "C:\Users\850 G5\fyp-blockchain-hospital" "D:\fyp-blockchain-hospital"
     ```

4. **Disable Windows Features:**
   - Disable Hibernate (frees 2-4 GB)
   - Disable System Restore (frees space)

### Option 2: Selective Installation (If Space Limited)

**Just the Ethereum smart contracts (smallest):**
```powershell
# Only root dependencies - 337 MB already installed
npm run hardhat compile
npm run hardhat test
# Skip frontend and backend for now
```

**Or just the Frontend:**
```powershell
cd hospital-frontend
npm install
npm run dev
# This alone requires ~500 MB
```

---

## Installation Status So Far

✓ **Root (Hardhat + Smart Contracts)** - 337 MB installed
✗ **Frontend (Next.js)** - Failed due to disk space (requires ~800 MB)
✗ **Backend Services** - Not started (requires ~500 MB each)

---

## Next Steps After Freeing Space

Once you have 5-10 GB free, run:

```powershell
# From repository root
cd "C:\Users\850 G5\fyp-blockchain-hospital"

# Clean npm cache
npm cache clean --force

# Retry frontend installation
cd hospital-frontend
npm install

# Backend services (if needed)
cd ..\backend\bank-service
mvn clean install
```

---

## Alternative: Use Docker

If disk space is a persistent issue, consider using Docker:
- Containerized environment isolates dependencies
- Can use external volumes for node_modules
- Cleaner project structure

---

## Critical Information

**What you CAN run right now with current space:**
- Smart contract compilation: `npm run hardhat compile`
- Smart contract tests: `npm run hardhat test`
- Hardhat node: `npm run hardhat node`

**What requires more space:**
- Frontend installation (~800 MB)
- Backend services (~500 MB each)
- Combined installation (~2-3 GB total after compression)

**See RUN_GUIDE.md and RUN_GUIDE.md for detailed information**
