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
- Les donnees Postgres sont persistantes via volumes Docker nommes (`db_school_data`, `db_user_data`, `db_grading_data`).
- Un `docker compose down` ou `docker compose up --build` preserve les donnees.
- `docker compose down -v` supprime volontairement les volumes et donc les donnees.
- Au boot de `Service_Grading`, une synchronisation des tables miroirs est faite depuis `Service_School` (enrollments + courses). Si `Service_School` est inaccessible, la sync est skip et aucune donnee n est modifiee (protection anti-wipe).

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
- Frontend (Vite): http://localhost:3000
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

Depuis la racine:

```bash
docker compose up -d db-user db-school db-grading
```

Verifier que les 3 DB sont up:

```bash
docker compose ps
```

Arreter uniquement les DB:

```bash
docker compose stop db-user db-school db-grading
```

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

ou docker compose up -d --build pour lancer les services et bases de données

## 6. Variables d environnement

Le projet peut fonctionner avec des valeurs par defaut, mais pour un lancement local propre (hors Docker) il est recommande d utiliser des `.env` explicites.

Fichiers recommandes:
- `Service_User/.env`
- `Service_School/.env`
- `Service_Grading/.env`
- `Gateway/.env`
- `Frontend/.env` (optionnel)

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
	- `USER_SERVICE_URL` (local conseille: `http://localhost:4001/graphql`)
	- `GRADING_SERVICE_URL` (local conseille: `http://localhost:4003/graphql`)

- Service_Grading:
	- `SCHOOL_SERVICE_URL` (local conseille: `http://localhost:4002/graphql`)

- Gateway:
	- `USER_SERVICE_URL` (local conseille: `http://localhost:4001/graphql`)
	- `SCHOOL_SERVICE_URL` (local conseille: `http://localhost:4002/graphql`)
	- `GRADING_SERVICE_URL` (local conseille: `http://localhost:4003/graphql`)

- Frontend:
	- `VITE_GATEWAY_URL` (default: `http://localhost:4000/graphql`)

Note importante (local sans Docker):
- Ne pas utiliser les hostnames Docker (`service-user`, `service-school`, `service-grading`) dans les `.env` locaux.
- Utiliser `localhost` + les ports exposes.

## 7. Fonctionnalites (alignement sujet)

### 7.1 User management

- Register (public)
- Login (JWT)
- Read users/user/me
- Update self uniquement (`updateMe`)
- Delete self uniquement (`deleteMe`)
- Reset password par token signe (`forgotPassword` / `resetPassword`)

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

Les tests ciblent le coeur metier du grading (resolvers GraphQL + regles d autorisation). Ils utilisent `vitest` avec mocks sur la couche modele, ce qui garantit qu on teste la logique applicative sans dependre d une base.

Lancement :

```bash
cd Service_Grading && npm test
```

Couverture actuelle (10 cas, `Service_Grading/src/schema/resolver/*.test.js`) :

Queries :
1. `myGrades` refuse un appel non authentifie
2. `myGrades` regroupe correctement les notes par cours
3. `gradesByStudent` refuse un role non professeur
4. `gradesByStudent` retourne les notes pour un professeur
5. `classStats` refuse un role non professeur

Mutations :
6. `createGrade` refuse un role non professeur
7. `createGrade` rejette une note hors de l intervalle 0-20
8. `createGradesForEvent` refuse un batch vide
9. `updateGrade` rejette une note inconnue
10. `deleteGrade` supprime bien une note appartenant au professeur courant
