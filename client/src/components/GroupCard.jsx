import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function GroupCard({ group }) {
  const { user } = useAuth();

  console.log("GroupCard group:", group);

  const visibleMembers = (group.members || []).slice(0, 2);
  const remainingMembers = Math.max(
    (group.members?.length || 0) - visibleMembers.length,
    0,
  );
  return (
    <Link className="group-card" to={`/groups/${group._id}`}>
      <div>
        <span className="group-mark">{group.name[0]}</span>
        <div>
          <h3>{group.name}</h3>
          <p>
            Created by{" "}
            {group.createdBy?._id === user?.id
              ? "you"
              : group.createdBy?.fullName || "Unknown"}{" "}.{" "}
            {new Date(group.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <div className="group-members-preview">
            {visibleMembers.map((member) => (
              <span className="member-pill" key={member._id}>
                <span className="material-symbols-outlined">👤</span>
                {member.fullName}
              </span>
            ))}

            {remainingMembers > 0 && (
              <span className="member-pill more-members">
                +{remainingMembers} more
              </span>
            )}
          </div>
        </div>
      </div>
      {/* <span className="arrow">-&gt;</span> */}
    </Link>
  );
}
