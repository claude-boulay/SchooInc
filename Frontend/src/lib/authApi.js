const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:4000/graphql'

const LOGIN_MUTATION = `
mutation Login($input: LoginInput!) {
  User {
    login(input: $input) {
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
`

const REGISTER_MUTATION = `
mutation Register($input: RegisterInput!) {
  User {
    register(input: $input) {
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
`

const REQUEST_PASSWORD_RESET_MUTATION = `
mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
  User {
    requestPasswordReset(input: $input)
  }
}
`

const RESET_PASSWORD_MUTATION = `
mutation ResetPassword($input: ResetPasswordInput!) {
  User {
    resetPassword(input: $input)
  }
}
`

const PROFESSOR_DASHBOARD_QUERY = `
query ProfessorDashboardData {
  School {
    classes(sort: ASC, limit: 100, offset: 0) {
      items {
        id
        name
        professorId
        studentCount
        enrollments {
          classId
          studentId
          enrolledAt
        }
      }
    }
    courses {
      id
      name
      professorId
    }
  }
  User {
    users {
      id
      email
      pseudo
      role
    }
  }
}
`

const CREATE_CLASS_MUTATION = `
mutation CreateClass($input: ClassCreateInput!) {
  School {
    createClass(input: $input) {
      id
      name
      studentCount
    }
  }
}
`

const CREATE_COURSE_MUTATION = `
mutation CreateCourse($input: CourseCreateInput!) {
  School {
    createCourse(input: $input) {
      id
      name
      professorId
    }
  }
}
`

const UPDATE_CLASS_MUTATION = `
mutation UpdateClass($input: ClassUpdateInput!) {
  School {
    updateClass(input: $input) {
      id
      name
      professorId
      studentCount
    }
  }
}
`

const DELETE_CLASS_MUTATION = `
mutation DeleteClass($id: ID!) {
  School {
    deleteClass(id: $id)
  }
}
`

const UPDATE_COURSE_MUTATION = `
mutation UpdateCourse($input: CourseUpdateInput!) {
  School {
    updateCourse(input: $input) {
      id
      name
      professorId
    }
  }
}
`

const DELETE_COURSE_MUTATION = `
mutation DeleteCourse($id: ID!) {
  School {
    deleteCourse(id: $id)
  }
}
`

const ADD_STUDENT_TO_CLASS_MUTATION = `
mutation AddStudentToClass($input: AddStudentToClassInput!) {
  School {
    addStudentToClass(input: $input) {
      classId
      studentId
      enrolledAt
    }
  }
}
`

const REMOVE_STUDENT_FROM_CLASS_MUTATION = `
mutation RemoveStudentFromClass($input: RemoveStudentFromClassInput!) {
  School {
    removeStudentFromClass(input: $input)
  }
}
`

const UPDATE_ME_MUTATION = `
mutation UpdateMe($input: UpdateMeInput!) {
  User {
    updateMe(input: $input) {
      id
      email
      pseudo
      role
      createdAt
      updatedAt
    }
  }
}
`

const DELETE_ME_MUTATION = `
mutation DeleteMe {
  User {
    deleteMe
  }
}
`

async function executeGateway(query, variables) {
  const token = localStorage.getItem('schoolinc_token')
  const response = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error('Le serveur gateway est indisponible')
  }

  const payload = await response.json()

  if (payload.errors?.length) {
    throw new Error(payload.errors[0].message || 'Erreur GraphQL')
  }

  return payload.data
}

export async function loginUser({ email, password }) {
  const data = await executeGateway(LOGIN_MUTATION, {
    input: { email, password },
  })

  return data.User.login
}

export async function registerUser({ email, pseudo, password, role }) {
  const data = await executeGateway(REGISTER_MUTATION, {
    input: { email, pseudo, password, role },
  })

  return data.User.register
}

export async function requestPasswordReset({ email }) {
  const data = await executeGateway(REQUEST_PASSWORD_RESET_MUTATION, {
    input: { email },
  })

  return data.User.requestPasswordReset
}

export async function resetPassword({ token, newPassword }) {
  const data = await executeGateway(RESET_PASSWORD_MUTATION, {
    input: { token, newPassword },
  })

  return data.User.resetPassword
}

export function saveAuthSession(authPayload) {
  localStorage.setItem('schoolinc_token', authPayload.token)
  localStorage.setItem('schoolinc_user', JSON.stringify(authPayload.user))
}

export function clearAuthSession() {
  localStorage.removeItem('schoolinc_token')
  localStorage.removeItem('schoolinc_user')
}

export async function fetchProfessorDashboardData() {
  const data = await executeGateway(PROFESSOR_DASHBOARD_QUERY)

  return {
    classes: data.School.classes.items,
    courses: data.School.courses,
    students: data.User.users.filter((user) => user.role === 'STUDENT'),
  }
}

export async function createProfessorClass({ name }) {
  const data = await executeGateway(CREATE_CLASS_MUTATION, {
    input: { name },
  })

  return data.School.createClass
}

export async function createProfessorCourse({ name }) {
  const data = await executeGateway(CREATE_COURSE_MUTATION, {
    input: { name },
  })

  return data.School.createCourse
}

export async function addStudentToProfessorClass({ classId, studentId }) {
  const data = await executeGateway(ADD_STUDENT_TO_CLASS_MUTATION, {
    input: { classId, studentId },
  })

  return data.School.addStudentToClass
}

export async function removeStudentFromProfessorClass({ classId, studentId }) {
  const data = await executeGateway(REMOVE_STUDENT_FROM_CLASS_MUTATION, {
    input: { classId, studentId },
  })

  return data.School.removeStudentFromClass
}

export async function updateProfessorClass({ id, name }) {
  const data = await executeGateway(UPDATE_CLASS_MUTATION, {
    input: { id, name },
  })

  return data.School.updateClass
}

export async function deleteProfessorClass({ id }) {
  const data = await executeGateway(DELETE_CLASS_MUTATION, { id })
  return data.School.deleteClass
}

export async function updateProfessorCourse({ id, name }) {
  const data = await executeGateway(UPDATE_COURSE_MUTATION, {
    input: { id, name },
  })

  return data.School.updateCourse
}

export async function deleteProfessorCourse({ id }) {
  const data = await executeGateway(DELETE_COURSE_MUTATION, { id })
  return data.School.deleteCourse
}

export async function updateMyProfile({ email, pseudo }) {
  const input = {}

  if (email !== undefined) {
    input.email = email
  }

  if (pseudo !== undefined) {
    input.pseudo = pseudo
  }

  const data = await executeGateway(UPDATE_ME_MUTATION, { input })
  return data.User.updateMe
}

export async function deleteMyAccount() {
  const data = await executeGateway(DELETE_ME_MUTATION)
  return data.User.deleteMe
}
