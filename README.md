# SchooInc

Application web en architecture microservices GraphQL.

Le projet couvre les besoins du sujet:
- gestion utilisateurs,
- authentification JWT,
- gestion classes/cours/calendrier,
- gestion des notes,
- vue et operations professeur,
- frontend React.

## 1. Stack technique

- Frontend: React + Vite + Tailwind
- API: GraphQL (Apollo Server)
- Gateway: GraphQL Mesh (aggregation User + School + Grading)
- Base de donnees: PostgreSQL (une base par microservice)
- Orchestration: Docker Compose

## 2. Architecture

Microservices:
- Service_User (port 4001): users, auth, profile
- Service_School (port 4002): classes, courses, enrollments, calendar events
- Service_Grading (port 4003): grades + statistiques
- Gateway (port 4000): schema GraphQL unifie expose au frontend

Bases de donnees:
- auth_db (users)
- school_db (classes/courses/calendar)
- grading_db (grades)

Important:
- Les donnees Postgres sont persistantes via volumes Docker nommes.
- `docker compose down -v` supprime volontairement les volumes et donc les donnees.

## 3. Prerequis

- Docker Desktop (ou Docker Engine + Compose plugin)
- Node.js 20+ (si execution locale sans Docker)
- npm 10+

## 4. Lancement rapide (recommande)

Depuis la racine du projet:

```bash
docker compose up --build
```

En arriere-plan:

```bash
docker compose up --build -d
```

Arret:

```bash
docker compose down
```

URLs utiles:
- Frontend (Vite): http://localhost:5173
- Gateway GraphQL: http://localhost:4000/graphql
- Service User: http://localhost:4001/graphql
- Service School: http://localhost:4002/graphql
- Service Grading: http://localhost:4003/graphql

Healthchecks:
- http://localhost:4001/health
- http://localhost:4002/health
- http://localhost:4003/health

## 5. Lancement local (sans Docker)

### 5.1 Installer dependances

```bash
cd Frontend && npm install
cd ../Gateway && npm install
cd ../Service_User && npm install
cd ../Service_School && npm install
cd ../Service_Grading && npm install
```

### 5.2 Demarrer les bases PostgreSQL

Option simple: utiliser Docker uniquement pour les DB.

### 5.3 Demarrer les services

Dans 4 terminaux distincts:

```bash
cd Service_User && npm run dev
cd Service_School && npm run dev
cd Service_Grading && npm run dev
cd Gateway && npm run dev
```

Puis frontend:

```bash
cd Frontend && npm run dev
```

## 6. Variables d environnement

Le projet utilise des defaults raisonnables en local pour la plupart des variables DB, mais pour un rendu propre il est recommande d avoir des `.env` par service.

Variables principales:

- Communes backend:
	- `PORT`
	- `JWT_SECRET`

- Base de donnees:
	- `DB_HOST`
	- `DB_PORT`
	- `DB_USER`
	- `DB_PASSWORD`
	- `DB_NAME`
	- `DB_POOL_MAX`
	- `DB_IDLE_TIMEOUT_MS`
	- `DB_CONNECTION_TIMEOUT_MS`

- Service_User (auth):
	- `JWT_EXPIRES_IN`
	- `RESET_TOKEN_SECRET`
	- `RESET_TOKEN_EXPIRES_IN`
	- `BCRYPT_SALT_ROUNDS`

- Service_School:
	- `USER_SERVICE_URL` (utilise pour purge des classes/cours orphelins)

- Frontend:
	- `VITE_GATEWAY_URL` (default: `http://localhost:4000/graphql`)

## 7. Fonctionnalites (alignement sujet)

### 7.1 User management

- Register (public)
- Login (JWT)
- Read users/user/me
- Update self uniquement (`updateMe`)
- Delete self uniquement (`deleteMe`)

### 7.2 Authentication

- JWT bearer transmis du frontend au gateway, puis propage vers les services
- Endpoints read publics pour School/User
- Endpoints write proteges (sauf register)

### 7.3 Classes

- Lister classes avec tri ASC/DESC
- Detail d une classe
- CRUD classes reserve professeur
- Suppression classe interdite si etudiants affectes
- Ajouter/retirer etudiant a une classe reserve professeur
- Limite de capacite: 30 etudiants max par classe

### 7.4 Courses + Calendar

- CRUD cours reserve professeur
- Creation/modification/suppression d evenements calendrier reserve professeur
- Vue publique classes/cours avec evenements
- Vue etudiant calendrier hebdomadaire (lundi-vendredi)

### 7.5 Grading

- `myGrades` (notes de l etudiant connecte)
- Grades par cours / etudiant / classe
- Statistiques: moyenne, mediane, min, max, count
- CRUD notes reserve professeur
- Notation par evenement et par lot (plusieurs etudiants sur un meme evenement)

### 7.6 Fonctionnalites professeur

- Dashboard professeur pour:
	- gerer classes/cours,
	- gerer calendrier,
	- noter un evenement pour un ou plusieurs etudiants.

## 8. Requetes GraphQL utiles (Gateway)

Exemples a lancer sur http://localhost:4000/graphql

### 8.1 Login

```graphql
mutation Login($input: LoginInput!) {
	User {
		login(input: $input) {
			token
			user { id email pseudo role }
		}
	}
}
```

Variables:

```json
{
	"input": {
		"email": "prof@example.com",
		"password": "password123"
	}
}
```

### 8.2 Classes publiques tri ASC

```graphql
query {
	School {
		classes(sort: ASC, limit: 100, offset: 0) {
			items { id name studentCount }
			total
		}
	}
}
```

### 8.3 Stats d un cours

```graphql
query CourseStats($courseId: ID!) {
	Grading {
		courseStats(courseId: $courseId) {
			average
			median
			minGrade
			maxGrade
			count
		}
	}
}
```

### 8.4 Noter un evenement (batch)

```graphql
mutation GradeEvent($input: GradeEventBatchInput!) {
	Grading {
		createGradesForEvent(input: $input) {
			id
			studentId
			value
			eventId
			courseId
		}
	}
}
```

## 9. Tests unitaires

Le sujet impose des tests sur les fonctionnalites principales.

Commande par service:

```bash
cd Service_User && npm test
cd Service_School && npm test
cd Service_Grading && npm test
```

Plan :
1. register cree un user et retourne un token
2. login refuse mauvais mot de passe
3. updateMe modifie uniquement l utilisateur courant
4. deleteMe supprime uniquement l utilisateur courant
5. createClass refuse un non-professeur
6. addStudentToClass bloque au dela de 30 etudiants
7. deleteClass refuse si etudiants inscrits
8. createGrade refuse un non-professeur
9. createGradesForEvent cree des notes pour plusieurs etudiants
10. courseStats retourne average/median/min/max corrects
