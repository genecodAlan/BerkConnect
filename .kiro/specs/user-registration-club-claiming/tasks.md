# Implementation Plan

- [x] 1. Create database user repository and service layer





  - Implement UserRepository class with upsert, findByEmail, and findById methods
  - Create database connection utilities with proper error handling and connection pooling
  - Add TypeScript interfaces for DatabaseUser and UserData models
  - _Requirements: 1.1, 1.2, 3.1, 3.2, 4.1_
  

- [x] 1.1 Implement UserRepository with atomic operations


  - Write upsertUser method that handles both INSERT and UPDATE operations
  - Implement findByEmail and findById methods with proper error handling
  - Add database transaction support for atomic user operations
  - _Requirements: 1.1, 1.2, 3.1, 3.2_

- [x] 1.2 Create user service layer with validation


  - Implement UserService class that wraps UserRepository operations
  - Add email domain validation for Berkeley Prep requirements
  - Create user profile update methods with data validation
  - _Requirements: 1.3, 3.5, 4.3_

- [ ]* 1.3 Write unit tests for user repository and service
  - Create unit tests for UserRepository CRUD operations
  - Write tests for UserService validation logic
  - Add tests for error handling scenarios and edge cases
  - _Requirements: 1.1, 1.2, 3.1, 3.2_

- [x] 2. Refactor authentication context to use database-first approach





  - Remove localStorage dependency from auth-context.tsx
  - Update authentication flow to call database user upsert on login
  - Implement getUserFromDatabase method to retrieve user data
  - _Requirements: 1.1, 1.2, 4.1, 4.2, 4.4_

- [x] 2.1 Update auth context to eliminate localStorage usage


  - Remove all localStorage.getItem and setItem calls from auth-context.tsx
  - Replace localStorage user profile retrieval with database queries
  - Update user state management to use database as single source of truth
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 2.2 Implement atomic authentication and registration flow


  - Modify handleAuthSuccess to call UserRepository.upsertUser immediately after Azure AD success
  - Add proper error handling for database failures during authentication
  - Implement transaction rollback if user creation fails
  - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3_

- [x] 2.3 Update createProfile method to use database operations


  - Replace localStorage profile creation with database user upsert
  - Remove profile creation step by making it part of authentication flow
  - Update user profile updates to call database directly
  - _Requirements: 1.1, 1.2, 4.1, 4.4_

- [ ]* 2.4 Write integration tests for authentication flow
  - Create tests for Azure AD authentication to database registration flow
  - Write tests for authentication failure scenarios and rollback behavior
  - Add tests for user profile updates and persistence
  - _Requirements: 1.1, 1.2, 3.1, 3.2_

- [x] 3. Create club claiming service with atomic operations






  - Implement ClubClaimingService class with atomic claim operations
  - Add validateClaimEligibility method to check if club can be claimed
  - Create getClubWithLeadership method to retrieve club data with president info
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2_

- [ ] 3.1 Implement atomic club claiming transaction
  - Write claimClub method that updates clubs table and creates club_members record in single transaction
  - Add database-level constraints to prevent concurrent claims on same club
  - Implement proper transaction rollback on any failure during claim process
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.3, 5.4_

- [ ] 3.2 Add club claim validation and eligibility checking
  - Implement validateClaimEligibility to check is_claimed status and prevent double claims
  - Add user existence validation before allowing club claims
  - Create proper error responses for different claim failure scenarios
  - _Requirements: 2.5, 5.1, 5.2, 5.5_

- [ ] 3.3 Create club data retrieval with leadership information
  - Implement getClubWithLeadership method that joins clubs and users tables
  - Add member count calculation and leadership role information
  - Create TypeScript interfaces for ClubWithLeadership and ClaimResult models
  - _Requirements: 5.1, 5.2_

- [ ]* 3.4 Write unit tests for club claiming service
  - Create tests for atomic club claiming operations
  - Write tests for concurrent claim attempt handling
  - Add tests for validation logic and error scenarios
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.3, 5.4_

