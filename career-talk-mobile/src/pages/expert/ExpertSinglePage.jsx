import { useState } from "react";
import "./ExpertSinglePage.css";

export default function ExpertSinglePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    experience: ""
  });

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [errors, setErrors] = useState({});

  // 🔹 Validate all fields
  const validate = (data, skillsList) => {
    let temp = {};

    Object.keys(data).forEach((key) => {
      if (!data[key].toString().trim()) {
        temp[key] = "Field is mandatory";
      }
    });

    if (skillsList.length === 0) {
      temp.skills = "At least one skill is required";
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // 🔹 Handle input change
  const handleChange = (e) => {
    const updatedForm = {
      ...form,
      [e.target.name]: e.target.value
    };
    setForm(updatedForm);
    validate(updatedForm, skills);
  };

  // 🔹 Add skill
  const addSkill = () => {
    const normalizedSkill = skillInput.trim().toLowerCase();
    if (!normalizedSkill) return;

    if (!skills.includes(normalizedSkill)) {
      const updatedSkills = [...skills, normalizedSkill];
      setSkills(updatedSkills);
      setSkillInput("");
      validate(form, updatedSkills);
    }
  };

  // 🔹 Add skill on Enter
  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // 🔹 Remove skill
  const removeSkill = (skill) => {
    const updatedSkills = skills.filter((s) => s !== skill);
    setSkills(updatedSkills);
    validate(form, updatedSkills);
  };

  // 🔹 Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate(form, skills)) {
      alert("Expert Registration Successful ✅");

      console.log({
        ...form,
        skills
      });
    }
  };

  // 🔹 Enable submit only when valid
  const isFormValid =
    Object.values(form).every((value) => value.toString().trim() !== "") &&
    skills.length > 0 &&
    Object.keys(errors).length === 0;

  return (
    <div className="expert-container">
      <div className="expert-card">

        {/* LEFT PANEL */}
        <div className="left-panel">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Expert"
          />
          <h2>Expert</h2>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <h2>Expert Registration</h2>

          <form onSubmit={handleSubmit} noValidate>

            {/* NAME */}
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <p className="error">{errors.name}</p>}
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <p className="error">{errors.email}</p>}
            </div>

            {/* MOBILE */}
            <div className="form-group">
              <input
                type="text"
                name="mobile"
                placeholder="Mobile Number"
                value={form.mobile}
                onChange={handleChange}
              />
              {errors.mobile && <p className="error">{errors.mobile}</p>}
            </div>

            {/* EXPERIENCE */}
            <div className="form-group">
              <input
                type="number"
                name="experience"
                placeholder="Experience (Years)"
                value={form.experience}
                onChange={handleChange}
              />
              {errors.experience && (
                <p className="error">{errors.experience}</p>
              )}
            </div>

            {/* SKILLS INPUT */}
            <div className="form-group">
              <div className="skill-input-box">
                <input
                  type="text"
                  placeholder="Enter skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                />
                <button type="button" onClick={addSkill}>
                  + Add
                </button>
              </div>
              {errors.skills && <p className="error">{errors.skills}</p>}
            {/* SKILLS LIST */}
{skills.length > 0 && (
  <div className="skills-list">
    <h4>Added Skills</h4>
    <ul>
      {skills.map((skill, index) => (
        <li key={index} className="skill-item">
          <span className="skill-name">
            {index + 1}. {skill}
          </span>

          <button
            type="button"
            className="remove-skill-btn"
            onClick={() => removeSkill(skill)}
          >
            −
          </button>
        </li>
      ))}
    </ul>
  </div>
)}
</div>

            <button type="submit" disabled={!isFormValid}>
              Submit
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
