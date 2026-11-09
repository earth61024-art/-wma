# Security Specification: Wat Mai Amataros School Infirmary App

## 1. Data Invariants
1. **School Info**: Only authenticated school personnel / admins may mutate master infirmary configuration (`/school_info/{infoId}`). Public readers can view school location, operating hours, and contact details.
2. **Student Health Records**: Every student record in `/students/{studentDocId}` must have a valid string ID, studentId matching `^[a-zA-Z0-9_-]+$`, full name (max 150 chars), grade, room, and valid gender. Blood type, if provided, must be in `['A', 'B', 'AB', 'O', 'ไม่ระบุ']`.
3. **Visit Records**: `/visit_records/{recordId}` must record accurate timestamps, student identity, care result, and staff recorder name (`recordedBy`). Unbounded or oversized strings (>1000 chars) are blocked to prevent wallet exhaustion.
4. **Parent Submissions**: Parents can submit health surveys into `/parent_submissions/{submissionId}`. Payloads require student name, grade, room, parent contact phone, and submission timestamp.

## 2. The Dirty Dozen Payloads (Negative Tests)
1. **Ghost Field Injection**: Adding `isVerified: true` or `isAdmin: true` into a student record.
2. **Path Traversal / Junk ID**: Writing to a document ID with characters like `../../admin`.
3. **Huge Payload (Denial of Wallet)**: Submitting a `symptomDetail` or `notes` containing 500,000 characters.
4. **Invalid Enum**: Setting `bloodType: "XYZ"` or `gender: "Alien"`.
5. **Unauthorized Overwrite of School Info**: An unauthenticated client attempting to update emergency contacts or nurse name.
6. **Unbounded Symptoms Array**: Submitting a visit record with 5,000 array elements.
7. **Negative Temperature / Out of Bounds**: Recording a student temperature of 999.0 or -50.
8. **Tampered Timestamp**: Client forging future `createdAt` date strings or modifying immutable creation identifiers.
9. **Missing Required Fields**: Submitting a visit record without `careResult` or `recordedBy`.
10. **Malformed Student ID**: Injecting HTML/SQL script characters into `studentId`.
11. **Malicious Parent Submission**: Deleting existing parent forms without authentication.
12. **Blanket Query Scraping**: Attempting arbitrary wildcard query enumeration bypassing collection boundary constraints.

## 3. Test Runner
Verification tests ensure all dirty dozen payloads return `PERMISSION_DENIED` and schema compliance is strictly enforced.