- [ ] 4. Update club claiming API endpoint to use new service
  - Refactor /api/clubs/[id]/claim/route.ts to use ClubClaimingService
  - Remove manual user sync logic and rely on authentication flow for user creation
  - Implement proper error responses and status codes for different failure scenarios
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4.1 Simplify club claim API endpoint logic
  - Replace existing complex claim logic with ClubClaimingService.claimClub call
  - Remove user existence checking and manual user creation from claim endpoint
  - Update API response format to match ClaimResult interface
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4.2 Add proper error handling and status codes
  - Implement specific HTTP status codes for different claim failure scenarios
  - Add detailed error messages for user feedback
  - Create consistent error response format across all endpoints
  - _Requirements: 2.5, 5.5_

- [ ]* 4.3 Write API endpoint tests
  - Create integration tests for club claiming API endpoint
  - Write tests for different error scenarios and status codes
  - Add tests for concurrent API requests and race condition handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5. Update user sync API to work with new authentication flow
  - Refactor /api/users/sync/route.ts to be called automatically during authentication
  - Remove manual sync requirements from club claiming and other operations
  - Add proper validation and error handling for user data
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 5.1 Refactor user sync API for automatic operation
  - Update user sync endpoint to be called internally during authentication flow
  - Remove external dependencies on manual user sync operations
  - Add proper request validation and sanitization
  - _Requirements: 1.1, 1.2, 3.1, 3.4_

- [ ] 5.2 Add comprehensive user data validation
  - Implement email domain validation in user sync endpoint
  - Add required field validation for user creation
  - Create proper error responses for validation failures
  - _Requirements: 1.3, 1.5, 3.5_

- [ ]* 5.3 Write tests for user sync API
  - Create tests for user sync endpoint validation logic
  - Write tests for error handling and edge cases
  - Add tests for integration with authentication flow
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 6. Update frontend components to reflect new architecture
  - Update claim-club-dialog.tsx to use simplified claiming flow
  - Remove profile creation dependencies from login flow
  - Update error handling and user feedback in UI components
  - _Requirements: 2.1, 2.2, 2.5, 4.4, 5.2, 5.5_

- [ ] 6.1 Simplify club claiming dialog component
  - Remove complex user validation logic from claim-club-dialog.tsx
  - Update claim button to call simplified API endpoint
  - Add proper loading states and error feedback for claim operations
  - _Requirements: 2.1, 2.2, 2.5_

- [ ] 6.2 Update login screen to remove profile creation step
  - Modify login-screen.tsx to eliminate separate profile creation flow
  - Update authentication success handling to proceed directly to main application
  - Remove profile creation form and related validation logic
  - _Requirements: 1.1, 1.2, 4.4_

- [ ] 6.3 Enhance error handling and user feedback
  - Update all components to display specific error messages from new API responses
  - Add retry mechanisms for transient failures
  - Implement proper loading states during authentication and claim operations
  - _Requirements: 2.5, 3.3, 5.5_

- [ ]* 6.4 Write component tests for updated UI
  - Create tests for updated claim dialog component
  - Write tests for simplified login flow
  - Add tests for error handling and user feedback scenarios
  - _Requirements: 2.1, 2.2, 2.5, 4.4_

- [ ] 7. Add database migrations and constraints
  - Create database migration scripts for any schema changes needed
  - Add proper indexes for performance optimization on frequently queried fields
  - Implement database-level constraints to prevent data inconsistencies
  - _Requirements: 3.2, 5.3, 5.4_

- [ ] 7.1 Create database indexes for performance
  - Add indexes on users.email, clubs.is_claimed, and club_members.club_id fields
  - Create composite indexes for frequently joined tables
  - Add database performance monitoring and query optimization
  - _Requirements: 5.3, 5.4_

- [ ] 7.2 Add database constraints for data integrity
  - Implement unique constraints to prevent duplicate club claims
  - Add foreign key constraints with proper cascade behavior
  - Create check constraints for data validation at database level
  - _Requirements: 3.2, 5.3, 5.4_

- [ ]* 7.3 Write database migration tests
  - Create tests for database migration scripts
  - Write tests for constraint enforcement and data integrity
  - Add tests for performance impact of new indexes
  - _Requirements: 3.2, 5.3, 5.4_