package com.SehatVault.SehatVaultBackend.hospital.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.SehatVault.SehatVaultBackend.hospital.entity.HospitalStaff;

/**
 * HospitalStaff Repository
 * Handles database operations for hospital staff
 */
@Repository
public interface HospitalStaffRepository extends JpaRepository<HospitalStaff, UUID> {
    
    /**
     * Find staff by hospital ID
     */
    List<HospitalStaff> findByHospital_Id(UUID hospitalId);
    
    /**
     * Find staff by user ID
     */
    Optional<HospitalStaff> findByUser_UserId(UUID userId);
    
    /**
     * Find staff by employee ID
     */
    Optional<HospitalStaff> findByEmployeeId(String employeeId);
    
    /**
     * Find staff by hospital ID and user ID
     */
    Optional<HospitalStaff> findByHospital_IdAndUser_UserId(UUID hospitalId, UUID userId);
    
    /**
     * Find all staff by hospital ID with active users (where user.status is not deleted/inactive)
     */
    @Query("SELECT hs FROM HospitalStaff hs WHERE hs.hospital.id = :hospitalId")
    List<HospitalStaff> findActiveStaffByHospitalId(@Param("hospitalId") UUID hospitalId);
    
    /**
     * Find staff by position within a hospital
     */
    List<HospitalStaff> findByHospital_IdAndPosition(UUID hospitalId, String position);
    
    /**
     * Find staff by department within a hospital
     */
    List<HospitalStaff> findByHospital_IdAndDepartment(UUID hospitalId, String department);
    
    /**
     * Find staff by hospital ID and user role (e.g., 'hospital_staff')
     * Only returns staff members whose associated user has the specified role
     */
    @Query("SELECT hs FROM HospitalStaff hs " +
           "WHERE hs.hospital.id = :hospitalId " +
           "AND hs.user.role.roleName = :roleType " +
           "AND hs.user.status = 'ACTIVE'")
    List<HospitalStaff> findByHospitalIdAndUserRole(@Param("hospitalId") UUID hospitalId, 
                                                      @Param("roleType") com.SehatVault.SehatVaultBackend.auth.entity.Role.RoleType roleType);
    
    /**
     * Find staff by hospital ID and user role with optional status filter
     * Only returns staff members whose associated user has the specified role
     */
    @Query("SELECT hs FROM HospitalStaff hs " +
           "WHERE hs.hospital.id = :hospitalId " +
           "AND hs.user.role.roleName = :roleType")
    List<HospitalStaff> findByHospitalIdAndUserRoleIgnoringStatus(@Param("hospitalId") UUID hospitalId,
                                                                   @Param("roleType") com.SehatVault.SehatVaultBackend.auth.entity.Role.RoleType roleType);
}
