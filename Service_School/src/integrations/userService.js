const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://service-user:4001/graphql";

const USERS_QUERY = `
  query ExistingUsers {
    users {
      id
      role
    }
  }
`;

export const fetchExistingProfessorIds = async () => {
  try {
    const response = await fetch(USER_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: USERS_QUERY }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const users = payload?.data?.users;

    if (!Array.isArray(users)) {
      return null;
    }

    return users
      .filter((user) => user.role === "PROFESSOR")
      .map((user) => user.id);
  } catch {
    return null;
  }
};
