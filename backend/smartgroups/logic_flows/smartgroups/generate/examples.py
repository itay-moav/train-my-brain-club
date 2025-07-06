examples_list=[
    (
        "I need all the users who come from the feed and work at organization 3 and 4, exclude from that group all VPs.",
        r"""
<?php
/*************************************************************
 * Get all users from the ‘peoplesoft’ feed in org 3 or 4,
 * excluding any with manager level ‘VP’.
 *************************************************************/
$Main = \Manager\EducationGroup\SmartGroups\Rules\API::FeedEmployees('peoplesoft'); // all feed users

$Orgs = \Manager\EducationGroup\SmartGroups\Rules\API::Union()
    ->union_includes(
        \Manager\EducationGroup\SmartGroups\Rules\API::Org(3),
        \Manager\EducationGroup\SmartGroups\Rules\API::Org(4)
    ); // users in org 3 or 4

$Exclude = \Manager\EducationGroup\SmartGroups\Rules\API::FeedManagerLevel('VP'); // all VPs

return $Main
    ->intersect($Orgs->subtract($Exclude)); // apply intersection and exclusion
    """),

# -----------

    (
        "Anyone whose LMS account was created in org 6 on or after 2021-03-29, excluding learners in depts 5059, 509 and exclusions group 12210.",
        r"""
<?php
/*************************************************************
 * FS#1046 - EDUCATION GROUP | MMMC New Associate Orientation 
 * - Created in org 6 on or after 2021-03-29
 * - Exclude departments 5059, 509
 * - Exclude group 12210 (Orientation Exclusions)
 *************************************************************/
$Main = \Manager\EducationGroup\SmartGroups\Rules\API::RbacUserCreatedInORGAfterYearMonthDay(
    organization_id: 6,
    year: '2021',
    month: '03',
    day: '29'
);

$Excl = \Manager\EducationGroup\SmartGroups\Rules\API::Union()
    ->union_includes(
        \Manager\EducationGroup\SmartGroups\Rules\API::Dep(5059),
        \Manager\EducationGroup\SmartGroups\Rules\API::Dep(509),
        \Manager\EducationGroup\SmartGroups\Rules\API::Group(12210)
    );

$Main->intersect($Excl);

return $Main;
    """),

# -----------

    (
        r""" 
MedStar Health Environmental Services | ID = 18466 | SSM-1965

1. All feed associates
2. Within business unit 70730
3. Primary and Secondary Job
4. With Job Family Area = Pharmacy 
5. Include associate Sapan Patel (Sapan.K.Patel@medstar.net) with rbac_user_id 177350
        """,
        r""" 
<?php
/**
 * 
 *  MedStar Health Environmental Services | ID = 18466 | SSM-1965
 * 
 * Education Group Rule Inclusions
 * 
 * 
 * List all the rules that will include learners to the education group:
 * 
 * 1. All feed associates
 * 2. Within business unit 70730
 * 3. Primary and Secondary Job
 * 4. With Job Family Area = Pharmacy
 * 5. Include associate Sapan Patel (Sapan.K.Patel@medstar.net / rbac_user_id = 177350)
 * Education Group Rules Exclusions
 * 
 * 
 * List all the rules that will exclude learners from the education group:
 * 
 * 1.
 * 2.
 * 3.
 */

$Main  = \Manager\EducationGroup\SmartGroups\Rules\API::Union();
$BusinessUnit_70730 = \Manager\EducationGroup\SmartGroups\Rules\API::BusinessUnit('70730');
$JobFamilyAreaRule  = \Manager\EducationGroup\SmartGroups\Rules\API::FeedJobFamilyArea('Pharmacy');
$BusinessUnit_70730->intersect($JobFamilyAreaRule);
$IncludeSingleAssociate = \Manager\EducationGroup\SmartGroups\Rules\API::StaticSET(ids:[177350]);
$Main->union_includes(
    $BusinessUnit_70730,
    $IncludeSingleAssociate
);
return $Main;
    """),

# -----------

    (
        r""" 
-	Include current active associates assigned to Job Family Specialty = Talent Acquisition
-	Include primary and secondary jobs 
-	Include temps (Reg/Temp = T) and contractor/contingent workers (Org Rel = CWR) in PeopleSoft
-      Include the following non-feed contractors

        Ava Brendle Williams Ava.BrendleWilliams@medstar.net 
        Kimberley Bridges kimberley.l.bridges@medstar.net   
        Shamera Hughes shamera.c.hughes@medstar.net  
        Taisha Lawson ttslawson@yahoo.com ( Taisha.T.Lawson@medstar.net ) 
        Roha Qureshi rohaqureshi@gmail.com ( Roha.Qureshi@medstar.net ) 
        Ashlei Mclean Ashlei.N.Mclean@medstar.net 
        Jordan Stack Jordan.E.Stack@medstar.net 
        Natalie Gobell nataliemgobell@gmail.com
        with rbac_user_id 249031,259914,256380,245697,236994,243584,238279,246543
        """,
        r""" 
<?php
/**
 * 
 *  Talent Acquisition Education Group | ID = 18433 | SSM-1940
 * 
 *  Education Group Rule Inclusions
 * List all the rules that will include learners to the education group:
 * 
 * -	Include current active associates assigned to Job Family Specialty = Talent Acquisition
 * -	Include primary and secondary jobs 
 * -	Include temps (Reg/Temp = T) and contractor/contingent workers (Org Rel = CWR) in PeopleSoft
 * 
 * Education Group Rules Exclusions
 * 
 * 
 * List all the rules that will exclude learners from the education group:
 * 
 * 1.
 * 2.
 * 3.
 */
$Main = \Manager\EducationGroup\SmartGroups\Rules\API::Union();
$TalentAcquisitionJob = \Manager\EducationGroup\SmartGroups\Rules\API::FeedJobFamilySpecialty('Talent Acquisition');
$Users = \Manager\EducationGroup\SmartGroups\Rules\API::StaticSET(human_name: 'manual_usersTAContractors',ids: [249031,259914,256380,245697,236994,243584,238279,246543]);
$Main->union_includes($TalentAcquisitionJob, $Users);
return $Main;
    """),

# -----------

    (
        r"""
List all the rules that will include learners to the education group:

1. All feed accounts
2. Within location 40101 (FSMC)
3. Within the following cost centers/departments
    40050	Food Srvs-Nutrition
    40110	Laundry
    40230	Warehouse
    42510	Environ Srvs
    42520	Facil Mgt-Plant Oper
    42521	Facil Mgt-Mnt
    42530	Grounds Maintenance
    42540	Clinical Engineering
    42550	Facil Mgt-Protection Srvs
    45305	Patient Access
    45310	Patient Access
    45311	Patient Access
    45312	Patient Access
    45315	Patient Access
    32680	Ambu-Wound Care Clin
    52061	IS - Switchboard
    52205	Patient Experience

4. Within location 40102 (MUMH)
5. Within the following departments
    25260	Img Srvs-MRI
    37625	Patient Transportation
    40050	Food Srvs-Nutrition
    40110	Laundry
    40230	Warehouse
    42510	Environ Srvs
    42520	Facil Mgt-Plant Oper
    42550	Facil Mgt-Protection Srvs
    45310	Patient Access
    45311	Patient Access
    45315	Patient Access
    25120	Cardiac-Catheter Lab
    25210	Img Srvs-Radiology
    25220	Img Srvs-Ultrasound
    25230	Img Srvs-Spec Procedures
    25240	Img Srvs-Nuclear Med
    25250	Img Srvs-CT Scan
    25292	Img Srvs-Support Srvs
    25301	Clin Lab-Core Lab
    25340	Clin Lab-Blood Bank
    25510	Pathology-Admn
    25591	Lab-Specimen Collection
    25810	Pharmacy-Institutional
    42521	Facil Mgt-Mnt
    42530	Grounds Maintenance
    42540	Clinical Engineering

6. Within location 40103 (MGSH)
7. Within the following departments
    25260	Img Srvs-MRI
    40050	Food Srvs-Nutrition
    40110	Laundry
    40230	Warehouse
    42510	Environ Srvs
    42520	Facil Mgt-Plant Oper
    42522	Trnsprt Patient Shuttle Service
    42550	Facil Mgt-Protection Srvs
    45310	Patient Access
    45311	Patient Access
    45315	Patient Access
    57577	Patient Logistics
    25210	Img Srvs-Radiology
    25220	Img Srvs-Ultrasound
    25230	Img Srvs-Spec Procedures
    25240	Img Srvs-Nuclear Med
    25250	Img Srvs-CT Scan
    25292	Img Srvs-Support Srvs
    25301	Clin Lab-Core Lab
    25330	Clin Lab - Bacteriology
    25340	Clin Lab-Blood Bank
    25510	Pathology-Admn
    25591	Lab-Specimen Collection
    25810	Pharmacy-Institutional
    42521	Facil Mgt-Mnt
    42530	Grounds Maintenance
    42540	Clinical Engineering

8. Within location 40105 (MHH)
9. Within the following departments
    25210	Img Srvs-Radiology
    25230	Img Srvs-Spec Procedures
    25240	Img Srvs-Nuclear Med
    25250	Img Srvs-CT Scan
    25260	Img Srvs-MRI
    25292	Img Srvs-Support Srvs
    25301	Clin Lab-Core Lab
    25340	Clin Lab-Blood Bank
    25591	Lab-Specimen Collection
    25810	Pharmacy-Institutional
    37625	Patient Transport
    40050	Food Srvs-Nutrition
    40230	Warehouse
    42510	Environ Srvs
    42520	Facil Mgt-Plant Oper
    42521	Facil Mgt-Mnt
    42530	Grounds Maintenance
    42550	Facil Mgt-Protection Srvs
    45310	Patient Access
    45311	Patient Access
    45315	Patient Access
    52061	IS - Switchboard
    25220	Img Srvs-Ultrasound
    25510	Pathology-Admn
    40110	Laundry
    42540	Clinical Engineering
        """,
        r""" 
<?php

/**
 *  Staffing and Scheduling Education Group - Phase I | ID = 18394 | SSM-1915
 *
 *  Education Group Rule Inclusions
    List all the rules that will include learners to the education group:
1. All feed accounts
2. Within location 40101 (FSMC)
3. Within the following cost centers/departments
    40050	Food Srvs-Nutrition
    40110	Laundry
    40230	Warehouse
    42510	Environ Srvs
    42520	Facil Mgt-Plant Oper
    42521	Facil Mgt-Mnt
    42530	Grounds Maintenance
    42540	Clinical Engineering
    42550	Facil Mgt-Protection Srvs
    45305	Patient Access
    45310	Patient Access
    45311	Patient Access
    45312	Patient Access
    45315	Patient Access
    32680	Ambu-Wound Care Clin
    52061	IS - Switchboard
    52205	Patient Experience
    
4. Within location 40102 (MUMH)
5. Within the following departments
    25260	Img Srvs-MRI
    37625	Patient Transportation
    40050	Food Srvs-Nutrition
    40110	Laundry
    40230	Warehouse
    42510	Environ Srvs
    42520	Facil Mgt-Plant Oper
    42550	Facil Mgt-Protection Srvs
    45310	Patient Access
    45311	Patient Access
    45315	Patient Access
    25120	Cardiac-Catheter Lab
    25210	Img Srvs-Radiology
    25220	Img Srvs-Ultrasound
    25230	Img Srvs-Spec Procedures
    25240	Img Srvs-Nuclear Med
    25250	Img Srvs-CT Scan
    25292	Img Srvs-Support Srvs
    25301	Clin Lab-Core Lab
    25340	Clin Lab-Blood Bank
    25510	Pathology-Admn
    25591	Lab-Specimen Collection
    25810	Pharmacy-Institutional
    42521	Facil Mgt-Mnt
    42530	Grounds Maintenance
    42540	Clinical Engineering
    
6. Within location 40103 (MGSH)
7. Within the following departments
    25260	Img Srvs-MRI
    40050	Food Srvs-Nutrition
    40110	Laundry
    40230	Warehouse
    42510	Environ Srvs
    42520	Facil Mgt-Plant Oper
    42522	Trnsprt Patient Shuttle Service
    42550	Facil Mgt-Protection Srvs
    45310	Patient Access
    45311	Patient Access
    45315	Patient Access
    57577	Patient Logistics
    25210	Img Srvs-Radiology
    25220	Img Srvs-Ultrasound
    25230	Img Srvs-Spec Procedures
    25240	Img Srvs-Nuclear Med
    25250	Img Srvs-CT Scan
    25292	Img Srvs-Support Srvs
    25301	Clin Lab-Core Lab
    25330	Clin Lab - Bacteriology
    25340	Clin Lab-Blood Bank
    25510	Pathology-Admn
    25591	Lab-Specimen Collection
    25810	Pharmacy-Institutional
    42521	Facil Mgt-Mnt
    42530	Grounds Maintenance
    42540	Clinical Engineering
    
8. Within location 40105 (MHH)
9. Within the following departments
    25210	Img Srvs-Radiology
    25230	Img Srvs-Spec Procedures
    25240	Img Srvs-Nuclear Med
    25250	Img Srvs-CT Scan
    25260	Img Srvs-MRI
    25292	Img Srvs-Support Srvs
    25301	Clin Lab-Core Lab
    25340	Clin Lab-Blood Bank
    25591	Lab-Specimen Collection
    25810	Pharmacy-Institutional
    37625	Patient Transport
    40050	Food Srvs-Nutrition
    40230	Warehouse
    42510	Environ Srvs
    42520	Facil Mgt-Plant Oper
    42521	Facil Mgt-Mnt
    42530	Grounds Maintenance
    42550	Facil Mgt-Protection Srvs
    45310	Patient Access
    45311	Patient Access
    45315	Patient Access
    52061	IS - Switchboard
    25220	Img Srvs-Ultrasound
    25510	Pathology-Admn
    40110	Laundry
    42540	Clinical Engineering
 *  
 **/

// All feed accounts
$Main = \Manager\EducationGroup\SmartGroups\Rules\API::FeedEmployees();

$CostCenterUnion = \Manager\EducationGroup\SmartGroups\Rules\API::Union();
$CostCenterUnion->union_include(
    //Within location 40101 (FSMC)
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-40050'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-40110'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-40230'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-42510'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-42520'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-42521'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-42530'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-42540'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-42550'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-45305'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-45310'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-45311'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-45312'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-45315'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-32680'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-52061'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40101-52205'),
    //Within location 40102 (MUMH)
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-25260'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-37625'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-40050'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-40110'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-40230'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-42510'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-42520'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-42550'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-45310'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-45311'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-45315'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-25120'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-25210'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-25220'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-25230'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-25240'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-25250'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-25292'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-25301'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-25340'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-25510'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-25591'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-25810'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-42521'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-42530'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40102-42540'),

    //Within location 40103 (MGSH)
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-25260'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-40050'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-40110'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-40230'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-42510'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-42520'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-42522'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-42550'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-45310'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-45311'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-45315'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-57577'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-25210'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-25220'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-25230'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-25240'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-25250'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-25292'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-25301'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-25330'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-25340'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-25510'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-25591'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-25810'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-42521'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-42530'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40103-42540'),

    //Within location 40105 (MHH)
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-25210'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-25230'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-25240'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-25250'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-25260'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-25292'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-25301'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-25340'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-25591'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-25810'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-37625'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-40050'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-40230'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-42510'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-42520'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-42521'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-42530'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-42550'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-45310'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-45311'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-45315'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-52061'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-25220'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-25510'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-40110'),
    \Manager\EducationGroup\SmartGroups\Rules\API::CostCenter('40105-42540'),

);

$Main->intersect($CostCenterUnion);
return $Main;
    """),

# -------------

    (
        r"""
Education Group Name


ADA Support Person Training | Job Family Area = Physician Direct Care
Education Group Description


This dynamic group will be used to capture the following JFA job specialties Physician Physician Management
Education Group ID


18,673
Education Group Owner


Brandi Alfred | Brand.Alfred@email.sitel.org
Education Group Requestor


None
Education Group Education Specialist


None
Education Group Rule Inclusions


List all the rules that will include learners to the education group:  
1. All feed accounts 
2. Primary and secondary job 
3. With job family area = Physician Direct Care 
4. With the following job family area specialties  
Physician Physician Management
Education Group Rules Exclusions


List all the rules that will exclude learners from the education group:  
1. Exclude PRN associates (OnCall or Stnd Hrs/Wk = 0.01)
        """,
        r"""
<?php
/*****************************************************
* ADA Support Person Training | Job Family Area = Physician Direct Care
*
* This dynamic group captures users with:
* - Job family area = Physician Direct Care
* - Job family specialties: Physician or Physician Management
* - Excludes PRN associates (OnCall or Stnd Hrs/Wk = 0.01)
*****************************************************/
 

// Get users with job family area "Physician Direct Care", also restricts to just feed users
$main_job_family_area = \Manager\EducationGroup\SmartGroups\Rules\API::FeedJobFamilyArea('Physician Direct Care');

// Create a union of the two job family specialties
$specialties = \Manager\EducationGroup\SmartGroups\Rules\API::Union(
    human_name: 'Physician Specialties',
    human_description: 'Physician and Physician Management specialties'
);
$specialties->union_includes(
    \Manager\EducationGroup\SmartGroups\Rules\API::FeedJobFamilySpecialty('Physician'),
    \Manager\EducationGroup\SmartGroups\Rules\API::FeedJobFamilySpecialty('Physician Management')
);
 
// Get OnCall associates "PRN associates (OnCall or Stnd Hrs/Wk = 0.01)"
$on_call_associates = \Manager\EducationGroup\SmartGroups\Rules\API::EmploymentType2('On Call');
 
// Apply the job family filter and exclude PRN associates
$main_job_family_area->intersect($specialties->subtract($on_call_associates));
 
return $main_job_family_area;
    """
    ),
]

