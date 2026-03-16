import { useState } from "react";
import { createExpert } from "../../api/expertApi";

export default function AddExpert({ onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    headline: "",
    bio: "",
    experience_years: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createExpert(form);

    setForm({
      name: "",
      headline: "",
      bio: "",
      experience_years: ""
    });

    onSuccess();
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Add Expert</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="headline"
            placeholder="Headline"
            value={form.headline}
            onChange={handleChange}
            style={styles.input}
          />

          <textarea
            name="bio"
            placeholder="Bio"
            value={form.bio}
            onChange={handleChange}
            style={styles.textarea}
          />

          <input
            name="experience_years"
            type="number"
            placeholder="Experience Years"
            value={form.experience_years}
            onChange={handleChange}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Add Expert
          </button>
        </form>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: "40px"
  },

  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "500px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
  },

  title: {
    marginBottom: "20px"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px"
  },

  textarea: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    minHeight: "80px",
    fontSize: "14px"
  },

  button: {
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#4f46e5",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  }
};
