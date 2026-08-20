export default function SplitForm({
  members,
  totalAmount,
  splitType,
  splits,
  onChange,
}) {
  const equal = Number(totalAmount || 0) / Math.max(members.length, 1);
  const values =
    splitType === "equal"
      ? members.map((member) => ({
          userId: member._id,
          amount: Number(equal.toFixed(2)),
        }))
      : splits;
  return (
    <div className="split-list">
      {members.map((member) => {
        const split = values.find(
          (value) => String(value.userId) === String(member._id),
        );
        return (
          <label key={member._id}>
            {member.fullName}
            <input
              type="number"
              min="0"
              step="0.01"
              readOnly={splitType === "equal"}
              value={split?.amount ?? ""}
              onChange={(e) =>
                onChange(
                  members.map((item) =>
                    item._id === member._id
                      ? { userId: item._id, amount: e.target.value }
                      : splits.find((value) => value.userId === item._id) || {
                          userId: item._id,
                          amount: 0,
                        },
                  ),
                )
              }
            />
          </label>
        );
      })}
      {splitType === "exact" && (
        <small
          className={
            Math.abs(
              values.reduce((a, s) => a + Number(s.amount || 0), 0) -
                Number(totalAmount || 0),
            ) > 0.01
              ? "form-error"
              : "form-success"
          }
        >
          Split total: $
          {values.reduce((a, s) => a + Number(s.amount || 0), 0).toFixed(2)} / $
          {Number(totalAmount || 0).toFixed(2)}
        </small>
      )}
    </div>
  );
}
