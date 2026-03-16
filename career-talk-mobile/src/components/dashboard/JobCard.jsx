export default function JobCard() {
  return (
    <div style={card}>
      <div style={logo}>G</div>

      <div>
        <h3>Senior Product Manager</h3>
        <p>Google India • Bangalore • 40-55 LPA</p>
      </div>
    </div>
  );
}

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "16px",
  display: "flex",
  gap: "20px",
  marginTop: "15px",
};

const logo = {
  width: "50px",
  height: "50px",
  background: "#2563eb",
  color: "white",
  borderRadius: "12px",
  display: "grid",
  placeItems: "center",
};
