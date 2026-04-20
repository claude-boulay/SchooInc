# SchooInc - Requêtes de test GraphQL via l API Gateway

## Endpoint Gateway
- URL : http://localhost:4000/graphql
- Méthode : POST
- Content-Type : application/json

## Important
- Toutes les requêtes ci-dessous sont prévues pour le schéma exposé par le Gateway.
- Les champs racines sont encapsulés par service : User, School, Grading.
- Pour les opérations protégées, envoyer le header Authorization : Bearer TOKEN.

---

## 1. Vérification rapide du Gateway

Objectif : vérifier que le Gateway répond.

    query PingGateway {
      User {
        users {
          id
        }
      }
    }

---

## 2. Gestion des utilisateurs et authentification

### 2.1 Inscription étudiant (public)

    mutation RegisterStudent {
      User {
        register(
          input: {
            email: "student1@test.com"
            pseudo: "student1"
            password: "Pass1234!"
            role: STUDENT
          }
        ) {
          token
          user {
            id
            email
            pseudo
            role
          }
        }
      }
    }

### 2.2 Inscription professeur (public)

    mutation RegisterProfessor {
      User {
        register(
          input: {
            email: "prof1@test.com"
            pseudo: "prof1"
            password: "Pass1234!"
            role: PROFESSOR
          }
        ) {
          token
          user {
            id
            email
            pseudo
            role
          }
        }
      }
    }

### 2.3 Connexion (public)

    mutation Login {
      User {
        login(
          input: {
            email: "student1@test.com"
            password: "Pass1234!"
          }
        ) {
          token
          user {
            id
            email
            pseudo
            role
          }
        }
      }
    }

### 2.4 Profil courant (protégé)

    query Me {
      User {
        me {
          id
          email
          pseudo
          role
          createdAt
          updatedAt
        }
      }
    }

### 2.5 Mise à jour de mon profil (protégé)

    mutation UpdateMe {
      User {
        updateMe(input: { pseudo: "student1_updated" }) {
          id
          email
          pseudo
          role
          updatedAt
        }
      }
    }

### 2.6 Suppression de mon compte (protégé)

    mutation DeleteMe {
      User {
        deleteMe
      }
    }

---

## 3. Service School (classes et cours)

### 3.1 Liste des classes triée (lecture publique)

    query ListClasses {
      School {
        classes(sort: ASC, limit: 20, offset: 0) {
          total
          hasNext
          items {
            id
            name
            professorId
            studentCount
          }
        }
      }
    }

### 3.2 Détail d une classe (lecture publique)

    query GetClass($id: ID!) {
      School {
        class(id: $id) {
          id
          name
          professorId
          studentCount
          enrollments {
            classId
            studentId
          }
          courses {
            id
            name
          }
        }
      }
    }

Variables :

    {
      "id": "PUT_CLASS_ID_HERE"
    }

### 3.3 Création de classe (professeur, protégé)

    mutation CreateClass {
      School {
        createClass(input: { name: "L3-Info-A" }) {
          id
          name
          professorId
          studentCount
        }
      }
    }

### 3.4 Mise à jour de classe (professeur, protégé)

    mutation UpdateClass($id: ID!) {
      School {
        updateClass(input: { id: $id, name: "L3-Info-A-Updated" }) {
          id
          name
        }
      }
    }

Variables :

    {
      "id": "PUT_CLASS_ID_HERE"
    }

### 3.5 Ajouter un étudiant à une classe (professeur, protégé)

    mutation AddStudentToClass($classId: ID!, $studentId: ID!) {
      School {
        addStudentToClass(input: { classId: $classId, studentId: $studentId }) {
          classId
          studentId
          enrolledAt
        }
      }
    }

Variables :

    {
      "classId": "PUT_CLASS_ID_HERE",
      "studentId": "PUT_STUDENT_ID_HERE"
    }

### 3.6 Création de cours (professeur, protégé)

    mutation CreateCourse {
      School {
        createCourse(input: { name: "GraphQL" }) {
          id
          name
          professorId
        }
      }
    }

### 3.7 Associer un cours à une classe (professeur, protégé)

    mutation AddCourseToClass($classId: ID!, $courseId: ID!) {
      School {
        addCourseToClass(input: { classId: $classId, courseId: $courseId })
      }
    }

Variables :

    {
      "classId": "PUT_CLASS_ID_HERE",
      "courseId": "PUT_COURSE_ID_HERE"
    }

### 3.8 Suppression de classe (professeur, protégé)

Note : doit échouer si des étudiants sont inscrits dans la classe.

    mutation DeleteClass($id: ID!) {
      School {
        deleteClass(id: $id)
      }
    }

Variables :

    {
      "id": "PUT_CLASS_ID_HERE"
    }

---

## 4. Service Grading

### 4.1 Mes notes (étudiant, protégé)

    query MyGrades {
      Grading {
        myGrades {
          courseId
          courseName
          grades {
            id
            value
            comment
            studentId
            courseId
            professorId
            createdAt
          }
        }
      }
    }

### 4.2 Notes par cours (protégé)

    query GradesByCourse($courseId: ID!) {
      Grading {
        gradesByCourse(courseId: $courseId) {
          id
          value
          comment
          studentId
          courseId
          professorId
        }
      }
    }

Variables :

    {
      "courseId": "PUT_COURSE_ID_HERE"
    }

### 4.3 Créer une note (professeur, protégé)

    mutation CreateGrade($studentId: ID!, $courseId: ID!) {
      Grading {
        createGrade(
          input: {
            value: 14.5
            studentId: $studentId
            courseId: $courseId
            comment: "Good progress"
          }
        ) {
          id
          value
          studentId
          courseId
          professorId
          comment
        }
      }
    }

Variables :

    {
      "studentId": "PUT_STUDENT_ID_HERE",
      "courseId": "PUT_COURSE_ID_HERE"
    }

### 4.4 Mettre à jour une note (professeur, protégé)

    mutation UpdateGrade($id: ID!) {
      Grading {
        updateGrade(input: { id: $id, value: 15.0, comment: "Updated after review" }) {
          id
          value
          comment
          updatedAt
        }
      }
    }

Variables :

    {
      "id": "PUT_GRADE_ID_HERE"
    }

### 4.5 Supprimer une note (professeur, protégé)

    mutation DeleteGrade($id: ID!) {
      Grading {
        deleteGrade(id: $id)
      }
    }

Variables :

    {
      "id": "PUT_GRADE_ID_HERE"
    }

---

## 5. Statistiques professeur

### 5.1 Statistiques d un étudiant

    query StudentStats($studentId: ID!, $courseId: ID) {
      Grading {
        studentStats(studentId: $studentId, courseId: $courseId) {
          median
          minGrade
          maxGrade
          average
          count
        }
      }
    }

Variables :

    {
      "studentId": "PUT_STUDENT_ID_HERE",
      "courseId": null
    }

### 5.2 Statistiques d un cours

    query CourseStats($courseId: ID!) {
      Grading {
        courseStats(courseId: $courseId) {
          median
          minGrade
          maxGrade
          average
          count
        }
      }
    }

Variables :

    {
      "courseId": "PUT_COURSE_ID_HERE"
    }

### 5.3 Statistiques d une classe

    query ClassStats($classId: ID!) {
      Grading {
        classStats(classId: $classId) {
          median
          minGrade
          maxGrade
          average
          count
        }
      }
    }

Variables :

    {
      "classId": "PUT_CLASS_ID_HERE"
    }

---
