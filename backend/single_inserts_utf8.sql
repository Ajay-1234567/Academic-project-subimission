/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `deadline` datetime DEFAULT NULL,
  `facultyId` int DEFAULT NULL,
  `facultyName` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `facultyId` (`facultyId`),
  CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`facultyId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `projectId` int DEFAULT NULL,
  `facultyId` int DEFAULT NULL,
  `comments` text,
  `score` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `projectId` (`projectId`),
  KEY `facultyId` (`facultyId`),
  CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`),
  CONSTRAINT `evaluations_ibfk_2` FOREIGN KEY (`facultyId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `groupId` int NOT NULL,
  `studentId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_group` (`studentId`,`groupId`),
  KEY `groupId` (`groupId`),
  CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `student_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `group_members_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem_statements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `branch` varchar(255) DEFAULT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `difficulty` enum('Beginner','Intermediate','Advanced') DEFAULT 'Intermediate',
  `createdBy` int DEFAULT NULL,
  `assignedToFacultyId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `createdBy` (`createdBy`),
  KEY `assignedToFacultyId` (`assignedToFacultyId`),
  CONSTRAINT `problem_statements_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`),
  CONSTRAINT `problem_statements_ibfk_2` FOREIGN KEY (`assignedToFacultyId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `abstract` text,
  `repoUrl` varchar(255) DEFAULT NULL,
  `studentId` int DEFAULT NULL,
  `facultyId` int DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Submitted',
  `score` int DEFAULT NULL,
  `submittedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `semester` varchar(10) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `projectType` enum('solo','group') DEFAULT 'solo',
  `groupId` int DEFAULT NULL,
  `submitterName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `studentId` (`studentId`),
  KEY `facultyId` (`facultyId`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `users` (`id`),
  CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`facultyId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `projects` VALUES (5,'hostel management','the project is about the managing the students in hostel where we can allocate students in room and manage compliants ','https://github.com/Hrudhay777/hostel_management_system.git',13,NULL,'Submitted',NULL,'2026-03-07 04:15:04','3-2','Angular','solo',NULL,'mani');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `graduationYear` varchar(20) NOT NULL,
  `department` varchar(255) DEFAULT 'B.Tech',
  `branches` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `domain` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `sections` VALUES (5,'C','2027','B.Tech','Computer Science (CSE)','2026-03-07 03:53:32','CSW');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_faculty` (
  `studentId` int NOT NULL,
  `facultyId` int NOT NULL,
  `assignedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `subject` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`studentId`,`facultyId`),
  KEY `facultyId` (`facultyId`),
  CONSTRAINT `student_faculty_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_faculty_ibfk_2` FOREIGN KEY (`facultyId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `student_faculty` VALUES (12,2,'2026-03-07 04:03:15','Spring-Boot, Angular, Product Development');
INSERT INTO `student_faculty` VALUES (13,2,'2026-03-07 04:03:57','Angular, Spring-Boot, Product Development');
INSERT INTO `student_faculty` VALUES (14,2,'2026-03-07 04:04:42','Angular, Spring-Boot, Product Development');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `groupNumber` varchar(50) NOT NULL,
  `groupName` varchar(255) DEFAULT NULL,
  `facultyId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `facultyId` (`facultyId`),
  CONSTRAINT `student_groups_ibfk_1` FOREIGN KEY (`facultyId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `student_groups` VALUES (3,'07','team tech',2,'2026-03-06 04:10:24');
INSERT INTO `student_groups` VALUES (4,'06','team DEV',2,'2026-03-06 04:10:43');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `facultyId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `branch` varchar(255) DEFAULT NULL,
  `domain` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `facultyId` (`facultyId`),
  CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`facultyId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `subjects` VALUES (18,'Angular','B.Tech','3-2',2,'2026-03-06 07:13:50','Computer Science (CSE)','CSW');
INSERT INTO `subjects` VALUES (19,'Spring-Boot','B.Tech','3-2',2,'2026-03-06 07:14:07','Computer Science (CSE)','CSW');
INSERT INTO `subjects` VALUES (20,'Product Development','B.Tech','3-2',2,'2026-03-06 07:15:46','Computer Science (CSE)','CSW');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','faculty','admin') NOT NULL,
  `name` varchar(255) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `assignedFacultyId` int DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `academicYear` varchar(20) DEFAULT NULL,
  `rollNumber` varchar(50) DEFAULT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `section` varchar(255) DEFAULT NULL,
  `domain` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `users` VALUES (2,NULL,'balramsir','faculty','Mr. Balram Sir',NULL,NULL,NULL,'balramsir@gmail.com',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `users` VALUES (4,NULL,'aswinsir','faculty','Mr. Aswin Sir',NULL,NULL,NULL,'aswinsir@gmail.com',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `users` VALUES (6,NULL,'Admin@123','admin','Admin',NULL,NULL,NULL,'admin@gmail.com',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `users` VALUES (12,'231801340005@cutmap.ac.in','abc@123','student','G Ajay Kumar','B.Tech','Spring-Boot, Angular, Product Development',NULL,'231801340005@cutmap.ac.in','3rd Year','231801340005','Computer Science (CSE)','C','CSW');
INSERT INTO `users` VALUES (13,'231801120026@cutmap.ac.in','abc@123','student','Mani','B.Tech','Angular, Spring-Boot, Product Development',NULL,'231801120026@cutmap.ac.in','3rd Year','231801120026','Computer Science (CSE)','C','CSW');
INSERT INTO `users` VALUES (14,'231801120023@cutmap.ac.in','abc@123','student','Hrudhay','B.Tech','Angular, Spring-Boot, Product Development',NULL,'231801120023@cutmap.ac.in','3rd Year','231801120023','Computer Science (CSE)','C','CSW');
