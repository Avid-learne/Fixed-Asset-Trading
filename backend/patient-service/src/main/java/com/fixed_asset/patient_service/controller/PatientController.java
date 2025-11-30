package com.fixed_asset.patient_service.controller;

import com.fixed_asset.patient_service.dto.PatientDTO;
import com.fixed_asset.patient_service.model.Patient;
import com.fixed_asset.patient_service.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @PostMapping("/register")
    public ResponseEntity<Patient> registerPatient(@RequestBody Patient patient) {
        Patient registeredPatient = patientService.registerPatient(patient);
        return ResponseEntity.ok(registeredPatient);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Long id) {
        PatientDTO patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<PatientDTO> getPatientByEmail(@PathVariable String email) {
        PatientDTO patient = patientService.getPatientByEmail(email);
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/registration/{registrationId}")
    public ResponseEntity<PatientDTO> getPatientByRegistrationId(@PathVariable String registrationId) {
        PatientDTO patient = patientService.getPatientByRegistrationId(registrationId);
        return ResponseEntity.ok(patient);
    }

    @GetMapping
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        List<PatientDTO> patients = patientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient patientDetails) {
        Patient updatedPatient = patientService.updatePatient(id, patientDetails);
        return ResponseEntity.ok(updatedPatient);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/tokens")
    public ResponseEntity<PatientDTO> updateTokenBalances(
            @PathVariable Long id,
            @RequestParam Double assetTokenBalance,
            @RequestParam Double healthTokenBalance) {
        PatientDTO updatedPatient = patientService.updateTokenBalances(id, assetTokenBalance, healthTokenBalance);
        return ResponseEntity.ok(updatedPatient);
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<Boolean> checkEmailExists(@PathVariable String email) {
        boolean exists = patientService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }
}