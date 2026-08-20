import { createContext, useContext, useState } from "react";
import { api } from "../api";
const GroupContext = createContext(null);
export function GroupProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function fetchGroups() {
    setLoading(true);
    try {
      const data = await api("/api/groups");
      setGroups(data);
      return data;
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  async function fetchAllExpenses() {
      setLoading(true);
  try {
    const data = await api("/api/expenses/all");
    setAllExpenses(data);
    return data;
  } catch (e) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
}
  async function createGroup(name, memberIds, identifier) {
    const group = await api("/api/groups", {
      method: "POST",
      body: JSON.stringify({ name, memberIds, identifier }),
    });
    setGroups((current) => [group, ...current]);
    return group;
  }
  async function inviteToGroup(id, identifier) {
    const data = await api(`/api/groups/${id}/invite`, {
      method: "POST",
      body: JSON.stringify({ identifier }),
    });
    setGroups((current) =>
      current.map((group) => (group._id === id ? data : group)),
    );
    return data;
  }
  async function fetchUsers() {
    const data = await api("/api/groups/users");
    setUsers(data);
    return data;
  }
  return (
    <GroupContext.Provider
      value={{
        groups,
        users,
        allExpenses,
        loading,
        error,
        fetchGroups,
        fetchAllExpenses,
        fetchUsers,
        createGroup,
        inviteToGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}
export const useGroups = () => useContext(GroupContext);
